import bgImage from "../assets/bg-login.png";
import booknest from "/booknest.png"
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Import useNavigate hook for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        credentials: "include", // Include credentials for cookies
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        // Simpan token ke cookies
        document.cookie = `token=${data.token}; path=/; max-age=3600`;
        console.log("Token disimpan:", document.cookie);

        // Redirect ke halaman buku setelah login berhasil
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
    <div className="relative overflow-hidden h-screen">
      {/* Kiri - Welcome Section */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute bottom-0 left-0 w-full h-auto object-cover -z-10"
        style={{ maxHeight: "100%" }}
      />
      <div className="flex">
        <div className="w-1/2 flex flex-col justify-start mt-30 ml-10 text-white p-8">
          <h1 className="text-7xl font-bold mb-4">Selamat Datang Di</h1>
          <p className="text-5xl font-bold mb-4">BookNest</p>
          <p className="text-lg mb-8 ">Jelajahi buku yang ingin anda cari!</p>
          <div className="flex items-center justify-center">
            {/* Gambar Buku (Placeholder) */}
          </div>
        </div>

        {/* Kanan - Login Form */}
        <div className="w-1/2 flex flex-col justify-center items-center p-20 ">
          <img src={booknest} className="mb-20"></img>
          <form
            className="w-150 inset-shadow-orange-700 rounded-xl p-10 shadow-xl/30 border-orange-200 backdrop-blur-xl"
            onSubmit={handleSubmit}
          >
            {message && (
              <div className="mb-4 text-center text-red-500">{message}</div>
            )}
            <h1 className="text-4xl flex justify-center mb-10">Masuk</h1>
            <div className="mb-4 w-95 ml-17">
              <label
                className="text-xl block text-gray-900 mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                type="email"
                id="email"
                placeholder="nama@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4  w-95 ml-17">
              <label
                className="text-xl block text-gray-900 mb-2"
                htmlFor="password"
              >
                Kata Sandi
              </label>
              <input
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                type="password"
                id="password"
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center w-95 ml-17 justify-between mb-6">
              <div className="flex items-center  ">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-md text-gray-700">
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
                className="w-40 bg-emerald-800 text-white py-2 rounded-md hover:bg-emerald-600 transition"
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
                  className="w-40 text-emerald-900 border border-emerald-800 text-emerald-900 py-2 rounded-md hover:bg-emerald-700 transition"
                >
                  Daftar
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
