import bgImage from "../assets/bg-login.png";
import booknest from "/booknest.png";
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        document.cookie = `token=${data.token}; path=/; max-age=3600`;
        console.log("Token disimpan:", document.cookie);
        navigate("/buku");
      } else {
        setMessage(data.message || "Login gagal");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background image with different positioning for mobile/desktop */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute w-full h-full object-cover -z-10"
        style={{
          objectPosition: "center right",
        }}
      ></img>

      {/* Main container with responsive flex column on mobile, row on desktop */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left section - Welcome text - Hidden on small mobile, visible on medium screens and up */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="raleway-general     w-full lg:w-1/2 flex flex-col justify-center lg:justify-start md:mt-10 lg:mt-40 px-6 lg:ml-15 lg:text-white p-4 lg:p-8 z-10 hidden sm:flex"
        >
          <h1 className="text-4xl  lg:text-4xl font-bold mb-2 lg:mb-4 text-center lg:text-left">
            Selamat Datang di
          </h1>
          <p className="text-3xl lg:text-8xl font-bold mb-2 lg:mb-4 text-center lg:text-left ">
            BookNest
          </p>
          <p className="text-orange-100 text-xl">
            Cari dan jelajahi berbagai buku yang ingin Anda temukan!
          </p>
        </motion.div>

        <div className="w-full flex flex-col raleway-general text-emerald-900 items-center pt-6 pb-4 z-10 sm:hidden">
          <h1 className="text-3xl font-bold mb-1">BookNest</h1>
          <p className="text-sm ">
            Cari dan jelajahi buku yang ingin anda temukan!
          </p>
        </div>

        {/* Right section - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 lg:p-15   backdrop-blur- lg:backdrop-blur-none sm:mt-0 mx-auto sm:mx-0">
          <img
            src={logo}
            className="mb-6 lg:mb-20 max-w-full w-32 sm:w-40 lg:w-32 h-auto hidden sm:block"
            alt="BookNest Logo"
          />

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-lg rounded-xl p-6 lg:p-10 shadow-xl/30 raleway-general border-orange-200 backdrop-blur-xl"
            onSubmit={handleSubmit}
          >
            {message && (
              <div className="mb-4 text-center text-red-500">{message}</div>
            )}
            <h1 className="text-2xl lg:text-3xl flex justify-center mb-6 lg:mb-10">
              Masuk
            </h1>

            <div className="mb-4 w-full px-4">
              <label
                className="text-xl lg:text-sm block text-gray-900 mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full px-4 py-2 text-2xl border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                type="email"
                id="email"
                placeholder="nama@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4 w-full px-4">
              <label
                className="text-lg lg:text-xl block text-gray-900 mb-2"
                htmlFor="password"
              >
                Kata Sandi
              </label>
              <input
                className="w-full px-4 py-2 text-2xl border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                type="password"
                id="password"
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center w-full px-4 justify-between mb-6">
              <div className="flex items-center mb-2 sm:mb-0">
                <input type="checkbox" id="remember" className="mr-2" />
                <label
                  htmlFor="remember"
                  className="text-sm lg:text-md text-gray-700"
                >
                  Ingat Saya
                </label>
              </div>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Lupa Kata Sandi?
              </a>
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="w-40 bg-emerald-800 text-white text-2xl py-2 rounded-md hover:bg-emerald-600 transition"
              >
                Masuk
              </button>
            </div>

            <h2 className="flex justify-center mt-5 block text-gray-700 mb-2">
              Belum Punya Akun?
            </h2>

            <div className="flex justify-center">
              <Link to="/register">
                <button
                  type="button"
                  className="w-40 text-emerald-900 text-2xl border border-emerald-800 py-2 rounded-md hover:bg-emerald-700 hover:text-white transition"
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
