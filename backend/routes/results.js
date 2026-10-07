const router = require('express').Router();
const Result = require('../models/Result');
const auth = require('../middleware/auth');

/* ============================================================
   STUDENT: Get own result for a test
   ============================================================ */
router.get('/my/:testId', auth, async (req, res) => {
  try {
    const result = await Result.findOne({
      student: req.user.id,
      test: req.params.testId
    });

    if (!result)
      return res.json({ published: false, message: 'No submission found' });

    if (result.status !== 'published') {
      return res.json({
        published: false,
        message: 'Result pending trainer review'
      });
    }

    res.json({ published: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   STUDENT: List all own results
   ============================================================ */
router.get('/my', auth, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    res.json(
      results.map((r) => ({
        _id: r._id,
        test: r.test,
        testTitle: r.testTitle,
        status: r.status,
        totalMarks: r.totalMarks,
        obtainedMarks: r.status === 'published' ? r.obtainedMarks : null,
        createdAt: r.createdAt
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: Get all results
   ============================================================ */
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    console.error('❌ Get all results error:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: Review result (adjust marks)
   ============================================================ */
router.put('/:id/review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    const { obtainedMarks, feedback } = req.body;
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      {
        obtainedMarks,
        feedback: feedback || '',
        status: 'reviewed',
        reviewedBy: req.user.id
      },
      { new: true }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: Publish result
   ============================================================ */
router.put('/:id/publish', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    const result = await Result.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: EXPORT RESULTS AS CSV
   ============================================================ */
router.get('/export/csv', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    const { testId } = req.query;
    const query = testId ? { test: testId } : {};
    const results = await Result.find(query).sort({ createdAt: -1 });

    const escape = (v) => {
      if (v === null || v === undefined) return '""';
      return `"${String(v).replace(/"/g, '""')}"`;
    };

    const headers = [
      'Student Name', 'Student ID', 'Email', 'Phone',
      'College', 'Location', 'Address',
      'Test Title', 'Status',
      'Obtained Marks', 'Total Marks', 'Percentage',
      'Time Taken (sec)', 'Auto Submitted',
      'Feedback', 'Submitted At'
    ];

    const rows = results.map((r) => {
      const pct =
        r.totalMarks > 0
          ? ((r.obtainedMarks / r.totalMarks) * 100).toFixed(2)
          : '0.00';

      return [
        escape(r.studentName || ''),
        escape(r.studentId || ''),
        escape(r.studentEmail || ''),
        escape(r.studentPhone || ''),
        escape(r.studentCollege || ''),
        escape(r.studentLocation || ''),
        escape(r.studentAddress || ''),
        escape(r.testTitle || ''),
        escape(r.status || ''),
        escape(r.obtainedMarks || 0),
        escape(r.totalMarks || 0),
        escape(pct),
        escape(r.timeTakenSeconds || 0),
        escape(r.autoSubmitted ? 'YES' : 'NO'),
        escape(r.feedback || ''),
        escape(new Date(r.createdAt).toLocaleString())
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const BOM = '\uFEFF';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="results_${Date.now()}.csv"`);
    res.send(BOM + csv);
  } catch (err) {
    console.error('❌ Results CSV error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;