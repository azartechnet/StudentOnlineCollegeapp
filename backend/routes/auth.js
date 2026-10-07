const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Trainer = require('../models/Trainer');

/* ============================================================
   Middleware: trainer-only access
   ============================================================ */
const trainerOnly = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, access denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'trainer') {
      return res.status(403).json({ message: 'Trainer access only' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

/* ============================================================
   PUBLIC: STUDENT REGISTRATION
   ============================================================ */
router.post('/register', async (req, res) => {
  try {
    const {
      studentName, studentId, emailId, phone,
      address, location, collegeName, password
    } = req.body;

    const exists = await Student.findOne({ $or: [{ emailId }, { studentId }] });
    if (exists) return res.status(400).json({ message: 'Student already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      studentName, studentId, emailId, phone,
      address, location, collegeName,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Registration successful', studentId: student._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   PUBLIC: LOGIN (Student or Trainer)
   ============================================================ */
router.post('/login', async (req, res) => {
  try {
    const { emailId, password, role } = req.body;

    const Model = role === 'trainer' ? Trainer : Student;
    const user = await Model.findOne(
      role === 'trainer' ? { email: emailId } : { emailId }
    );

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.studentName || user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: user.role,
      name: user.studentName || user.name,
      id: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   PUBLIC: TRAINER REGISTRATION (one-time)
   ============================================================ */
router.post('/register-trainer', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Trainer.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Trainer already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const trainer = await Trainer.create({
      name, email, password: hashedPassword
    });

    res.status(201).json({ message: 'Trainer registered', trainer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: GET ALL STUDENTS
   ============================================================ */
router.get('/students', trainerOnly, async (req, res) => {
  try {
    const students = await Student.find()
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`📋 Returning ${students.length} students`);
    res.json(students);
  } catch (err) {
    console.error('❌ Error fetching students:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: GET ONE STUDENT BY ID
   ============================================================ */
router.get('/students/:id', trainerOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: UPDATE STUDENT (password optional → rehash if provided)
   ============================================================ */
router.put('/students/:id', trainerOnly, async (req, res) => {
  try {
    const {
      studentName, studentId, emailId, phone,
      address, location, collegeName, password
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check for duplicate email/ID (excluding self)
    const duplicate = await Student.findOne({
      _id: { $ne: req.params.id },
      $or: [{ emailId }, { studentId }]
    });
    if (duplicate) {
      return res
        .status(400)
        .json({ message: 'Another student already has this email or ID' });
    }

    // Update allowed fields
    if (studentName) student.studentName = studentName;
    if (studentId) student.studentId = studentId;
    if (emailId) student.emailId = emailId;
    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (location) student.location = location;
    if (collegeName) student.collegeName = collegeName;

    // Hash new password ONLY if provided and non-empty
    if (password && password.trim() !== '') {
      student.password = await bcrypt.hash(password, 10);
      console.log(`🔐 Password updated for student ${student.studentId}`);
    }

    await student.save();

    const updated = await Student.findById(student._id).select('-password');
    res.json({ message: 'Student updated successfully', student: updated });
  } catch (err) {
    console.error('❌ Update student error:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: DELETE STUDENT
   ============================================================ */
router.delete('/students/:id', trainerOnly, async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });

    console.log(`🗑️ Deleted student: ${deleted.studentId}`);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('❌ Delete student error:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   TRAINER: EXPORT STUDENTS AS CSV
   ============================================================ */
router.get('/students/export/csv', trainerOnly, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    const escape = (v) => {
      if (v === null || v === undefined) return '""';
      return `"${String(v).replace(/"/g, '""')}"`;
    };

    const headers = [
      'Student Name', 'Student ID', 'Email', 'Phone',
      'Address', 'Location', 'College Name', 'Registered On'
    ];

    const rows = students.map((s) =>
      [
        escape(s.studentName),
        escape(s.studentId),
        escape(s.emailId),
        escape(s.phone),
        escape(s.address),
        escape(s.location),
        escape(s.collegeName),
        escape(new Date(s.createdAt).toLocaleString())
      ].join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const BOM = '\uFEFF';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="students_${Date.now()}.csv"`);
    res.send(BOM + csv);
  } catch (err) {
    console.error('❌ CSV export error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;