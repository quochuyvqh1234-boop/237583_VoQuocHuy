const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET /api/employees (Lấy danh sách & Tìm kiếm)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { employeeId: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const employees = await Employee.find(query);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/employees
router.post('/', async (req, res) => {
  try {
    const { employeeId, fullName, email } = req.body;
    if (!employeeId || !fullName || !email) {
      return res.status(400).json({ message: 'Vui lòng điền đủ Mã NV, Họ tên và Email' });
    }

    const existingEmp = await Employee.findOne({ employeeId });
    if (existingEmp) {
      return res.status(400).json({ message: 'Mã nhân viên đã tồn tại!' });
    }

    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo nhân viên', error: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: err.message });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json({ message: 'Đã xóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa', error: err.message });
  }
});

module.exports = router;