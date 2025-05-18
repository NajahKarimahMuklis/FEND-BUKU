import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [adminSecret, setAdminSecret] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bodyData = { name, email, password, role };
    if (role === "ADMIN") {
      bodyData.adminSecret = adminSecret;
    }

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        navigate("/login");
      } else {
        setMessage(data.message || "Registrasi gagal");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

        {message && (
          <div
            className={`text-sm text-center ${
              message.includes("Berhasil") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full border rounded-md p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded-md p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded-md p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            className="w-full border rounded-md p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {role === "ADMIN" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Admin Secret
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
