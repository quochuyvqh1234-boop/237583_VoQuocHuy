import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '', fullName: '', gender: 'Nam', dateOfBirth: '',
    department: '', position: '', email: '', phone: '', hireDate: '', status: 'Chính thức'
  });
  const [editingId, setEditingId] = useState(null);

  const fetchEmployees = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/employees${searchTerm ? `?search=${searchTerm}` : ''}`);
      setEmployees(res.data);
    } catch (err) {
      setMessage('Lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(search);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/employees/${editingId}`, formData);
        setMessage('Cập nhật nhân viên thành công!');
      } else {
        await axios.post(`${API_BASE}/api/employees`, formData);
        setMessage('Thêm nhân viên thành công!');
      }
      resetForm();
      fetchEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setFormData(emp);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await axios.delete(`${API_BASE}/api/employees/${id}`);
        setMessage('Đã xóa nhân viên thành công!');
        fetchEmployees();
      } catch (err) {
        setMessage('Lỗi khi xóa nhân viên!');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      employeeId: '', fullName: '', gender: 'Nam', dateOfBirth: '',
      department: '', position: '', email: '', phone: '', hireDate: '', status: 'Chính thức'
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>HỆ THỐNG QUẢN LÝ NHÂN SỰ</h2>

      {message && <p style={{ padding: '10px', background: '#e0f7fa', color: '#006064', borderRadius: '4px' }}>{message}</p>}

      {/* Form Tìm Kiếm */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Tìm theo Mã NV hoặc Họ tên..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Tìm kiếm</button>
      </form>

      {/* Form Thêm/Sửa */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>{editingId ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input name="employeeId" placeholder="Mã NV *" value={formData.employeeId} onChange={handleChange} required disabled={!!editingId} />
          <input name="fullName" placeholder="Họ và tên *" value={formData.fullName} onChange={handleChange} required />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          <input name="department" placeholder="Phòng ban" value={formData.department} onChange={handleChange} />
          <input name="position" placeholder="Chức vụ" value={formData.position} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
          <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Chính thức">Chính thức</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Đã nghỉ việc">Đã nghỉ việc</option>
          </select>
          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', marginRight: '10px', cursor: 'pointer' }}>
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {editingId && <button type="button" onClick={resetForm} style={{ padding: '10px 20px', cursor: 'pointer' }}>Hủy</button>}
          </div>
        </form>
      </div>

      {/* Danh sách nhân viên */}
      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.employeeId}</td>
                <td>{emp.fullName}</td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>{emp.status}</td>
                <td>
                  <button onClick={() => handleEdit(emp)} style={{ marginRight: '5px', cursor: 'pointer' }}>Sửa</button>
                  <button onClick={() => handleDelete(emp._id)} style={{ color: 'red', cursor: 'pointer' }}>Xóa</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;