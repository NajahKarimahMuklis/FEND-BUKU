import bgImage from "../assets/bg-login.png";
import logo from "/logo.png";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        document.cookie = `token=${data.token}; path=/; max-age=3600`;
        console.log("Token disimpan:", document.cookie);

        const role = data.data.role;
        if (role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/home");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen raleway-general">
  <img
    src={bgImage}
    alt="Background"
    className="absolute w-full h-full object-cover -z-10"
    style={{ objectPosition: "center right" }}
  />

  <div className="flex flex-col lg:flex-row min-h-screen">
    {/* Left - Welcome Text */}
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="hidden sm:flex w-full lg:w-1/2 flex-col justify-center p-6 md:p-12 xl:mb-[600px] lg:pl-20 text-white"
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Selamat Datang di</h1>
      <p className="text-4xl md:text-8xl lg:text-10xl font-bold mb-4">BookNest</p>
      <p className="text-lg md:text-xl text-orange-100">
        Cari dan jelajahi berbagai buku yang ingin Anda temukan!
      </p>
    </motion.div>

    {/* Logo dan Intro untuk Mobile */}
    <div className="w-full flex flex-col sm:hidden items-center pt-6 pb-4 text-emerald-900">
      <h1 className="text-3xl font-bold">BookNest</h1>
      <p className="text-sm text-center">Cari dan jelajahi buku yang ingin anda temukan!</p>
    </div>

    {/* Right - Form Login */}
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:px-10 md:px-16 lg:px-24">
      <img
        src={logo}
        className="mb-6 w-24 sm:w-32 h-auto hidden sm:block"
        alt="BookNest Logo"
      />

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm md:max-w-md lg:max-w-lg rounded-xl p-6 sm:p-8 lg:p-10 shadow-md backdrop-blur-xl bg-orange-900/10"
      >
        {message && (
          <div className="mb-4 text-center text-red-500">{message}</div>
        )}

        <h1 className="text-3xl font-semibold text-center mb-6">Masuk</h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-900 text-md font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="nama@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-900 text-md font-medium mb-2">
            Kata Sandi
          </label>
          <input
            type="password"
            id="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-gray-700">
          <label className="flex items-center mb-2 sm:mb-0">
            <input type="checkbox" className="mr-2" />
            Ingat Saya
          </label>
          <a href="#" className="text-blue-500 hover:underline">Lupa Kata Sandi?</a>
        </div>

        <div className="flex justify-center mb-4">
          <button
            type="submit"
            className="w-full sm:w-40 bg-emerald-800 text-white py-2 rounded-md hover:bg-emerald-600 transition text-lg"
          >
            Masuk
          </button>
        </div>

        <p className="text-center text-sm text-gray-700 mb-2">Belum Punya Akun?</p>

        <div className="flex justify-center mb-4">
          <Link to="/register">
            <button
              type="button"
              className="w-full sm:w-40 text-emerald-900 border border-emerald-800 py-2 rounded-md hover:bg-emerald-700 hover:text-white transition text-lg "
            >
              Daftar
            </button>
          </Link>
        </div>
      </motion.form>
    </div>
  </div>
</div>

  );
}

export default LoginPage;
