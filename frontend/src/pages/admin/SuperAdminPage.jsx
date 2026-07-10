import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { superAdminService } from "@/services";
import { Spinner, Alert, Avatar, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/helpers";
import { UserPlus, Search, Pencil, Trash2, Shield, ShieldCheck } from "lucide-react";
import Aurora from "@/component/Aurora/Aurora";
import BubbleMenu from "@/component/BubbleMenu/BubbleMenu";
import { useAuth } from "@/context/AuthContext";

// ── Role Badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: isSuperAdmin ? 'rgba(132, 0, 255, 0.2)' : 'rgba(0, 198, 255, 0.15)',
      color: isSuperAdmin ? '#c084fc' : '#67e8f9',
      border: `1px solid ${isSuperAdmin ? 'rgba(192, 132, 252, 0.3)' : 'rgba(103, 232, 249, 0.3)'}`,
    }}>
      {isSuperAdmin ? <ShieldCheck size={12} /> : <Shield size={12} />}
      {isSuperAdmin ? "Super Admin" : "Admin"}
    </span>
  );
}

// ── Admin Form ─────────────────────────────────────────────────────────────────
function AdminForm({ initial = {}, onSave, onCancel, loading, error, currentUserId }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    department: initial.department || "",
    password: "",
    role: initial.role || "ADMIN",
  });

  const isEdit = !!initial.id;
  const isSelf = initial.id === currentUserId;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const inputStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '15px',
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: '8px',
    fontSize: '14px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <Alert type="error" message={error} />}

      {/* Role selector — disabled when editing self */}
      {!isSelf && (
        <div>
          <label style={labelStyle}>Role</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {["ADMIN", "SUPER_ADMIN"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: form.role === r
                    ? '2px solid #8400ff'
                    : '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: form.role === r
                    ? 'rgba(132,0,255,0.2)'
                    : 'rgba(255,255,255,0.04)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: form.role === r ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {r === "SUPER_ADMIN" ? <ShieldCheck size={16} /> : <Shield size={16} />}
                {r === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input style={inputStyle} type="email" value={form.email} onChange={set("email")} required />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Department / Team</label>
          <input style={inputStyle} value={form.department} onChange={set("department")} placeholder="e.g. DATA ANALYTICS" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>
            {isEdit ? "New Password (leave blank to keep)" : "Password *"}
          </label>
          <input
            style={inputStyle}
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder={isEdit ? "Leave blank to keep current" : "Min 6 characters"}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '8px' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '14px 28px', borderRadius: '8px', color: '#ffffff',
            fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)',
            border: 'none', cursor: 'pointer', transition: 'background 0.2s',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={loading}
          style={{
            padding: '14px 28px', borderRadius: '8px', color: '#ffffff',
            fontWeight: 'bold', backgroundColor: '#8400ff',
            border: 'none', cursor: 'pointer', minWidth: '160px',
            display: 'flex', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(132,0,255,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {loading ? <Spinner size="sm" /> : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const { data, loading, error, execute: refresh } = useApi(
    () => superAdminService.getAdmins({ search }),
    [search]
  );

  const admins = data?.admins ?? [];

  const openCreate = () => { setFormError(""); setModal({ mode: "create" }); };
  const openEdit = (admin) => { setFormError(""); setModal({ mode: "edit", admin }); };

  const handleSave = useCallback(async (form) => {
    setSaving(true);
    setFormError("");
    try {
      if (modal.mode === "create") {
        await superAdminService.createAdmin(form);
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await superAdminService.updateAdmin(modal.admin.id, payload);
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
      await superAdminService.deleteAdmin(confirmId);
      setConfirmId(null);
      refresh();
    } catch (err) {
      console.error(err);
    }
  }, [confirmId, refresh]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px', position: 'relative' }}>

      {/* Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
        <div>
          <h3 style={{ color: "black" }}>.</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <ShieldCheck size={38} color="#c084fc" />
            <h1 style={{ fontSize: '42px', color: '#ffffff', margin: 0 }}>Team Leads</h1>
          </div>
          <br />
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginTop: '8px', marginBottom: 0 }}>
            Manage Admins and Super Admins
          </p>
        </div>

        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 25px', borderRadius: '8px', color: '#ffffff',
            backgroundColor: '#000000', border: 'none', cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 0 12px 3px rgba(192,132,252,0.2), 0 0 28px 6px rgba(192,132,252,0.15)',
            transition: 'all 0.3s',
          }}
        >
          <UserPlus size={22} color="#c084fc" /> Add Team Lead
        </button>
      </div>

      {/* Search */}
      <div style={{
        margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px',
        padding: '0 20px', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px', backgroundColor: 'rgba(13, 11, 18, 0.88)',
        backdropFilter: 'blur(12px)', width: '100%', maxWidth: '800px', height: '60px'
      }}>
        <Search size={24} color="rgba(255,255,255,0.5)" style={{ flexShrink: 0 }} />
        <input
          style={{ flex: 1, fontSize: '18px', color: '#ffffff', backgroundColor: 'transparent', border: 'none', outline: 'none', height: '100%' }}
          placeholder="Search by name, email, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}><Spinner size="lg" /></div>
      ) : admins.length === 0 ? (
        <div style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', backgroundColor: 'rgba(13, 11, 18, 0.88)', backdropFilter: 'blur(12px)', padding: '40px', textAlign: 'center' }}>
          <EmptyState
            icon={ShieldCheck}
            title={<span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '20px' }}>No team leads found</span>}
            description={<span style={{ color: 'rgba(255,255,255,0.6)' }}>{search ? "Try a different search." : "Add your first admin to get started."}</span>}
            action={!search && <button onClick={openCreate} style={{ padding: '12px 24px', marginTop: '16px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#8400ff', border: 'none', cursor: 'pointer' }}>Add Admin</button>}
          />
        </div>
      ) : (
        <div style={{
          width: '100%', overflowX: 'auto',
          backgroundColor: 'rgba(13, 11, 18, 0.88)',
          backdropFilter: 'blur(12px)', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)', padding: '16px', boxSizing: 'border-box'
        }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {["Team Lead", "Department", "Role", "Joined", "Actions"].map((h, i) => (
                  <th key={h} style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: i === 4 ? 'right' : 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isSelf = admin.id === currentUser?.id;
                return (
                  <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Avatar name={admin.name} size="sm" />
                        <div>
                          <p style={{ color: '#ffffff', fontSize: '15px', margin: 0, fontWeight: '500' }}>
                            {admin.name}
                            {isSelf && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#c084fc', backgroundColor: 'rgba(192,132,252,0.15)', padding: '2px 8px', borderRadius: '10px' }}>You</span>}
                          </p>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ffffff', fontWeight: '500' }}>
                      {admin.department || "—"}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <RoleBadge role={admin.role} />
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                      {formatDate(admin.createdAt)}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          onClick={() => openEdit(admin)}
                          style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.07)', color: '#ffffff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          title="Edit"
                        >
                          <Pencil size={17} color="#ffffff" />
                        </button>
                        <button
                          onClick={() => !isSelf && setConfirmId(admin.id)}
                          disabled={isSelf}
                          style={{
                            padding: '10px',
                            backgroundColor: isSelf ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                            color: isSelf ? 'rgba(255,255,255,0.2)' : '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          title={isSelf ? "Cannot delete your own account" : "Delete"}
                        >
                          <Trash2 size={17} color={isSelf ? "rgba(255,255,255,0.2)" : "#ffffff"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
            {admins.length} of {data?.total ?? admins.length} team lead{data?.total !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '36px', boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <ShieldCheck size={28} color="#c084fc" />
              <h2 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '900', margin: 0 }}>
                {modal.mode === "create" ? "Add Team Lead" : "Edit Team Lead"}
              </h2>
            </div>
            <AdminForm
              initial={modal.admin}
              onSave={handleSave}
              onCancel={() => setModal(null)}
              loading={saving}
              error={formError}
              currentUserId={currentUser?.id}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '36px', boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={26} color="#f87171" />
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '900', margin: '0 0 12px 0' }}>Remove Team Lead</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 28px 0' }}>
              This will permanently delete this admin account. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                onClick={() => setConfirmId(null)}
                style={{ padding: '13px 26px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{ padding: '13px 26px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer', boxShadow: '0 0 16px rgba(220,38,38,0.4)' }}
              >
                Remove
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
          { label: 'Analytics', href: '/admin/analytics', rotation: 0, hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' } },
          { label: 'Team Leads', href: '/admin/super', rotation: 0, hoverStyles: { bgColor: '#c084fc', textColor: '#ffffff' } },
        ]}
      />
    </div>
  );
}
