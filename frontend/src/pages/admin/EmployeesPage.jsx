import React, { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services";
import { Spinner, Alert, Avatar, Badge, Modal, ConfirmDialog, EmptyState } from "@/components/ui";
import { formatDate, formatPercent } from "@/utils/helpers";
import { UserPlus, Search, Pencil, Trash2, Users } from "lucide-react";

function EmployeeForm({ initial = {}, onSave, onCancel, loading, error }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    department: initial.department || "",
    password: "",
  });
  const isEdit = !!initial.id;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} />}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" value={form.name} onChange={set("name")} placeholder="Aarav Shah" required />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="aarav@company.io" required />
        </div>
        <div>
          <label className="label">Department</label>
          <input className="input" value={form.department} onChange={set("department")} placeholder="Engineering" />
        </div>
        <div>
          <label className="label">{isEdit ? "New Password (leave blank to keep)" : "Password *"}</label>
          <input className="input" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={() => onSave(form)} disabled={loading} className="btn-primary">
          {loading ? <Spinner size="sm" /> : isEdit ? "Update Employee" : "Create Employee"}
        </button>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | { mode: "create" | "edit", emp?: {} }
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const { data, loading, error, execute: refresh } = useApi(
    () => adminService.getEmployees({ search }),
    [search]
  );

  const employees = data?.employees ?? [];

  const openCreate = () => { setFormError(""); setModal({ mode: "create" }); };
  const openEdit = (emp) => { setFormError(""); setModal({ mode: "edit", emp }); };

  const handleSave = useCallback(async (form) => {
    setSaving(true);
    setFormError("");
    try {
      if (modal.mode === "create") {
        await adminService.createEmployee(form);
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await adminService.updateEmployee(modal.emp.id, payload);
      }
      setModal(null);
      refresh();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  }, [modal, refresh]);

  const handleDelete = useCallback(async () => {
    try {
      await adminService.deleteEmployee(confirmId);
      setConfirmId(null);
      refresh();
    } catch (err) {
      console.error(err);
    }
  }, [confirmId, refresh]);

  return (
    <div className="space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage employee accounts and view progress</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-slate-400 flex-shrink-0" />
        <input
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
          placeholder="Search by name, email, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : employees.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No employees found"
            description={search ? "Try a different search term." : "Add your first employee to get started."}
            action={!search && <button onClick={openCreate} className="btn-primary">Add Employee</button>}
          />
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Self Score</th>
                <th>Actual Score</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const selfDone = !!emp.selfAssessment;
                const testDone = emp.testAttempts?.length > 0;
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-slate-500">{emp.department || "—"}</span></td>
                    <td>
                      {selfDone
                        ? <span className="font-medium text-brand-600">{formatPercent(emp.selfAssessment.overallPercentage)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td>
                      {testDone
                        ? <span className="font-medium text-emerald-600">{formatPercent(emp.testAttempts[0].scorePercentage)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Badge variant={selfDone ? "success" : "default"}>Self</Badge>
                        <Badge variant={testDone ? "success" : "default"}>Test</Badge>
                      </div>
                    </td>
                    <td><span className="text-slate-500">{formatDate(emp.createdAt)}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(emp)} className="p-1.5 hover:bg-brand-50 text-brand-600 rounded-lg transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setConfirmId(emp.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-surface-100 text-xs text-slate-500">
            Showing {employees.length} of {data?.total ?? employees.length} employees
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add New Employee" : "Edit Employee"}
        size="md"
      >
        {modal && (
          <EmployeeForm
            initial={modal.emp}
            onSave={handleSave}
            onCancel={() => setModal(null)}
            loading={saving}
            error={formError}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message="This will permanently delete the employee and all their assessment data. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
