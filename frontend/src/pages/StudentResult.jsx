import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentResult() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    API.get('/results/my')
      .then((res) => setResults(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const viewDetail = async (testId) => {
    setSelected(testId);
    setDetail(null);
    try {
      const { data } = await API.get(`/results/my/${testId}`);
      setDetail(data);
    } catch {
      setDetail({ published: false, message: 'Failed to load details' });
    }
  };

  if (loading)
  return (
    <div className="container">
      <div className="card">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center' }}>Loading results...</p>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <h1>📊 My Results</h1>
        {results.length === 0 && (
          <>
            <p>You haven't attempted any tests yet.</p>
            <button onClick={() => navigate('/tests')}>Browse Tests</button>
          </>
        )}

        {results.map((r) => (
          <div
            key={r._id}
            className="question-card"
            style={{ marginBottom: '15px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h3>{r.testTitle}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Submitted: {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`badge ${r.status}`}>
                {r.status.toUpperCase()}
              </span>
            </div>

            {r.status === 'published' ? (
              <div style={{ marginTop: '10px' }}>
                <p>
                  <strong>Score:</strong> {r.obtainedMarks} / {r.totalMarks}
                </p>
                <button onClick={() => viewDetail(r.test)}>View Details</button>
              </div>
            ) : (
              <p style={{ marginTop: '10px', color: '#ef6c00' }}>
                ⏳ Marks will be shown after trainer publishes.
              </p>
            )}
          </div>
        ))}
      </div>

      {selected && detail && detail.published && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>Detailed Result</h2>
          <h3 style={{ color: '#2e7d32' }}>
            Score: {detail.result.obtainedMarks} / {detail.result.totalMarks} (
            {(
              (detail.result.obtainedMarks / detail.result.totalMarks) *
              100
            ).toFixed(2)}
            %)
          </h3>

          {detail.result.feedback && (
            <p>
              <strong>Trainer Feedback:</strong> {detail.result.feedback}
            </p>
          )}

          <p>
            <strong>Time Taken:</strong>{' '}
            {Math.floor((detail.result.timeTakenSeconds || 0) / 60)}m{' '}
            {(detail.result.timeTakenSeconds || 0) % 60}s
          </p>

          {detail.result.autoSubmitted && (
            <p style={{ color: '#c62828' }}>
              ⚠️ This test was auto-submitted due to timeout.
            </p>
          )}
        </div>
      )}

      {selected && detail && !detail.published && (
        <div className="card" style={{ marginTop: '20px' }}>
          <p style={{ color: '#ef6c00' }}>⏳ {detail.message}</p>
        </div>
      )}
    </div>
  );
}