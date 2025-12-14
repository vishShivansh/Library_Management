const express = require('express');
const {
  getDashboardSummary,
  getAttendanceReport,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken, requireRole('admin'));

router.get('/dashboard', getDashboardSummary);
router.get('/reports/attendance', getAttendanceReport);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

module.exports = router;






