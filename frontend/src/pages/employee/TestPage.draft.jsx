import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { testService } from "@/services";
import { Spinner } from "@/components/ui";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from "lucide-react";

import LetterGlitch from "@/component/LetterGlitch/LetterGlitch";

const GLITCH_COLORS = ['#1d0d2e', '#a855f7', '#6366f1'];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function TimerBar({ remaining, total }) {
  const pct = (remaining / total) * 100;
  const color = pct > 33 ? "#10b981" : pct > 15 ? "#fbbf24" : "#ef4444";

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Clock size={16} color={color} />
      <span style={{ fontFamily: 'monospace', fontSize: '14px', color: color, fontWeight: 'normal' }}>
        {formatTime(remaining)}
      </span>
      <div style={{ width: '100px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

const glassCardStyle = {
  backgroundColor: 'rgba(18, 15, 23, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(168, 85, 247, 0.25)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 0 0 1px rgba(168,85,247,0.05), 0 0 12px 2px rgba(132,0,255,0.1), 0 4px 20px rgba(0,0,0,0.3)'
};

const buttonStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
  padding: '12px 24px', borderRadius: '12px',
  backgroundColor: '#8400ff', color: '#ffffff',
  border: 'none', cursor: 'pointer',
  boxShadow: '0 0 20px rgba(132,0,255,0.4)',
  fontWeight: 'normal', fontSize: '15px', transition: 'all 0.3s'
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: 'none'
};

export default function TestPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("loading");
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  const [hoveredOption, setHoveredOption] = useState(null);
  const [hoveredDot, setHoveredDot] = useState(null);

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

  // Base layout wrapper
  const BaseLayout = ({ children }) => (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <LetterGlitch
          glitchColors={GLITCH_COLORS}
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
      </div>
    </div>
  );

  if (phase === "loading") return (
    <BaseLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spinner size="lg" /></div></BaseLayout>
  );

  if (phase === "already_done") return (
    <BaseLayout>
      <div style={{ ...glassCardStyle, textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', display: 'inline-flex', marginBottom: '20px', color: '#10b981' }}>
          <Send size={32} />
        </div>
        <h2 style={{ fontSize: '24px', color: '#ffffff', marginBottom: '8px', fontWeight: 'normal' }}>Test Already Submitted</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontWeight: 'normal' }}>You have already completed the MCQ test. Check your results page.</p>
        <button onClick={() => navigate("/results")} style={{ ...buttonStyle, margin: '0 auto' }}>View Results</button>
      </div>
    </BaseLayout>
  );

  if (phase === "error") return (
    <BaseLayout>
      <div style={{ ...glassCardStyle, textAlign: 'center', borderColor: 'rgba(248,113,113,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <p style={{ color: '#f87171', fontWeight: 'normal', margin: 0 }}>{error || "Something went wrong."}</p>
        {error && error.toLowerCase().includes("self-assessment") ? (
          <button onClick={() => navigate("/self-assessment")} style={{ ...buttonStyle, margin: '0 auto' }}>
            Go to Self Assessment
          </button>
        ) : (
          <button onClick={() => navigate("/dashboard")} style={{ ...secondaryButtonStyle, margin: '0 auto' }}>
            Back to Dashboard
          </button>
        )}
      </div>
    </BaseLayout>
  );

  if (phase === "submitting") return (
    <BaseLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '20px' }}>
        <Spinner size="xl" />
        <p style={{ color: '#ffffff', fontWeight: 'normal', fontSize: '16px' }}>Submitting your test…</p>
      </div>
    </BaseLayout>
  );

  if (phase === "ready") return (
    <BaseLayout>
      <div style={{ ...glassCardStyle, textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(132, 0, 255, 0.15)', borderRadius: '50%', display: 'inline-flex', marginBottom: '24px', color: '#c084fc', boxShadow: '0 0 16px rgba(168,85,247,0.2)' }}>
          <Clock size={32} />
        </div>
        <h1 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '8px', fontWeight: 'normal' }}>MCQ Assessment Test</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontWeight: 'normal', fontSize: '15px' }}>Read the instructions carefully before starting.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: "Questions", value: questions.length },
            { label: "Duration", value: "60 min" },
            { label: "Attempts", value: "1 only" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '24px', color: '#c084fc', margin: '0 0 4px 0', fontWeight: 'normal' }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 'normal' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <ul style={{ textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '2', marginBottom: '32px', padding: 0, listStyle: 'none' }}>
          {[
            "Timer starts when you click 'Start Test'",
            "Test auto-submits when time runs out",
            "You can navigate between questions freely",
            "Unanswered questions count as wrong",
            "One attempt only — cannot be retaken",
          ].map((item) => (
            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
              <span style={{ color: '#c084fc' }}>•</span> {item}
            </li>
          ))}
        </ul>

        <button onClick={() => setPhase("active")} style={{ ...buttonStyle, width: '100%' }}>
          Start Test
        </button>
      </div>
    </BaseLayout>
  );

  // Active test rendering
  const OPTION_KEYS = ["A", "B", "C", "D"];
  const optionValues = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD };

  return (
    <BaseLayout>
      {/* Top Bar Navigation */}
      <div style={{ ...glassCardStyle, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>Question</span>
            <span style={{ padding: '4px 10px', backgroundColor: 'rgba(132, 0, 255, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', fontSize: '12px', fontWeight: 'normal' }}>
              {current + 1} / {questions.length}
            </span>
            <span style={{ padding: '4px 10px', backgroundColor: answered === questions.length ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)', color: answered === questions.length ? '#10b981' : '#fbbf24', border: answered === questions.length ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '20px', fontSize: '12px', fontWeight: 'normal' }}>
              {answered} answered
            </span>
          </div>
          <TimerBar remaining={remaining} total={totalTime} />
        </div>
        {/* Overall Test Progress Bar */}
        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${((current + 1) / questions.length) * 100}%`, height: '100%', backgroundColor: '#c084fc', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Low Time Warning */}
      {remaining < 120 && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171' }}>
          <AlertTriangle size={18} />
          <span style={{ fontSize: '14px', fontWeight: 'normal' }}>Only {formatTime(remaining)} remaining! Your test will auto-submit when time runs out.</span>
        </div>
      )}

      {/* Question Card */}
      <div style={{ ...glassCardStyle, padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px' }}>
          <span style={{ flexShrink: 0, height: '32px', width: '32px', borderRadius: '50%', backgroundColor: 'rgba(132, 0, 255, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'normal', boxShadow: '0 0 12px rgba(168,85,247,0.2)' }}>
            {current + 1}
          </span>
          <h2 style={{ fontSize: '18px', color: '#ffffff', margin: 0, lineHeight: '1.6', fontWeight: 'normal' }}>{q.questionText}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {OPTION_KEYS.map((key) => {
            const selected = answers[q.id] === key;
            const isHovered = hoveredOption === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setAnswers((p) => ({ ...p, [q.id]: key }))}
                onMouseEnter={() => setHoveredOption(key)}
                onMouseLeave={() => setHoveredOption(null)}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '16px', borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer',
                  backgroundColor: selected ? 'rgba(132, 0, 255, 0.15)' : (isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'),
                  border: selected ? '1px solid #c084fc' : (isHovered ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)'),
                  color: selected ? '#ffffff' : 'rgba(255,255,255,0.8)',
                  boxShadow: selected ? '0 0 16px rgba(168,85,247,0.2)' : 'none',
                  fontWeight: 'normal', fontSize: '15px'
                }}
              >
                <span style={{
                  flexShrink: 0, height: '24px', width: '24px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginTop: '2px',
                  backgroundColor: selected ? '#c084fc' : 'transparent',
                  color: selected ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  border: selected ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 'normal'
                }}>
                  {key}
                </span>
                <span style={{ lineHeight: '1.6', fontWeight: 'normal' }}>{optionValues[key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation & Minimap */}
      <div style={{ ...glassCardStyle, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>

        <button
          onClick={() => setCurrent((p) => Math.max(0, p - 1))}
          disabled={current === 0}
          style={{ ...secondaryButtonStyle, opacity: current === 0 ? 0.3 : 1, cursor: current === 0 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Minimap */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '300px', justifyContent: 'center' }}>
          {questions.map((_, idx) => {
            const isCurrent = idx === current;
            const isAnswered = answers[questions[idx].id];
            const isDotHovered = hoveredDot === idx;

            let bg = 'rgba(255,255,255,0.05)';
            let color = 'rgba(255,255,255,0.4)';
            let border = '1px solid rgba(255,255,255,0.1)';

            if (isCurrent) {
              bg = '#c084fc';
              color = '#ffffff';
              border = '1px solid #d8b4fe';
            } else if (isAnswered) {
              bg = 'rgba(16, 185, 129, 0.2)';
              color = '#10b981';
              border = '1px solid rgba(16, 185, 129, 0.4)';
            } else if (isDotHovered) {
              bg = 'rgba(255,255,255,0.1)';
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                onMouseEnter={() => setHoveredDot(idx)}
                onMouseLeave={() => setHoveredDot(null)}
                style={{
                  height: '28px', width: '28px', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 'normal', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: bg, color: color, border: border,
                  boxShadow: isCurrent ? '0 0 10px rgba(168,85,247,0.4)' : 'none'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((p) => p + 1)} style={buttonStyle}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => submitTest(false)} style={{ ...buttonStyle, backgroundColor: '#10b981', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
            <Send size={15} /> Submit Test
          </button>
        )}
      </div>

      {/* Unanswered Warning on Last Question */}
      {current === questions.length - 1 && answered < questions.length && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', color: '#fbbf24', textAlign: 'center', fontWeight: 'normal', fontSize: '14px' }}>
          {questions.length - answered} question(s) unanswered. Unanswered questions will be marked as incorrect.
        </div>
      )}

    </BaseLayout>
  );
}
