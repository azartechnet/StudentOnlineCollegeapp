const router = require('express').Router();
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

/* ============================================================
   TEST MANAGEMENT
   ============================================================ */

/* Create test (Trainer) */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    const { title, description, durationMinutes, isActive } = req.body;
    const test = await Test.create({
      title,
      description: description || '',
      durationMinutes: durationMinutes || 30,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    res.status(201).json(test);
  } catch (err) {
    console.error('❌ Create test error:', err);
    res.status(500).json({ message: err.message });
  }
});

/* Get all tests */
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'student' ? { isActive: true } : {};
    const tests = await Test.find(query).sort({ createdAt: -1 });

    const withCount = await Promise.all(
      tests.map(async (t) => {
        const count = await Question.countDocuments({ test: t._id });
        return { ...t.toObject(), questionCount: count };
      })
    );

    res.json(withCount);
  } catch (err) {
    console.error('❌ Get tests error:', err);
    res.status(500).json({ message: err.message });
  }
});

/* Get single test */
router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const count = await Question.countDocuments({ test: test._id });
    res.json({ ...test.toObject(), questionCount: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* Toggle active status (Trainer) */
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Not found' });

    test.isActive = !test.isActive;
    await test.save();
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* Delete test + its questions + results */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    await Question.deleteMany({ test: req.params.id });
    await Result.deleteMany({ test: req.params.id });
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TEST SUBMISSION (Student)
   ============================================================ */
router.post('/:testId/submit', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student')
      return res.status(403).json({ message: 'Only students can submit' });

    const { answers, timeTakenSeconds, autoSubmitted } = req.body;
    const testId = req.params.testId;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const existing = await Result.findOne({
      student: req.user.id,
      test: testId
    });
    if (existing)
      return res.status(400).json({ message: 'You already submitted this test' });

    const questions = await Question.find({ test: testId });

    let obtainedMarks = 0;
    let totalMarks = 0;

    const processedAnswers = questions.map((q) => {
      const studentAns = answers.find(
        (a) => a.questionId === q._id.toString()
      );
      const selected = studentAns ? studentAns.selectedAnswer : -1;
      const isCorrect = selected === q.correctAnswer;

      totalMarks += q.marks;
      if (isCorrect) obtainedMarks += q.marks;

      return {
        questionId: q._id,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        isCorrect
      };
    });

    // Get student snapshot
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const result = await Result.create({
      student: req.user.id,
      test: testId,
      testTitle: test.title,
      studentName: student.studentName,
      studentId: student.studentId,
      studentEmail: student.emailId,
      studentPhone: student.phone,
      studentCollege: student.collegeName,
      studentLocation: student.location,
      studentAddress: student.address,
      answers: processedAnswers,
      totalMarks,
      obtainedMarks,
      timeTakenSeconds: timeTakenSeconds || 0,
      autoSubmitted: autoSubmitted || false,
      status: 'pending'
    });

    res.json({ message: 'Test submitted successfully', resultId: result._id });
  } catch (err) {
    console.error('❌ Submit test error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;