import React, { useState, useEffect } from "react";
import "./App.css";  // Import CSS nếu có tùy chỉnh

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inputs, setInputs] = useState([""]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Kiểm tra trạng thái đăng nhập
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, password: password }),
      });

      if (!res.ok) throw new Error("Sai thông tin");

      const data = await res.json();
      const userData = data.data?.tokenResponse?.user;
      const role = userData?.role || "user";
      const token = data.data?.tokenResponse?.accessToken;

      if (token) localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setLoggedIn(true);
      setRole(role);
      setError("");
    } catch {
      setError("❌ Đăng nhập thất bại, vui lòng kiểm tra lại!");
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setRole("");
    setInputs([""]);
    setSuccessMessage("");
  };

  // Cập nhật giá trị input
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

      await res.json();
      setSuccessMessage("✅ Gửi dữ liệu thành công!");
    } catch {
      setSuccessMessage("❌ Gửi dữ liệu thất bại!");
    }

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="container mt-5">
      {/* Thông báo thành công */}
      {successMessage && (
        <div className="alert alert-success shadow position-fixed top-0 start-50 translate-middle-x mt-3 fade show">
          {successMessage}
        </div>
      )}

      {/* Nếu chưa đăng nhập */}
      {!loggedIn ? (
        <div className="card shadow-lg p-4 mx-auto text-center" style={{ maxWidth: 400 }}>
          <h3 className="mb-3 text-primary">🔑 Đăng nhập Admin</h3>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg w-100">
              Đăng nhập
            </button>
          </form>
        </div>
      ) : role === "Admin" ? (
        // Giao diện Admin
        <div className="card shadow-lg p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="text-success">📊 Gửi Dữ liệu Training</h4>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {inputs.map((input, idx) => (
              <div className="mb-3" key={idx}>
                <label className="form-label">Dòng {idx + 1}</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={input}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  required
                />
              </div>
            ))}
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handleAddInput}>
                ➕ Thêm dòng
              </button>
              <button type="submit" className="btn btn-success">
                📩 Gửi dữ liệu
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Giao diện khi không có quyền
        <>
          <div className="card text-center shadow-lg p-4 border-0" style={{ backgroundColor: "#fff3cd", borderRadius: "10px" }}>
            <h4 className="text-dark fw-bold">
              ⚠️ Truy cập bị hạn chế!
            </h4>
            <p className="text-muted">
              Bạn không có quyền sử dụng chức năng này. Vui lòng đăng nhập với tài khoản Admin.
            </p>
          </div>

          {/* Nút đăng xuất bên ngoài, căn giữa */}
          <div className="text-center mt-3">
            <button className="btn btn-danger px-3 py-1 fw-bold shadow-sm" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
