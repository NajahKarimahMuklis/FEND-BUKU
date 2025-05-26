import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaBook,
  FaFolder,
  FaHome,
  FaNeuter,
  FaUserFriends
} from "react-icons/fa";
import { useNavigate } from "react-router";
import AddBookForm from "../components/AddBookForm";
import AddKategoriForm from "../components/AddKategoriForm";
import AddStatusFrom from "../components/AddStatusForm";
import AddBukuKatForm from "../components/AddBukuKatForm";

function LandingPageAdmin() {
  const [adminName, setAdminName] = useState("");
  const [active, setActive] = useState("dashboard");
  const [buku, setBuku] = useState([]);
  const [statusBuku, setStatusBuku] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [sudahAmbil, setSudahAmbil] = useState(false);
  const [tampilBuku, setTampilBuku] = useState(false);
  const [tampilStatus, setTampilStatus] = useState(false);
  const [tampilKategori, setTampilKategori] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminName = localStorage.getItem("adminName");
    setAdminName(adminName);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  const handleKlikBook = async () => {
    setTampilBuku((prev) => !prev);
    if (!sudahAmbil) {
      try {
        const res = await fetch("http://localhost:3000/buku", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (res.ok) {
          setBuku(data.data);
          console.log("Berhasil mengambil buku:", data);
        } else {
          console.error("Gagal mendapatkan buku:", data.message);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    }
  };

  const handleKlikKategori = async () => {
    setTampilKategori((prev) => !prev);
    if (!sudahAmbil) {
      try {
        const res = await fetch("http://localhost:3000/kategori", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (res.ok) {
          setKategori(data.data);
          console.log("Berhasil mengambil kategori:", data);
        } else {
          console.error("Gagal mendapatkan kategori:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
  };

  const handleStatusBuku = async () => {
    setTampilStatus((prev) => !prev);
    if (!sudahAmbil) {
      try {
        const res = await fetch("http://localhost:3000/statusBuku", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (res.ok) {
          setStatusBuku(data.data);
          console.log("Berhasil mengambil status buku:", data);
        } else {
          console.error("Gagal mendapatkan status buku:", data.message);
        }
      } catch (error) {
        console.error("Error fetching book statuses:", error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-emerald-900 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold p-6">BookNest Admin</h2>
          <nav className="flex flex-col gap-2 p-4">
            <button
              onClick={() => setActive("dashboard")}
              className={`text-left p-2 hover:bg-emerald-700 rounded ${
                active === "dashboard" ? "bg-emerald-600" : ""
              }`}
            >
              <div>
                <FaHome className="inline-block mr-2 text-yellow-400 " />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActive("buku")}
              className={`text-left p-2 hover:bg-emerald-700 rounded ${
                active === "buku" ? "bg-emerald-600" : ""
              }`}
            >
              <FaBook className="inline-block mr-2 text-blue-300" />
              Kelola Buku
            </button>
            <button
              onClick={() => setActive("kategori")}
              className={`text-left p-2 hover:bg-emerald-700 rounded ${
                active === "kategori" ? "bg-emerald-600" : ""
              }`}
            >
              <FaFolder className="inline-block mr-2 text-orange-400" />
              Kelola Kategori
            </button>
            <button
              onClick={() => setActive("statusBuku")}
              className={`text-left p-2 hover:bg-emerald-700 rounded ${
                active === "statusBuku" ? "bg-emerald-600" : ""
              }`}
            >
              <FaNeuter className="inline-block mr-2 text-yellow-400" />
              Kelola Status Buku
            </button>
            <button
              onClick={() => setActive("BukuKategori")}
              className={`text-left p-2 hover:bg-emerald-700 rounded ${
                active === "BukuKategori" ? "bg-emerald-600" : ""
              }`}
            >
              <FaUserFriends className="inline-block mr-2 text-blue-600" />{" "}
              Kelola Buku Kategori
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

      <div className="flex-1 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 bg-gradient-to-r from-emerald-50 to-white p-6 rounded-xl shadow flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
              {adminName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-800">
                Selamat Datang, {adminName?.split("@")[0]} 👋
              </h1>
              <p className="text-sm text-gray-600">
                Semoga harimu menyenangkan! Ayo kelola koleksi perpustakaan hari
                ini 📚
              </p>
            </div>
          </div>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            src="/public/welcome.svg"
            alt="Welcome Illustration"
            className="w-28 h-auto hidden md:block"
          />
        </motion.div>

        {active === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={handleKlikBook}
                className="bg-white/70 backdrop-blur-md border border-emerald-200 shadow-lg p-6 rounded-2xl hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">📚</div>
                  <span className="text-sm font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    {buku.length} buku
                  </span>
                </div>
                <h2 className="text-xl font-bold text-emerald-800">
                  Kelola Buku
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lihat & ubah daftar buku perpustakaan.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onClick={handleKlikKategori}
                className="bg-white/70 backdrop-blur-md border border-indigo-200 shadow-lg p-6 rounded-2xl hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">🗂️</div>
                  <span className="text-sm font-semibold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    {kategori.length || 0} kategori
                  </span>
                </div>
                <h2 className="text-xl font-bold text-indigo-800">
                  Kelola Kategori
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Atur klasifikasi buku sesuai tema.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={handleStatusBuku}
                className="bg-white/70 backdrop-blur-md border border-rose-200 shadow-lg p-6 rounded-2xl hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">📌</div>
                  <span className="text-sm font-semibold bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
                    {statusBuku.length} status
                  </span>
                </div>
                <h2 className="text-xl font-bold text-rose-800">Status Buku</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tentukan apakah buku sedang tersedia atau dipinjam.
                </p>
              </motion.div>
            </div>

            {tampilStatus && (
              <div>
                <h2 className="text-2xl font-bold text-rose-800 mb-6">
                  📌 Daftar Status Buku
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statusBuku.map((status) => (
                    <motion.div
                      key={status.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {status.nama}
                      </h3>
                      <p className="text-sm text-gray-600">ID: {status.id}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {tampilBuku && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                  📘 Daftar Buku
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buku.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {book.judul}
                      </h3>
                      <dl className="text-sm text-gray-600 space-y-1">
                        <div>
                          <dt className="inline font-medium">Pengarang:</dt>{" "}
                          <dd className="inline">{book.pengarang}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium">Penerbit:</dt>{" "}
                          <dd className="inline">{book.penerbit}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium">Tahun:</dt>{" "}
                          <dd className="inline">{book.tahunTerbit}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium">Status:</dt>{" "}
                          <dd className="inline bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">
                            {book.statusBuku?.nama || "-"}
                          </dd>
                        </div>
                      </dl>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {tampilKategori && (
              <div>
                <h2 className="text-2xl font-bold text-indigo-800 mb-6">
                  📂 Daftar Kategori
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kategori.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {item.nama}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.deskripsi || "Tanpa deskripsi."}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {active === "buku" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <AddBookForm onSuccess={() => console.log("Form sukses")} />
          </motion.div>
        )}

        {active === "kategori" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <AddKategoriForm />
          </motion.div>
        )}
        {active === "statusBuku" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <AddStatusFrom />
          </motion.div>
        )}

        {active === "BukuKategori" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <AddBukuKatForm />
          </motion.div>
        )}  
      </div>
    </div>
  );
}

export default LandingPageAdmin;
