import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/bg-register.png";
import logo from "/logo.png" 
import { motion } from "framer-motion";


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
    <div className="relative overflow-hidden h-screen  raleway-general">
      {/* Background image */}
      <img
        src={bgImage}
        alt="Register Background"
        className="absolute w-full h-full object-cover -z-10"
        style={{
          objectPosition: "center right",
        }}
      />

      {/* Main container with responsive layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left section - Logo */}
        <div className="lg:w-1/2 p-10  mt-20 ">
          <img src={logo} className="w-64 ml-16"></img>
          <div className="text-emerald-900 ml-20 text-5xl font-bold">
            BookNest
          </div>
        </div>

        {/* Right section - Form */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-screen  text-white items-center justify-center">
          <p className="text-4xl ">Silakan Daftar </p>
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-lg rounded-xl p-9 lg:p-12 text-white m-10 shadow-xl/30 border-orange-200 backdrop-blur-xl"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-bold text-center mb-4">Daftar</h2>

            {message && (
              <div
                className={`text-sm text-center ${
                  message.includes("Berhasil")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <label className="block text-md font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-md font-medium mb-1 mt-4 ">
                Email
              </label>
              <input
                type="email"
                className="w-full border rounded-md p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-md font-medium mb-1 mt-4">
                Password
              </label>
              <input
                type="password"
                className="w-full border rounded-md p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-md font-medium mb-1 mt-4">
                Role
              </label>
              <select
                className="w-full border rounded-md p-2 text-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option className="text-black" value="USER">
                  User
                </option>
                <option className="text-black" value="ADMIN">
                  Admin
                </option>
              </select>
            </div>

            {role === "ADMIN" && (
              <div>
                <label className="block text-md font-medium mb-1 mt-4">
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
              className="w-full mt-10  bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition"
            >
              Daftar
            </button>
            {
              <div className="flex justify-center text-md mt-4">
                <p>
                  Sudah Punya Akun?{" "}
                  <a href="/login">
                    <u>Masuk di sini</u>
                  </a>
                </p>
              </div>
            }
          </motion.form>
        </div>
      </div>
    </div>
  );
}