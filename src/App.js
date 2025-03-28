import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inputs, setInputs] = useState([""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Kiểm tra token và role khi tải trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (token) {
      setLoggedIn(true);
      setRole(userRole);
    }
  }, []);

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://chatfpt.azurewebsites.net/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: username,
          password: password,
        }),
      });

      if (!res.ok) throw new Error("Sai thông tin");

      const data = await res.json();

      // Lấy dữ liệu user và token từ JSON trả về
      const userData = data.data?.tokenResponse?.user; // Lấy thông tin user
      const role = userData?.role || "user"; // Lấy role chính xác
      const token = data.data?.tokenResponse?.accessToken; // Lấy token đúng

      // Lưu token và role vào localStorage
      if (token) localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setLoggedIn(true);
      setRole(role);
      setError("");
    } catch (err) {
      setError("Đăng nhập thất bại");
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setRole("");
    setInputs([""]);
    setResult(null);
  };

  // Cập nhật giá trị của input
  const handleChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  // Thêm input mới
  const handleAddInput = () => {
    setInputs([...inputs, ""]);
  };

  // Gửi dữ liệu training
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://chatfpt.azurewebsites.net/api/ai/training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) throw new Error("Gửi dữ liệu lỗi");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Không thể gửi dữ liệu" });
    }
  };

  return (
    <div className="container mt-5">
      {!loggedIn ? (
        // Giao diện đăng nhập
        <div className="card shadow p-4 mx-auto" style={{ maxWidth: 500 }}>
          <h3 className="text-center mb-4">Đăng nhập Admin</h3>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Tài khoản</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary w-100">
              Đăng nhập
            </button>
          </form>
        </div>
      ) : role === "Admin" ? (
        // Giao diện dành riêng cho Admin
        <div className="card shadow p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Gửi Dữ liệu Training</h4>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {inputs.map((input, idx) => (
              <div className="mb-3" key={idx}>
                <label className="form-label">Dòng {idx + 1}</label>
                <input
                  type="text"
                  className="form-control"
                  value={input}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  required
                />
              </div>
            ))}
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={handleAddInput}>
                + Thêm dòng
              </button>
              <button type="submit" className="btn btn-success">
                Gửi dữ liệu
              </button>
            </div>
          </form>

          {result && (
            <div className="alert alert-info mt-4">
              <h6>Kết quả từ API:</h6>
              <pre className="mb-0">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        // Nếu user không phải admin
        <div className="alert alert-warning">
          <h5>⚠️ Bạn không có quyền truy cập chức năng này.</h5>
          <button className="btn btn-danger mt-3" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
