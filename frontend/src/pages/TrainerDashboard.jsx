import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
  });
  const [newQ, setNewQ] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1,
  });
  const [filterTestId, setFilterTestId] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [msg, setMsg] = useState('');

  // Edit student modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    studentName: '',
    studentId: '',
    emailId: '',
    phone: '',
    address: '',
    location: '',
    collegeName: '',
    password: '',
  });
  const [editMsg, setEditMsg] = useState('');
  const [saving, setSaving] = useState(false);

  /* ---------- DATA LOADERS ---------- */
  const loadTests = () =>
    API.get('/tests')
      .then((r) => setTests(r.data))
      .catch((err) => console.error('Load tests failed:', err));

  const loadResults = () =>
    API.get('/results/all')
      .then((r) => setResults(r.data))
      .catch((err) => console.error('Load results failed:', err));

  const loadStudents = () =>
    API.get('/auth/students')
      .then((r) => setStudents(r.data))
      .catch((err) => console.error('Load students failed:', err));

  useEffect(() => {
    if (!user) return;
    loadTests();
    loadResults();
    loadStudents();
  }, [user]);

  useEffect(() => {
    if (selectedTest) {
      API.get(`/questions/test/${selectedTest}`)
        .then((r) => setQuestions(r.data))
        .catch(() => setQuestions([]));
    } else {
      setQuestions([]);
    }
  }, [selectedTest]);

  /* ---------- TEST MANAGEMENT ---------- */
  const createTest = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tests', newTest);
      setMsg('✅ Test created');
      setNewTest({ title: '', description: '', durationMinutes: 30 });
      loadTests();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error creating test');
    }
  };

  const deleteTest = async (id) => {
    if (!window.confirm('Delete this test, its questions, and all results?'))
      return;
    try {
      await API.delete(`/tests/${id}`);
      if (selectedTest === id) setSelectedTest(null);
      loadTests();
      loadResults();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleTest = async (id) => {
    try {
      await API.put(`/tests/${id}/toggle`);
      loadTests();
    } catch (err) {
      alert('Toggle failed: ' + (err.response?.data?.message || err.message));
    }
  };

  /* ---------- QUESTION MANAGEMENT ---------- */
  const addQuestion = async (e) => {
    e.preventDefault();
    if (!selectedTest) return setMsg('Select a test first');
    try {
      await API.post('/questions', { ...newQ, test: selectedTest });
      setMsg('✅ Question added');
      setNewQ({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1,
      });
      const r = await API.get(`/questions/test/${selectedTest}`);
      setQuestions(r.data);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error adding question');
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await API.delete(`/questions/${id}`);
      const r = await API.get(`/questions/test/${selectedTest}`);
      setQuestions(r.data);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const setOption = (i, val) => {
    const opts = [...newQ.options];
    opts[i] = val;
    setNewQ({ ...newQ, options: opts });
  };

  /* ---------- STUDENT EDIT / DELETE ---------- */
  const openEditStudent = (student) => {
    setEditingStudent(student);
    setEditForm({
      studentName: student.studentName || '',
      studentId: student.studentId || '',
      emailId: student.emailId || '',
      phone: student.phone || '',
      address: student.address || '',
      location: student.location || '',
      collegeName: student.collegeName || '',
      password: '',
    });
    setEditMsg('');
  };

  const closeEditStudent = () => {
    setEditingStudent(null);
    setEditMsg('');
    setSaving(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditMsg('');
    try {
      const payload = { ...editForm };
      // Don't send empty password — server won't rehash if blank
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }

      await API.put(`/auth/students/${editingStudent._id}`, payload);
      setEditMsg('✅ Student updated successfully');
      loadStudents();
      setTimeout(() => closeEditStudent(), 1200);
    } catch (err) {
      setEditMsg(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (student) => {
    if (
      !window.confirm(
        `Delete student "${student.studentName}" (${student.studentId})?\n\nThis cannot be undone.`
      )
    )
      return;

    try {
      await API.delete(`/auth/students/${student._id}`);
      alert('✅ Student deleted');
      loadStudents();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  /* ---------- RESULTS ---------- */
  const updateMarks = async (id, marks) => {
    try {
      await API.put(`/results/${id}/review`, { obtainedMarks: Number(marks) });
      loadResults();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const publishResult = async (id) => {
    if (!window.confirm('Publish this result to student?')) return;
    try {
      await API.put(`/results/${id}/publish`);
      loadResults();
      alert('✅ Published!');
    } catch (err) {
      alert('Publish failed: ' + (err.response?.data?.message || err.message));
    }
  };

  /* ---------- CSV EXPORTS ---------- */
  const exportCSV = async () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${baseURL}/results/export/csv${
      filterTestId ? `?testId=${filterTestId}` : ''
    }`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${savedUser.token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `results_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const exportStudentsCSV = async () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${baseURL}/auth/students/export/csv`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${savedUser.token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `students_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  /* ---------- FILTERS ---------- */
  const filteredResults = filterTestId
    ? results.filter((r) => r.test === filterTestId)
    : results;

  const filteredStudents = students.filter((s) => {
    if (!searchStudent) return true;
    const q = searchStudent.toLowerCase();
    return (
      s.studentName?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.emailId?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.collegeName?.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q)
    );
  });

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="container">
      <div className="tab-bar">
        <button
          className={tab === 'tests' ? '' : 'warning'}
          onClick={() => setTab('tests')}
        >
          📋 Test Sets
        </button>
        <button
          className={tab === 'questions' ? '' : 'warning'}
          onClick={() => setTab('questions')}
        >
          ❓ Questions
        </button>
        <button
          className={tab === 'students' ? '' : 'warning'}
          onClick={() => setTab('students')}
        >
          👥 Students ({students.length})
        </button>
        <button
          className={tab === 'results' ? '' : 'warning'}
          onClick={() => setTab('results')}
        >
          📊 Results & Export
        </button>
      </div>

      {/* ================= TESTS TAB ================= */}
      {tab === 'tests' && (
        <div className="card">
          <h1>Manage Test Sets</h1>
          {msg && <p className="success">{msg}</p>}

          <h3>Create New Test</h3>
          <form onSubmit={createTest}>
            <input
              placeholder="Test Title (e.g., Math Quiz 1)"
              value={newTest.title}
              onChange={(e) =>
                setNewTest({ ...newTest, title: e.target.value })
              }
              required
            />
            <input
              placeholder="Description"
              value={newTest.description}
              onChange={(e) =>
                setNewTest({ ...newTest, description: e.target.value })
              }
            />
            <input
              type="number"
              min="1"
              placeholder="Duration (minutes)"
              value={newTest.durationMinutes}
              onChange={(e) =>
                setNewTest({
                  ...newTest,
                  durationMinutes: Number(e.target.value),
                })
              }
              required
            />
            <button type="submit">➕ Create Test</button>
          </form>

          <h3 style={{ marginTop: '30px' }}>All Tests ({tests.length})</h3>
          {tests.length === 0 && (
            <p>No tests yet. Create your first test above.</p>
          )}
          {tests.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td>{t.durationMinutes} min</td>
                    <td>{t.questionCount || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.isActive ? 'active' : 'inactive'
                        }`}
                      >
                        {t.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedTest(t._id);
                          setTab('questions');
                        }}
                      >
                        Manage Qs
                      </button>
                      <button
                        className="warning"
                        onClick={() => toggleTest(t._id)}
                      >
                        {t.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="danger"
                        onClick={() => deleteTest(t._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ================= QUESTIONS TAB ================= */}
      {tab === 'questions' && (
        <div className="card">
          <h1>Manage Questions</h1>
          {msg && <p className="success">{msg}</p>}

          <label>
            <strong>Select Test:</strong>
          </label>
          <select
            value={selectedTest || ''}
            onChange={(e) => setSelectedTest(e.target.value || null)}
          >
            <option value="">-- Choose a Test --</option>
            {tests.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>

          {!selectedTest && (
            <p style={{ marginTop: '15px', color: '#666' }}>
              Select a test above to manage its questions.
            </p>
          )}

          {selectedTest && (
            <>
              <h3 style={{ marginTop: '20px' }}>Add New Question</h3>
              <form onSubmit={addQuestion}>
                <textarea
                  placeholder="Question text"
                  value={newQ.questionText}
                  onChange={(e) =>
                    setNewQ({ ...newQ, questionText: e.target.value })
                  }
                  required
                />
                {newQ.options.map((opt, i) => (
                  <input
                    key={i}
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    required
                  />
                ))}
                <label>Correct Answer:</label>
                <select
                  value={newQ.correctAnswer}
                  onChange={(e) =>
                    setNewQ({
                      ...newQ,
                      correctAnswer: Number(e.target.value),
                    })
                  }
                >
                  {newQ.options.map((_, i) => (
                    <option key={i} value={i}>
                      Option {i + 1}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Marks"
                  value={newQ.marks}
                  min="1"
                  onChange={(e) =>
                    setNewQ({ ...newQ, marks: Number(e.target.value) })
                  }
                />
                <button type="submit">➕ Add Question</button>
              </form>

              <h3 style={{ marginTop: '30px' }}>
                Questions ({questions.length})
              </h3>
              {questions.length === 0 && (
                <p>No questions yet. Add your first question above.</p>
              )}
              <div className="grid">
                {questions.map((q, i) => (
                  <div key={q._id} className="question-card">
                    <p>
                      <strong>Q{i + 1}.</strong> {q.questionText}
                    </p>
                    <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                      {q.options.map((o, idx) => (
                        <li
                          key={idx}
                          style={{
                            color:
                              idx === q.correctAnswer ? '#2e7d32' : '#333',
                            fontWeight:
                              idx === q.correctAnswer ? 'bold' : 'normal',
                          }}
                        >
                          {o} {idx === q.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <em>Marks: {q.marks}</em>
                    </p>
                    <button
                      className="danger"
                      onClick={() => deleteQuestion(q._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= STUDENTS TAB ================= */}
      {tab === 'students' && (
        <div className="card">
          <h1>Registered Students ({students.length})</h1>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '15px',
            }}
          >
            <input
              placeholder="🔍 Search by name, ID, email, phone, college, location..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              style={{ flex: 1, minWidth: '250px' }}
            />
            <button className="success" onClick={exportStudentsCSV}>
              📥 Export Students CSV
            </button>
          </div>

          {filteredStudents.length === 0 && (
            <p>
              {searchStudent
                ? 'No students match your search.'
                : 'No students registered yet.'}
            </p>
          )}

          {filteredStudents.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>College</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={s._id}>
                      <td>{i + 1}</td>
                      <td>
                        <strong>{s.studentName}</strong>
                      </td>
                      <td>{s.studentId}</td>
                      <td>{s.emailId}</td>
                      <td>{s.phone}</td>
                      <td>{s.collegeName}</td>
                      <td>{s.location}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="warning"
                          style={{ padding: '8px 14px', fontSize: '13px' }}
                          onClick={() => openEditStudent(s)}
                          title="Edit student"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="danger"
                          style={{ padding: '8px 14px', fontSize: '13px' }}
                          onClick={() => deleteStudent(s)}
                          title="Delete student"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= RESULTS TAB ================= */}
      {tab === 'results' && (
        <div className="card">
          <h1>Student Results</h1>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '15px',
            }}
          >
            <label>
              <strong>Filter by Test:</strong>
            </label>
            <select
              value={filterTestId}
              onChange={(e) => setFilterTestId(e.target.value)}
              style={{ width: 'auto', minWidth: '200px' }}
            >
              <option value="">All Tests</option>
              {tests.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
            <button className="success" onClick={exportCSV}>
              📥 Export Results CSV
            </button>
          </div>

          {filteredResults.length === 0 && <p>No submissions yet.</p>}

          {filteredResults.map((r) => (
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
                  <h3>{r.studentName}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Test: <strong>{r.testTitle}</strong>
                  </p>
                </div>
                <span className={`badge ${r.status}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <p>
                <strong>Auto Score:</strong> {r.obtainedMarks} / {r.totalMarks}
              </p>
              <p>
                <strong>Time Taken:</strong>{' '}
                {Math.floor((r.timeTakenSeconds || 0) / 60)}m{' '}
                {(r.timeTakenSeconds || 0) % 60}s{' '}
                {r.autoSubmitted && '⚠️ Auto'}
              </p>
              <p>
                <strong>Submitted:</strong>{' '}
                {new Date(r.createdAt).toLocaleString()}
              </p>

              <div style={{ marginTop: '10px' }}>
                <label>Adjust Marks: </label>
                <input
                  type="number"
                  defaultValue={r.obtainedMarks}
                  style={{
                    width: '100px',
                    display: 'inline-block',
                    marginRight: '10px',
                  }}
                  onBlur={(e) => updateMarks(r._id, e.target.value)}
                />
                {r.status !== 'published' ? (
                  <button
                    className="success"
                    onClick={() => publishResult(r._id)}
                  >
                    ✅ Publish
                  </button>
                ) : (
                  <span className="badge published">PUBLISHED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= EDIT STUDENT MODAL ================= */}
      {editingStudent && (
        <div className="modal-overlay" onClick={closeEditStudent}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit Student</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
              Student ID: <strong>{editingStudent.studentId}</strong>
            </p>

            {editMsg && (
              <p
                className={
                  editMsg.startsWith('✅') ? 'success' : 'error'
                }
              >
                {editMsg}
              </p>
            )}

            <form onSubmit={saveStudent}>
              <label>Student Name</label>
              <input
                name="studentName"
                value={editForm.studentName}
                onChange={handleEditChange}
                required
              />

              <label>Student ID</label>
              <input
                name="studentId"
                value={editForm.studentId}
                onChange={handleEditChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="emailId"
                value={editForm.emailId}
                onChange={handleEditChange}
                required
              />

              <label>Phone</label>
              <input
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                required
              />

              <label>Address</label>
              <input
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                required
              />

              <label>Location</label>
              <input
                name="location"
                value={editForm.location}
                onChange={handleEditChange}
                required
              />

              <label>College Name</label>
              <input
                name="collegeName"
                value={editForm.collegeName}
                onChange={handleEditChange}
                required
              />

              <label>
                New Password{' '}
                <span style={{ color: '#666', fontWeight: 'normal' }}>
                  (leave blank to keep current)
                </span>
              </label>
              <input
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleEditChange}
                placeholder="Enter new password only if changing"
                minLength={6}
              />

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '15px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="submit"
                  className="success"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  className="warning"
                  onClick={closeEditStudent}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}