import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function TestList() {
  const [tests, setTests] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([API.get('/tests'), API.get('/results/my')])
      .then(([tRes, rRes]) => {
        setTests(tRes.data);
        setMyResults(rRes.data);
      })
      .catch((err) => console.error('Load error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const getMyResult = (testId) => myResults.find((r) => r.test === testId);

  if (loading)
  return (
    <div className="container">
      <div className="card">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center' }}>Loading tests...</p>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <h1>📋 Available Tests</h1>
        {tests.length === 0 && (
          <p>No tests available right now. Check back later.</p>
        )}
        <div className="grid">
          {tests.map((t) => {
            const myRes = getMyResult(t._id);
            return (
              <div
                key={t._id}
                className="question-card"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <h3>{t.title}</h3>
                <p
                  style={{
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '10px',
                  }}
                >
                  {t.description || 'No description'}
                </p>
                <p>
                  ⏱️ <strong>{t.durationMinutes} min</strong>
                </p>
                <p>
                  📝 <strong>{t.questionCount || 0}</strong> questions
                </p>
                {myRes ? (
                  <div style={{ marginTop: '10px' }}>
                    <span className={`badge ${myRes.status}`}>
                      {myRes.status.toUpperCase()}
                    </span>
                    <button
                      className="warning"
                      style={{ marginTop: '10px', width: '100%' }}
                      onClick={() => navigate('/my-result')}
                    >
                      View Status
                    </button>
                  </div>
                ) : (
                  <button
                    className="success"
                    style={{ marginTop: '10px', width: '100%' }}
                    disabled={t.questionCount === 0}
                    onClick={() => navigate(`/test/${t._id}`)}
                  >
                    {t.questionCount === 0 ? 'No Questions Yet' : '▶ Start Test'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}