"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Header from "../../../../components/Header";
import { useApp } from "../../../../components/Providers";
import { t } from "@/lib/i18n";
import { useParams, useRouter } from "next/navigation";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
}

interface TestData {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
  totalMarks: number;
}

interface TestResult {
  score: number;
  total: number;
  percentage: number;
  answers: {
    questionId: string;
    questionText: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
}

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useApp();
  const testId = params.id as string;

  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/student/practice-tests/${testId}`)
      .then((r) => r.json())
      .then((d) => {
        setTest(d);
        setTimeLeft(d.duration * 60);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [testId]);

  // Timer
  useEffect(() => {
    if (!test || submitted || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [test, submitted, loading]);

  // Animated score count-up
  useEffect(() => {
    if (!result) return;
    let start = 0;
    const end = result.score;
    const duration = 1500;
    const stepTime = Math.max(Math.floor(duration / (end || 1)), 30);
    const timer = setInterval(() => {
      start += 1;
      setAnimatedScore(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [result]);

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await fetch(`/api/student/practice-tests/${testId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
    } catch {
      // handle error
    }
    setSubmitting(false);
  }, [testId, answers, submitting, submitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test?.questions.length || 0;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  if (loading) {
    return (
      <div>
        <Header title="Practice Test" />
        <div className="p-6 space-y-6">
          <div className="h-16 shimmer rounded-2xl" />
          <div className="h-64 shimmer rounded-2xl" />
          <div className="h-12 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div>
        <Header title="Practice Test" />
        <div className="p-6 text-center py-20" style={{ color: "var(--text-muted)" }}>
          Test not found
        </div>
      </div>
    );
  }

  // Results screen
  if (submitted && result) {
    return (
      <div>
        <Header title="Test Results" />
        <div className="p-6 space-y-6 animate-fade-in">
          {/* Score Card */}
          <div
            className="rounded-2xl p-8 text-center relative overflow-hidden"
            style={{
              background: "var(--gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%))",
              boxShadow: "0 10px 40px rgba(102,126,234,0.3)",
            }}
          >
            <div className="relative z-10">
              <p className="text-white/70 text-sm mb-2">Your Score</p>
              <p className="text-6xl font-bold text-white mb-2">
                {animatedScore}<span className="text-2xl text-white/70">/{result.total}</span>
              </p>
              <p className="text-2xl font-semibold text-white/90">{result.percentage}%</p>
              <div className="mt-4 inline-block px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <span className="text-white font-medium">
                  {result.percentage >= 80 ? "Excellent!" : result.percentage >= 60 ? "Good Job!" : result.percentage >= 40 ? "Keep Practicing!" : "Need Improvement"}
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.1)", transform: "translate(30%, -30%)" }} />
          </div>

          {/* Question Review */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Question Review</h2>
            </div>
            <div className="p-6 space-y-4">
              {result.answers.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className="p-4 rounded-xl border"
                  style={{
                    borderColor: ans.isCorrect ? "var(--success)" : "var(--danger)",
                    backgroundColor: ans.isCorrect ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: ans.isCorrect ? "var(--success)" : "var(--danger)" }}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {ans.questionText}
                    </p>
                  </div>
                  <div className="ml-10 space-y-2">
                    {ans.options.map((opt, oIdx) => {
                      const isSelected = oIdx === ans.selectedAnswer;
                      const isCorrect = oIdx === ans.correctAnswer;
                      let optStyle: React.CSSProperties = { borderColor: "var(--border)", color: "var(--text-secondary)" };
                      if (isCorrect) {
                        optStyle = { borderColor: "var(--success)", backgroundColor: "rgba(34,197,94,0.1)", color: "var(--success)" };
                      } else if (isSelected && !ans.isCorrect) {
                        optStyle = { borderColor: "var(--danger)", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", textDecoration: "line-through" };
                      }
                      return (
                        <div
                          key={oIdx}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                          style={optStyle}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                          {isCorrect && <span className="ml-auto text-xs font-medium">Correct</span>}
                          {isSelected && !isCorrect && <span className="ml-auto text-xs font-medium">Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => router.push("/dashboard/student/practice-tests")}
              className="px-8 py-3 rounded-xl text-white text-sm font-medium transition-transform active:scale-95"
              style={{ background: "var(--gradient)" }}
            >
              Back to Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test-taking interface
  const question = test.questions[currentQ];

  return (
    <div>
      <Header title="Practice Test" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Test Header */}
        <div
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>{test.title}</h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{test.subject}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Answered</p>
                <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                  {answeredCount}/{totalQuestions}
                </p>
              </div>
              {/* Timer */}
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{
                  backgroundColor: timeLeft <= 60 ? "rgba(239,68,68,0.1)" : "var(--bg-secondary)",
                  color: timeLeft <= 60 ? "var(--danger)" : "var(--text)",
                }}
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Time Left</p>
                <p className="text-lg font-bold font-mono">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: "var(--gradient)" }}
            />
          </div>
        </div>

        {/* Question */}
        {question && (
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "var(--gradient)" }}
              >
                {currentQ + 1}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Question {currentQ + 1} of {totalQuestions}
              </span>
            </div>

            <p className="text-base font-medium mb-6 leading-relaxed" style={{ color: "var(--text)" }}>
              {question.text}
            </p>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = answers[question.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [question.id]: idx })}
                    className="w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3"
                    style={{
                      borderColor: isSelected ? "var(--primary)" : "var(--border)",
                      backgroundColor: isSelected ? "var(--primary-50, rgba(59,130,246,0.08))" : "var(--bg-secondary)",
                      boxShadow: isSelected ? "0 0 0 2px var(--primary)" : "none",
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                      style={{
                        backgroundColor: isSelected ? "var(--primary)" : "var(--bg-card)",
                        color: isSelected ? "white" : "var(--text-muted)",
                        border: isSelected ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: isSelected ? "var(--primary)" : "var(--text)" }}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-6 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-40"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Previous
          </button>

          {/* Question dots */}
          <div className="flex gap-1.5 flex-wrap justify-center max-w-md">
            {test.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQ(idx)}
                className="w-8 h-8 rounded-full text-xs font-bold transition-all"
                style={{
                  backgroundColor:
                    idx === currentQ
                      ? "var(--primary)"
                      : answers[q.id] !== undefined
                      ? "var(--success)"
                      : "var(--bg-secondary)",
                  color:
                    idx === currentQ || answers[q.id] !== undefined
                      ? "white"
                      : "var(--text-muted)",
                  border: idx === currentQ ? "none" : "1px solid var(--border)",
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQ < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-transform active:scale-95"
              style={{ background: "var(--gradient)" }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-transform active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "var(--success)" }}
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
