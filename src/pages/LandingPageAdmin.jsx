import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";


function LandingPageAdmin() {
  const [adminName, setAdminName] = useState(" ");
  const navigate = useNavigate();

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-900 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold p-6">BookNest Admin</h2>
          <nav className="flex flex-col gap-2 p-4">
            <button
              onClick={() => navigate("/buku")}
              className="text-left p-2 hover:bg-emerald-700 rounded"
            >
              📚 Kelola Buku
            </button>
            <button
              onClick={() => navigate("/kategori")}
              className="text-left p-2 hover:bg-emerald-700 rounded"
            >
              🗂️ Kelola Kategori
            </button>
            <button
              onClick={() => navigate("/statusBuku")}
              className="text-left p-2 hover:bg-emerald-700 rounded"
            >
              📌 Kelola Status Buku
            </button>
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 py-2 rounded hover:bg-red-500"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Selamat Datang, {adminName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/buku">
            <div className="bg-white p-6 rounded shadow text-center hover:bg-gray-100 cursor-pointer">
              <h2 className="text-xl font-bold mb-2">📚 Buku</h2>
              <p className="text-gray-600">Kelola daftar buku yang tersedia.</p>
            </div>
          </Link>

          <Link to="/kategori">
            <div className="bg-white p-6 rounded shadow text-center hover:bg-gray-100 cursor-pointer">
              <h2 className="text-xl font-bold mb-2">🗂️ Kategori</h2>
              <p className="text-gray-600">Atur kategori buku.</p>
            </div>
          </Link>

          <Link to="/statusbuku">
            <div className="bg-white p-6 rounded shadow text-center hover:bg-gray-100 cursor-pointer">
              <h2 className="text-xl font-bold mb-2">📌 Status Buku</h2>
              <p className="text-gray-600">
                Tentukan status (tersedia, dipinjam, dll).
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPageAdmin;
