import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaBook,
  FaFolder,
  FaHome,
  FaNeuter,
  FaSearch,
  FaUserFriends
} from "react-icons/fa";
import { useNavigate } from "react-router";
import AddBookForm from "../components/AddBookForm";
import AddKategoriForm from "../components/AddKategoriForm";
import AddStatusFrom from "../components/AddStatusForm";
import AddBukuKatForm from "../components/AddBukuKatForm";

function LandingPageAdmin() {
  const [adminName, setAdminName] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("dashboard");
  const [buku, setBuku] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eksemplarBuku, setEksemplarBuku] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [filteredEksemplar, setFilteredEksemplar] = useState([]);
  const [sudahAmbil, setSudahAmbil] = useState(false);
  const [tampilBuku, setTampilBuku] = useState(false);
  const [tampilKategori, setTampilKategori] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminName = localStorage.getItem("adminName");
    setAdminName(adminName);
  }, []);

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05 // Sedikit jeda antar animasi baris
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  useEffect(() => {
    if (!query) {
      setFilteredEksemplar(eksemplarBuku);
    } else {
      const hasil = eksemplarBuku.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.buku?.judul?.toLowerCase().includes(q) ||
          item.buku?.pengarang?.toLowerCase().includes(q) ||
          item.buku?.penerbit?.toLowerCase().includes(q) ||
          item.buku?.tahunTerbit?.toString().includes(q) ||
          item.kodeEksemplar?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q)
        );
      });
      setFilteredEksemplar(hasil);
    }
  }, [query, eksemplarBuku]);

  const handleKlikEksemplar = async () => {
    setTampilBuku((prev) => !prev);
    if (!sudahAmbil) {
      try {
        const res = await fetch("http://localhost:3000/eksemplarBuku", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (res.ok) {
          setEksemplarBuku(data.data);
          console.log("Berhasil mengambil eksemplar buku:", data);
        } else {
          console.error("Gagal mendapatkan eksemplar buku:", data.message);
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
                onClick={handleKlikEksemplar}
                className="bg-white/70 backdrop-blur-md border border-emerald-200 shadow-lg p-6 rounded-2xl hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">📚</div>
                  <span className="text-sm font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    {buku.length} buku
                  </span>
                </div>
                <h2 className="text-xl font-bold text-emerald-800">
                  Kelola Koleksi Buku
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lihat & atur koleksi buku perpustakaan
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
            </div>

            {tampilBuku && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                  📘 Daftar Buku
                </h2>
                <div className="relative w-full max-w-md mb-6">
                  <FaSearch className="absolute top-3.5 left-4 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan judul buku..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm bg-white"
                  />
                </div>

                <div className="overflow-x-auto bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md">
                  <motion.table
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg"
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kode Eksemplar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Judul
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pengarang
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Penerbit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tahun Terbit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEksemplar.map((bukus) => (
                        <motion.tr
                          key={bukus.id}
                          variants={rowVariants}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bukus.kodeEksemplar}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {bukus.buku?.judul}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {bukus.buku?.pengarang}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {bukus.buku?.penerbit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {bukus.buku?.tahunTerbit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {bukus.status}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </motion.table>
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
