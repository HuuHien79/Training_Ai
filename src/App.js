import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inputs, setInputs] = useState([{ document: "", tagId: [] }]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (token) {
      setLoggedIn(true);
      setRole(userRole);
    }
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch("https://chatfpt.azurewebsites.net/api/tags?index=1&pageSize=10");
      const data = await res.json();
      setTags(data.data.items);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tag:", err);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setRole("");
    setInputs([{ document: "", tagId: [] }]);
    setSuccessMessage("");
  };

  const handleChange = (index, field, value) => {
    setInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], [field]: value };
      return newInputs;
    });
  };

  const handleTagChange = (index, tagId) => {
    setInputs((prevInputs) => {
      return prevInputs.map((input, i) => {
        if (i === index) {
          const isSelected = input.tagId.includes(tagId);
          return {
            ...input,
            tagId: isSelected
              ? input.tagId.filter((id) => id !== tagId)
              : [...input.tagId, tagId],
          };
        }
        return input;
      });
    });
  };

  const handleAddInput = () => {
    setInputs([...inputs, { document: "", tagId: [] }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    console.log("Dữ liệu gửi đi:", inputs);

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
      setInputs([{ document: "", tagId: [] }]);
    } catch {
      setSuccessMessage("❌ Gửi dữ liệu thất bại!");
    }

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getTagName = (tagId) => {
    const tag = tags.find((tag) => tag.id === tagId);
    return tag ? tag.name : "Không xác định";
  };

  return (
    <div className="container mt-5">
      {successMessage && (
        <div className="alert alert-success shadow position-fixed top-0 start-50 translate-middle-x mt-3 fade show">
          {successMessage}
        </div>
      )}

      {!loggedIn ? (
        <div className="card shadow-lg p-4 mx-auto text-center" style={{ maxWidth: 400 }}>
          <h3 className="mb-3 text-primary">🔑 Đăng nhập Admin</h3>
          <form onSubmit={handleLogin}>
            <input type="text" className="form-control mb-2" placeholder="Tài khoản" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" className="form-control mb-2" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
          </form>
        </div>
      ) : role === "Admin" ? (
        <div className="card shadow-lg p-4 position-relative">
          {/* Nút đăng xuất được đặt trên góc phải */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>🚪 Đăng xuất</button>
          </div>

          <h4 className="text-success text-center">📊 Gửi Dữ liệu Training</h4>
          <form onSubmit={handleSubmit}>
            {inputs.map((input, idx) => (
              <div className="mb-3" key={idx}>
                <label className="form-label">Dòng {idx + 1}</label>
                <input type="text" className="form-control mb-2" placeholder="Nhập dữ liệu" value={input.document} onChange={(e) => handleChange(idx, "document", e.target.value)} required />

                <label className="form-label">Chọn Tag:</label>
                <div className="d-flex flex-wrap">
                  {tags.map((tag) => (
                    <button key={tag.id} type="button" className={`btn me-2 mb-2 ${input.tagId.includes(tag.id) ? "btn-success" : "btn-outline-secondary"}`} onClick={() => handleTagChange(idx, tag.id)}>
                      {tag.name}
                    </button>
                  ))}
                </div>

                {input.tagId.length > 0 && <p><strong>Tag đã chọn:</strong> {input.tagId.map(getTagName).join(", ")}</p>}
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary" onClick={handleAddInput}>➕ Thêm dòng</button>
            <button type="submit" className="btn btn-success">📩 Gửi dữ liệu</button>
          </form>
        </div>
      ) : <p>⚠️ Bạn không có quyền truy cập!</p>}
    </div>
  );
}

export default App;
