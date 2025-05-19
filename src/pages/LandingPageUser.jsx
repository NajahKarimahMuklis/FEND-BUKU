import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function LandingPageUser() {
  const [books, setBooks] = useState([]);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/buku", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) setBooks(res.data);
      })
      .catch((err) => console.error("Gagal fetch buku:", err));
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-800 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold p-6">BookNest User</h2>
          <nav className="flex flex-col gap-2 p-4">
            <button
              onClick={() => navigate("/user/home")}
              className="text-left p-2 hover:bg-emerald-700 rounded"
            >
              📚 Lihat Buku
            </button>
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 py-2 rounded hover:bg-red-400"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-emerald-900">
          Selamat Datang, {userName}
        </h1>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Daftar Buku
        </h2>

        {books.length === 0 ? (
          <p className="text-gray-600">Tidak ada buku yang tersedia.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded shadow p-4 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-emerald-800">
                  {book.judul}
                </h3>
                <p className="text-sm text-gray-600">
                  Pengarang: {book.pengarang}
                </p>
                <p className="text-sm text-gray-600">
                  Penerbit: {book.penerbit}
                </p>
                <p className="text-sm text-gray-600">
                  Tahun: {book.tahunTerbit}
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  Status: {book.statusBuku?.nama || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPageUser;
