import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

export default function StudentTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  const startTimeRef = useRef(null);
  const submittedRef = useRef(false);

  /* ---------- LOAD TEST + QUESTIONS ---------- */
  useEffect(() => {
    Promise.all([
      API.get(`/tests/${testId}`),
      API.get(`/questions/test/${testId}`),
    ])
      .then(([tRes, qRes]) => {
        setTest(tRes.data);
        setQuestions(qRes.data);
        setTimeLeft(tRes.data.durationMinutes * 60);
        startTimeRef.current = Date.now();
      })
      .catch(() => setMsg('Failed to load test'))
      .finally(() => setLoading(false));
  }, [testId]);

  /* ---------- COUNTDOWN TIMER ---------- */
  useEffect(() => {
    if (loading || submitted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, submitted, timeLeft]);

  /* ---------- SUBMIT TEST ---------- */
  const handleSubmit = async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const payload = {
      answers: Object.entries(answers).map(([qid, idx]) => ({
        questionId: qid,
        selectedAnswer: idx,
      })),
      timeTakenSeconds: Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      ),
      autoSubmitted: auto,
    };

    try {
      await API.post(`/tests/${testId}/submit`, payload);
      setSubmitted(true);
      setMsg(
        auto
          ? '⏰ Time up! Test auto-submitted. Await trainer review.'
          : '✅ Test submitted! Marks will be published after trainer review.'
      );
    } catch (err) {
      setMsg(err.response?.data?.message || 'Submission failed');
      submittedRef.current = false;
    }
  };

  const selectAnswer = (qid, idx) => {
    setAnswers({ ...answers, [qid]: idx });
  };

  const manualSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    const confirmMsg =
      unanswered > 0
        ? `${unanswered} question(s) unanswered. Submit anyway?`
        : 'Submit your test now?';
    if (window.confirm(confirmMsg)) handleSubmit(false);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  /* ---------- LOADING STATE ---------- */
  if (loading)
    return (
      <div className="container">
        <div className="card">
          <div className="spinner"></div>
          <p style={{ textAlign: 'center' }}>Preparing your test...</p>
        </div>
      </div>
    );

  /* ============================================================
     SUCCESS SCREEN WITH CELEBRATION ANIMATION
     ============================================================ */
  if (submitted) {
    return (
      <div className="container">
        <div className="card submit-success-card">
          {/* Confetti particles */}
          <div className="confetti-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="confetti" />
            ))}
          </div>

          {/* Sparkles */}
          <span className="sparkle">✨</span>
          <span className="sparkle">⭐</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">🌟</span>

          <div className="submit-success">
            {/* Animated checkmark SVG */}
            <div className="success-checkmark">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle
                  className="circle"
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#2e7d32"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  className="check"
                  d="M28 52 L44 68 L72 34"
                  fill="none"
                  stroke="#2e7d32"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Celebration emoji */}
            <div className="celebration-emoji">🎉</div>

            {/* Heading */}
            <h1 className="success-heading">Test Submitted!</h1>

            {/* Success message */}
            <div className="success-message">
              <span style={{ marginRight: '8px' }}>✅</span>
              {msg}
            </div>

            {/* Pending text */}
            <p className="pending-text">
              Your marks are pending trainer review.
            </p>

            {/* Action buttons */}
            <div className="submit-actions">
              <button onClick={() => navigate('/my-result')}>
                View My Results
              </button>
              <button
                className="warning"
                onClick={() => navigate('/tests')}
              >
                Back to Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     TEST TAKING SCREEN
     ============================================================ */
  const timerClass =
    timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container">
      {test && (
        <div className={`timer ${timerClass}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      )}

      <div className="card">
        {test && (
          <>
            <h1>{test.title}</h1>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              {test.description}
            </p>
            <p style={{ marginBottom: '20px' }}>
              <strong>Progress:</strong> {answeredCount} / {questions.length}{' '}
              answered
            </p>
          </>
        )}

        {msg && <p className="error">{msg}</p>}

        {questions.map((q, i) => (
          <div
            key={q._id}
            className="question-card"
            style={{ marginBottom: '20px' }}
          >
            <p>
              <strong>
                Q{i + 1}. {q.questionText}
              </strong>{' '}
              <em>({q.marks} marks)</em>
            </p>
            {q.options.map((opt, idx) => (
              <label
                key={idx}
                className={`option ${
                  answers[q._id] === idx ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name={q._id}
                  checked={answers[q._id] === idx}
                  onChange={() => selectAnswer(q._id, idx)}
                  style={{ width: 'auto', marginRight: '10px' }}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

        {questions.length > 0 && (
          <button className="success" onClick={manualSubmit}>
            Submit Test
          </button>
        )}
        {questions.length === 0 && (
          <p>No questions available for this test.</p>
        )}
      </div>
    </div>
  );
}