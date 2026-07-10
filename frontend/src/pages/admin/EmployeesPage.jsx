import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services";
import { Spinner, Alert, Avatar, Badge, EmptyState } from "@/components/ui";
import { formatDate, formatPercent } from "@/utils/helpers";
import { UserPlus, Search, Pencil, Trash2, Users } from "lucide-react";
import Lightfall from "@/component/Lightfall/Lightfall";
import BubbleMenu from "@/component/BubbleMenu/BubbleMenu";

const LIGHTFALL_COLORS = ['#8400ff', '#00c6ff', '#0072ff'];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <Alert type="error" message={error} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', color: '#ffffff', fontWeight: 'bold', marginBottom: '8px' }}>Full Name *</label>
          <input
            style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
            value={form.name}
            onChange={set("name")}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#ffffff', fontWeight: 'bold', marginBottom: '8px' }}>Email *</label>
          <input
            style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
            type="email"
            value={form.email}
            onChange={set("email")}
            required
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', color: '#ffffff', fontWeight: 'bold', marginBottom: '8px' }}>Department</label>
          <input
            style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
            value={form.department}
            onChange={set("department")}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', color: '#ffffff', fontWeight: 'bold', marginBottom: '8px' }}>{isEdit ? "New Password (leave blank to keep)" : "Password *"}</label>
          <input
            style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
            type="password"
            value={form.password}
            onChange={set("password")}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', paddingTop: '16px' }}>
        <button
          onClick={onCancel}
          className="hover:bg-white/20 transition-all duration-300"
          style={{ padding: '16px 32px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={loading}
          className="hover:bg-[#9d33ff] hover:shadow-[0_0_20px_rgba(132,0,255,0.6)] transition-all duration-300"
          style={{ padding: '16px 32px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#8400ff', border: 'none', cursor: 'pointer', minWidth: '180px', display: 'flex', justifyContent: 'center' }}
        >
          {loading ? <Spinner size="sm" /> : isEdit ? "Update Employee" : "Create Employee"}
        </button>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px', position: 'relative' }}>

      {/* 👉 THE LIGHTFALL BACKGROUND LAYER */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <Lightfall
          colors={LIGHTFALL_COLORS}
          backgroundColor="#050505"
          speed={0.8}
          streakCount={4}
          streakWidth={1.5}
          streakLength={1.2}
          glow={1.0}
          density={0.5}
          twinkle={1.0}
          zoom={2.5}
          backgroundGlow={0.3}
          opacity={1.0}
          mouseInteraction={true}
          mouseStrength={1.0}
          mouseRadius={0.8}
        />
      </div>

      {/* Centered Header Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
        <div>
          <h3 style={{ color: "black" }}>.</h3>
          <h1 style={{ fontSize: '42px', color: '#ffffff', margin: 0 }}>Employees</h1>
          <br></br>
          <p style={{ fontSize: '20px', color: '#ffffff', marginTop: '8px', marginBottom: 0 }}>
            Manage employee accounts and view progress
          </p>
        </div>

        <button
          onClick={openCreate}
          className="hover:bg-[#9d33ff] hover:shadow-[0_0_20px_rgba(132,0,255,0.7)] transition-all duration-300"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 25px', borderRadius: '8px', color: '#ffffff', backgroundColor: '#000000ff', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 0 12px 3px rgba(164, 0, 255, 0.1), 0 0 28px 6px rgba(164, 0, 255, 0.25)' }}
        >
          <UserPlus size={22} color="#ffffff" /> Add Employee
        </button>
      </div>

      {/* Centered Search Bar */}
      <div style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', backgroundColor: 'rgba(13, 11, 18, 0.88)', backdropFilter: 'blur(12px)', width: '100%', maxWidth: '800px', height: '60px' }}>
        <Search size={24} color="#ffffff" style={{ flexShrink: 0 }} />
        <input
          style={{ flex: 1, fontSize: '18px', color: '#ffffff', backgroundColor: 'transparent', border: 'none', outline: 'none', height: '100%' }}
          placeholder="Search by name, email, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Table Section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}><Spinner size="lg" /></div>
      ) : employees.length === 0 ? (
        <div style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', backgroundColor: 'rgba(13, 11, 18, 0.88)', backdropFilter: 'blur(12px)', padding: '40px', textAlign: 'center' }}>
          <EmptyState
            icon={Users}
            title={<span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '20px' }}>No employees found</span>}
            description={<span style={{ color: '#ffffff' }}>{search ? "Try a different search term." : "Add your first employee to get started."}</span>}
            action={!search && <button onClick={openCreate} style={{ padding: '12px 24px', marginTop: '16px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#8400ff', border: 'none', cursor: 'pointer' }}>Add Employee</button>}
          />
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'rgba(13, 11, 18, 0.88)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', padding: '16px', boxSizing: 'border-box' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '14px', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '14px', textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '14px', textTransform: 'uppercase' }}>Self Score</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '14px', textTransform: 'uppercase' }}>Test Score</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '14px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '14px', textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '14px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const selfDone = !!emp.selfAssessment;
                const testDone = emp.testAttempts?.length > 0;
                return (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <p style={{ color: '#ffffff', fontSize: '16px', margin: 0 }}>{emp.name}</p>
                          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ffffff', fontWeight: '500' }}>{emp.department || "—"}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {selfDone
                        ? <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{formatPercent(emp.selfAssessment.overallPercentage)}</span>
                        : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {testDone
                        ? <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{formatPercent(emp.testAttempts[0].scorePercentage)}</span>
                        : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Badge variant={selfDone ? "success" : "default"}>Self</Badge>
                        <Badge variant={testDone ? "success" : "default"}>Test</Badge>
                      </div>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ffffff', fontWeight: '500' }}>{formatDate(emp.createdAt)}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                          onClick={() => openEdit(emp)}
                          className="hover:bg-[#8400ff] hover:border-transparent hover:shadow-[0_0_15px_rgba(132,0,255,0.6)] transition-all duration-300"
                          style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Edit"
                        >
                          <Pencil size={18} color="#ffffff" />
                        </button>
                        <button
                          onClick={() => setConfirmId(emp.id)}
                          className="hover:bg-red-600 hover:border-transparent hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all duration-300"
                          style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete"
                        >
                          <Trash2 size={18} color="#ffffff" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold', color: '#ffffff', textAlign: 'right' }}>
            Showing {employees.length} of {data?.total ?? employees.length} employees
          </div>
        </div>
      )}

      {/* Forced Custom Overlay Modal for Create/Edit */}
      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', margin: '0 0 24px 0' }}>
              {modal.mode === "create" ? "Add New Employee" : "Edit Employee"}
            </h2>
            <EmployeeForm
              initial={modal.emp}
              onSave={handleSave}
              onCancel={() => setModal(null)}
              loading={saving}
              error={formError}
            />
          </div>
        </div>
      )}

      {/* Forced Custom Overlay Modal for Delete */}
      {confirmId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', margin: '0 0 16px 0' }}>Delete Employee</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.5', margin: '0 0 32px 0' }}>
              This will permanently delete the employee and all their assessment data. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button
                onClick={() => setConfirmId(null)}
                className="hover:bg-white/20 transition-all duration-300"
                style={{ padding: '14px 28px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all duration-300"
                style={{ padding: '14px 28px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <BubbleMenu
        menuBg="#8400ff"
        menuContentColor="#ffffff"
        items={[
          { label: 'Employees', href: '/admin/employees', rotation: 0, hoverStyles: { bgColor: '#a855f7', textColor: '#ffffff' } },
          { label: 'Questions', href: '/admin/questions', rotation: 0, hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' } },
          { label: 'Analytics', href: '/admin/analytics', rotation: 0, hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' } }
        ]}
      />
    </div>
  )
}
