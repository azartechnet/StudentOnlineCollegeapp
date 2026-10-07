const router = require('express').Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');

/* Add question (Trainer only) */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    const { test, questionText, options, correctAnswer, marks } = req.body;
    if (!test) return res.status(400).json({ message: 'Test ID required' });

    const question = await Question.create({
      test, questionText, options, correctAnswer, marks,
      createdBy: req.user.id
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* Get questions by test ID */
router.get('/test/:testId', auth, async (req, res) => {
  try {
    const questions = await Question.find({ test: req.params.testId });

    if (req.user.role === 'student') {
      const sanitized = questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks
      }));
      return res.json(sanitized);
    }

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* Delete question (Trainer only) */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ message: 'Forbidden' });

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;