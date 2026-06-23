import React, { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { questionService } from "@/services";
import { Spinner, Alert, Badge, Modal, ConfirmDialog, EmptyState } from "@/components/ui";
import { Plus, Pencil, Trash2, HelpCircle, Search } from "lucide-react";

const OPTION_KEYS = ["A", "B", "C", "D"];
const CORRECT_OPTIONS = OPTION_KEYS;

const BLANK_FORM = {
  questionText: "", optionA: "", optionB: "", optionC: "", optionD: "",
  correctAnswer: "A", topic: "",
};

function QuestionForm({ initial = BLANK_FORM, onSave, onCancel, loading, error }) {
  const [form, setForm] = useState({ ...BLANK_FORM, ...initial });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <div>
        <label className="label">Question *</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={form.questionText}
          onChange={set("questionText")}
          placeholder="Enter the question text…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OPTION_KEYS.map((key) => (
          <div key={key}>
            <label className="label">Option {key} *</label>
            <input
              className="input"
              value={form[`option${key}`]}
              onChange={set(`option${key}`)}
              placeholder={`Option ${key}`}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Correct Answer *</label>
          <select className="input" value={form.correctAnswer} onChange={set("correctAnswer")}>
            {CORRECT_OPTIONS.map((o) => (
              <option key={o} value={o}>Option {o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Topic *</label>
          <input
            className="input"
            value={form.topic}
            onChange={set("topic")}
            placeholder="e.g. JavaScript, React, CSS"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={() => onSave(form)} disabled={loading} className="btn-primary">
          {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : initial.id ? "Update Question" : "Add Question"}
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
  const questions = (data?.questions ?? []).filter(
    (q) =>
      !search ||
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setFormError(""); setModal({ mode: "create" }); };
  const openEdit = (q) => { setFormError(""); setModal({ mode: "edit", question: q }); };

  const handleSave = useCallback(async (form) => {
    setSaving(true);
    setFormError("");
    try {
      if (modal.mode === "create") await questionService.create(form);
      else await questionService.update(modal.question.id, form);
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
      await questionService.delete(confirmId);
      setConfirmId(null);
      refresh();
    } catch (err) {
      console.error(err);
    }
  }, [confirmId, refresh]);

  // Get unique topics for quick filter badges
  const topics = [...new Set((data?.questions ?? []).map((q) => q.topic))].sort();

  return (
    <div className="space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Question Bank</h1>
          <p className="page-subtitle">{data?.count ?? 0} questions across {topics.length} topics</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Topics quick filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSearch("")} className={`badge cursor-pointer ${!search ? "bg-brand-600 text-white" : "bg-surface-100 text-slate-600 hover:bg-surface-200"}`}>
          All
        </button>
        {topics.map((t) => (
          <button key={t} onClick={() => setSearch(t)} className={`badge cursor-pointer ${search === t ? "bg-brand-600 text-white" : "bg-surface-100 text-slate-600 hover:bg-surface-200"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-slate-400 flex-shrink-0" />
        <input
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : questions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HelpCircle}
            title="No questions found"
            description={search ? "Try clearing your search." : "Add your first question to the bank."}
            action={!search && <button onClick={openCreate} className="btn-primary">Add Question</button>}
          />
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Topic</th>
                <th>Correct</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td className="text-slate-400 font-mono text-xs">{idx + 1}</td>
                  <td>
                    <p className="text-sm text-slate-800 max-w-sm line-clamp-2">{q.questionText}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {OPTION_KEYS.map((key) => (
                        <span
                          key={key}
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            key === q.correctAnswer
                              ? "bg-emerald-100 text-emerald-700 font-semibold"
                              : "bg-surface-100 text-slate-500"
                          }`}
                        >
                          {key}: {q[`option${key}`]?.slice(0, 20)}{q[`option${key}`]?.length > 20 ? "…" : ""}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td><Badge variant="primary">{q.topic}</Badge></td>
                  <td>
                    <span className="h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      {q.correctAnswer}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(q)} className="p-1.5 hover:bg-brand-50 text-brand-600 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmId(q.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add New Question" : "Edit Question"}
        size="lg"
      >
        {modal && (
          <QuestionForm
            initial={modal.question}
            onSave={handleSave}
            onCancel={() => setModal(null)}
            loading={saving}
            error={formError}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="This will permanently delete the question and all employee responses to it."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
