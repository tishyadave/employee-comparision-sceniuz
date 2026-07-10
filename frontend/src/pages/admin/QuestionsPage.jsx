import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { questionService } from "@/services";
import { Spinner, Alert, Badge } from "@/components/ui";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import LetterGlitch from "@/component/LetterGlitch/LetterGlitch";

const OPTION_KEYS = ["A", "B", "C", "D"];
const CORRECT_OPTIONS = OPTION_KEYS;
const BLANK_FORM = {
  questionText: "", optionA: "", optionB: "", optionC: "", optionD: "",
  correctAnswer: "A", topic: "",
};

const GLITCH_COLORS = ['#1d0d2e', '#a855f7', '#6366f1'];

function QuestionForm({ initial = BLANK_FORM, onSave, onCancel, loading, error }) {
  const [form, setForm] = useState({ ...BLANK_FORM, ...initial });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <Alert type="error" message={error} />}
      <textarea
        style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
        rows={3}
        value={form.questionText}
        onChange={set("questionText")}
        placeholder="Enter question text..."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {OPTION_KEYS.map((key) => (
          <input
            key={key}
            style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
            value={form[`option${key}`]}
            onChange={set(`option${key}`)}
            placeholder={`Option ${key}`}
          />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <select style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box', width: '100%' }} value={form.correctAnswer} onChange={set("correctAnswer")}>
          {CORRECT_OPTIONS.map((o) => <option key={o} value={o} style={{ color: '#000' }}>Option {o}</option>)}
        </select>
        <input style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box', width: '100%' }} value={form.topic} onChange={set("topic")} placeholder="Topic" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
        <button onClick={onCancel} style={{ padding: '12px 24px', borderRadius: '8px', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => onSave(form)} disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', color: '#ffffff', backgroundColor: '#8400ff', border: 'none', cursor: 'pointer' }}>
          {loading ? <Spinner size="sm" /> : initial.id ? "Update" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { data, loading, error, execute: refresh } = useApi(() => questionService.getAll());
  const questions = (data?.questions ?? []).filter(q => !search || q.questionText.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()));

  const handleSave = useCallback(async (form) => {
    setSaving(true);
    try {
      if (modal.mode === "create") await questionService.create(form);
      else await questionService.update(modal.question.id, form);
      setModal(null); refresh();
    } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  }, [modal, refresh]);

  const handleDelete = useCallback(async () => {
    await questionService.delete(confirmId);
    setConfirmId(null); refresh();
  }, [confirmId, refresh]);

  const topics = [...new Set((data?.questions ?? []).map((q) => q.topic))].sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px', position: 'relative' }}>
      {/* 👉 THE LETTER GLITCH BACKGROUND LAYER */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <LetterGlitch
          glitchColors={GLITCH_COLORS}
          glitchSpeed={50}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: "black" }}> . </h3>
        <h1 style={{ fontSize: '42px', color: '#ffffff', margin: 0 }}>Question Bank</h1>
        <p style={{ fontSize: '20px', color: '#ffffff', marginTop: '8px', marginBottom: 0 }}>{(data?.questions ?? []).length} questions across {topics.length} topics</p>
        <p style={{ color: "black" }}> . </p>
        <button
          onClick={() => setModal({ mode: "create" })}
          style={{
            alignItems: 'center', gap: '10px', padding: '10px 25px', borderRadius: '8px', color: '#ffffff', backgroundColor: '#000000ff', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 0 12px 3px rgba(164, 0, 255, 0.1), 0 0 28px 6px rgba(164, 0, 255, 0.1)'
          }}
        >
          <Plus size={20} style={{ display: 'inline', marginRight: '8px' }} /> Add Question
        </button>
      </div>

      {/* Centered Search Bar with High Contrast Dark Glassmorphism */}
      <div style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', backgroundColor: 'rgba(13, 11, 18, 0.88)', backdropFilter: 'blur(12px)', width: '100%', maxWidth: '800px', height: '60px' }}>
        <Search size={22} color="#ffffff" />
        <input
          style={{ flex: 1, color: '#ffffff', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '18px' }}
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Table Section with High Contrast Dark Glassmorphism */}
      {loading ? <Spinner /> : (
        <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'rgba(13, 11, 18, 0.88)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', padding: '16px' }}>
          <table style={{ width: '100%', color: '#ffffff', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>#</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Question</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Topic</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Correct</th>
                <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td style={{ padding: '16px' }}>{idx + 1}</td>
                  <td style={{ padding: '16px' }}>{q.questionText}</td>
                  <td style={{ padding: '16px' }}><Badge variant="primary">{q.topic}</Badge></td>
                  <td style={{ padding: '16px' }}>{q.correctAnswer}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button onClick={() => setModal({ mode: "edit", question: q })} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><Pencil size={16} /></button>
                    <button onClick={() => setConfirmId(q.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', marginLeft: '12px' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', margin: '0 0 24px 0' }}> {modal.mode === "create" ? "Add Question" : "Edit Question"}</h2>
            <QuestionForm initial={modal.question} onSave={handleSave} onCancel={() => setModal(null)} loading={saving} error={formError} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', margin: '0 0 24px 0' }}> Delete question </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.5', margin: '0 0 32px 0' }}>
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button
                onClick={() => setConfirmId(null)}
                style={{ padding: '14px 28px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{ padding: '14px 28px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
