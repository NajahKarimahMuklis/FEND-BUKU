import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/bg-login.png";
import logo from "../assets/logo.png";
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
      const res = await fetch(
        "https://be-appbuku-production-6cfd.up.railway.app/register",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );

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
    <div className="relative overflow-hidden h-screen raleway-general">
      {/* Background image */}
      <img
        src={bgImage}
        alt="Register Background"
        className="absolute w-full h-full object-cover -z-10 object-left sm:object-right sm:scale-100 scale-125 transition-all duration-500"
      />

      {/* Main container with responsive layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left section - Logo */}

        {/* Right section - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:px-10 md:px-16 lg:px-24 text-white">
          <img
            src={logo}
            className="mb-6 w-24 sm:w-32 h-auto hidden sm:block"
            alt="BookNest Logo"
          />
          <div className="w-full flex flex-col sm:hidden items-center pt-2 pb-4 text-white">
            <h1 className="text-2xl font-bold">BookNest</h1>
            <p className="text-sm text-center">
              Daftarkan akunmu dan mulai menjelajah buku!
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm md:max-w-md lg:max-w-lg rounded-xl p-6 sm:p-8 lg:p-10 shadow-md backdrop-blur-xl bg-orange-300/10"
            onSubmit={handleSubmit}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Daftar</h2>

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
              className="w-full sm:w-auto mt-10 px-6 mx-auto flex justify-center items-center bg-emerald-900 text-white py-2 rounded-md hover:bg-emerald-600 transition"
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

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden sm:flex w-full lg:w-1/2 flex-col justify-center p-6 md:p-12 xl:mb-[600px] lg:pl-20 text-emerald-800"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Selamat Datang di
          </h1>
          <p className="text-4xl md:text-8xl lg:text-10xl font-bold mb-4">
            BookNest
          </p>
          <p className="text-lg md:text-xl  text-orange-200">
            Cari dan jelajahi berbagai buku yang ingin Anda temukan!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
