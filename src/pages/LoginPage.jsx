import React from "react";
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
    <div className="flex h-screen">
      {/* Kiri - Welcome Section */}
      <div className="w-1/2 bg-blue-500 flex flex-col justify-center items-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to
          <br />
          BookNest
        </h1>
        <p className="text-lg mb-8 text-center">
          Manage your book collection, track reading progress, categorize books,
          and more.
        </p>
        <div className="flex items-center justify-center">
          {/* Gambar Buku (Placeholder) */}
          <div className="w-40 h-40 bg-green-300 rounded-md"></div>
        </div>
      </div>

      {/* Kanan - Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8">
        <form className="w-80" onSubmit={handleSubmit}>
          {message && (
            <div className="mb-4 text-center text-red-500">{message}</div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email address
            </label>
            <input
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Login
            </button>
          </div>
          <h2 className="mt-5 block text-gray-700 mb-2">
            Don't have an account?
          </h2>
          <Link to="/register">
            <button
              type="button"
              className="w-full mt border border-blue-500 text-blue-500 py-2 rounded-md hover:bg-blue-50 transition"
            >
              Sign up
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
