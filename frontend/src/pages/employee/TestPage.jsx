import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { testService } from "@/services";
import { Alert, Spinner, ProgressBar, Badge } from "@/components/ui";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from "lucide-react";

// 👉 REACT BITS: Add <CountUp> timer display from React Bits
// 👉 REACT BITS: Add <ShinyText> for question text highlight

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function TimerBar({ remaining, total }) {
  const pct = (remaining / total) * 100;
  const color = pct > 33 ? "success" : pct > 15 ? "warning" : "danger";
  const textColor = pct > 33 ? "text-emerald-600" : pct > 15 ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-center gap-3">
      <Clock size={16} className={textColor} />
      <span className={`font-mono text-sm font-semibold ${textColor}`}>{formatTime(remaining)}</span>
      <div className="flex-1">
        <ProgressBar value={remaining} max={total} color={color} />
      </div>
    </div>
  );
}

export default function TestPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("loading"); // loading | ready | active | submitting | done | error | already_done
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  // Load / resume test
  useEffect(() => {
    (async () => {
      try {
        const res = await testService.start();
        const { attempt, questions, remainingSeconds } = res.data.data;
        setAttempt(attempt);
        setQuestions(questions);
        setRemaining(remainingSeconds);
        setTotalTime(remainingSeconds);
        setPhase("ready");
      } catch (err) {
        const msg = err.response?.data?.message || "";
        if (msg.includes("already completed")) setPhase("already_done");
        else { setError(msg || "Failed to load test."); setPhase("error"); }
      }
    })();
  }, []);

  const submitTest = useCallback(async (auto = false) => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    clearInterval(timerRef.current);
    setPhase("submitting");
    try {
      const answerArray = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] || null,
      }));
      await testService.submit({ attemptId: attempt.id, answers: answerArray, autoSubmit: auto });
      navigate("/results");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
      setPhase("error");
    }
  }, [answers, attempt, questions, navigate]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, submitTest]);

  const answered = Object.keys(answers).length;
  const q = questions[current];

  if (phase === "loading") return (
    <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
  );

  if (phase === "already_done") return (
    <div className="max-w-lg mx-auto mt-16">
      <div className="card p-8 text-center">
        <div className="p-3 bg-emerald-50 rounded-full inline-flex mb-4">
          <Send size={24} className="text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Test Already Submitted</h2>
        <p className="text-sm text-slate-500 mb-5">You have already completed the MCQ test. Check your results page.</p>
        <button onClick={() => navigate("/results")} className="btn-primary">View Results</button>
      </div>
    </div>
  );

  if (phase === "error") return (
    <div className="max-w-lg mx-auto mt-16">
      <Alert type="error" message={error || "Something went wrong."} />
      <button onClick={() => navigate("/dashboard")} className="btn-secondary mt-4">Back to Dashboard</button>
    </div>
  );

  if (phase === "submitting") return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size="xl" />
      <p className="text-slate-600 font-medium">Submitting your test…</p>
    </div>
  );

  // Ready screen
  if (phase === "ready") return (
    <div className="max-w-xl mx-auto mt-12 space-y-5">
      <div className="card p-8 text-center">
        <div className="p-3 bg-brand-50 rounded-full inline-flex mb-4">
          <Clock size={24} className="text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">MCQ Assessment Test</h1>
        <p className="text-sm text-slate-500 mb-6">Read the instructions carefully before starting.</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Questions", value: questions.length },
            { label: "Duration", value: "30 min" },
            { label: "Attempts", value: "1 only" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-50 rounded-lg p-3">
              <p className="text-xl font-bold text-brand-600">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <ul className="text-left text-sm text-slate-600 space-y-2 mb-6">
          {[
            "Timer starts when you click 'Start Test'",
            "Test auto-submits when time runs out",
            "You can navigate between questions freely",
            "Unanswered questions count as wrong",
            "One attempt only — cannot be retaken",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-brand-500 mt-0.5">•</span> {item}
            </li>
          ))}
        </ul>
        <button onClick={() => setPhase("active")} className="btn-primary w-full py-3 text-base">
          Start Test
        </button>
      </div>
    </div>
  );

  // Active test
  const OPTION_KEYS = ["A", "B", "C", "D"];
  const optionValues = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Question</span>
            <Badge variant="primary">{current + 1} / {questions.length}</Badge>
            <Badge variant={answered === questions.length ? "success" : "warning"}>
              {answered} answered
            </Badge>
          </div>
          <TimerBar remaining={remaining} total={totalTime} />
        </div>
        <ProgressBar value={current + 1} max={questions.length} color="brand" />
      </div>

      {/* Low time warning */}
      {remaining < 120 && (
        <Alert type="warning" message={`Only ${formatTime(remaining)} remaining! Your test will auto-submit when time runs out.`} />
      )}

      {/* Question card */}
      <div className="card p-6 animate-fade-in">
        <div className="flex items-start gap-3 mb-6">
          <span className="flex-shrink-0 h-7 w-7 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center">
            {current + 1}
          </span>
          <h2 className="text-base font-semibold text-slate-900 leading-relaxed">{q.questionText}</h2>
        </div>

        <div className="space-y-3">
          {OPTION_KEYS.map((key) => {
            const selected = answers[q.id] === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setAnswers((p) => ({ ...p, [q.id]: key }))}
                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 text-sm ${
                  selected
                    ? "border-brand-500 bg-brand-50 text-brand-900 font-medium"
                    : "border-surface-200 bg-white hover:border-brand-300 hover:bg-surface-50 text-slate-700"
                }`}
              >
                <span className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 ${
                  selected ? "border-brand-500 bg-brand-500 text-white" : "border-surface-300 text-slate-400"
                }`}>
                  {key}
                </span>
                <span className="leading-relaxed">{optionValues[key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation + submit */}
      <div className="card p-4 flex items-center justify-between">
        <button
          onClick={() => setCurrent((p) => Math.max(0, p - 1))}
          disabled={current === 0}
          className="btn-secondary"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Question dots (mini map) */}
        <div className="hidden sm:flex flex-wrap gap-1.5 max-w-xs justify-center">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-6 w-6 rounded-md text-xs font-medium transition-colors ${
                idx === current
                  ? "gradient-brand text-white"
                  : answers[questions[idx].id]
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-surface-100 text-slate-400 hover:bg-surface-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((p) => p + 1)} className="btn-primary">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => submitTest(false)} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
            <Send size={15} /> Submit Test
          </button>
        )}
      </div>

      {/* Unanswered warning on last question */}
      {current === questions.length - 1 && answered < questions.length && (
        <Alert
          type="warning"
          message={`${questions.length - answered} question(s) unanswered. Unanswered questions will be marked as incorrect.`}
        />
      )}
    </div>
  );
}
