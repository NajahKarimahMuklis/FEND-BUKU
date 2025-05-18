import React from "react";
import { useNavigate } from "react-router-dom";
import logoutIcon from "../assets/logout.png"; // pastikan path ini sesuai dengan file aslimu

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // atau ambil dari context/api sesuai implementasimu

  const navigateToStatusBuku = () => navigate("/statusBuku");
  const navigateToKategori = () => navigate("/kategori");
  const navigateToBooks = () => navigate("/buku");

  const handleLogout = () => {
    // Hapus token atau informasi sesi
    localStorage.clear(); // atau localStorage.removeItem("token") dsb
    document.cookie = "token=; path=/; max-age=0"; // hapus cookie
    navigate("/login"); // arahkan ke halaman login
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Library Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={navigateToBooks}
            className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            Books
          </button>

          {role === "admin" && (
            <>
              <button
                onClick={navigateToStatusBuku}
                className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Status Buku
              </button>
              <button
                onClick={navigateToKategori}
                className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Kategori
              </button>
            </>
          )}

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-blue-700 rounded"
          >
            <img src={logoutIcon} alt="Logout" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
