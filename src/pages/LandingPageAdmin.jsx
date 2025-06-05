import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaBook,
  FaCheck,
  FaFolder,
  FaHome,
  FaSearch,
  FaUserFriends,
  FaExclamationTriangle, // Ikon untuk pop-up token
  FaBookOpen, // Ikon baru untuk Kelola Buku
  FaTags, // Ikon baru untuk Kelola Kategori
  FaFilter, // Ikon untuk filter
  FaListUl, // Ikon untuk Daftar Buku
  FaThLarge, // Ikon untuk Daftar Kategori
  FaCheckCircle, // Ikon untuk status Tersedia
  FaRegClock, // Ikon untuk status Dipinjam
  FaHistory
} from "react-icons/fa";
import { useNavigate } from "react-router";
import AddBookForm from "../components/AddBookForm";
import AddBukuKatForm from "../components/AddBukuKatForm";
import AddKategoriForm from "../components/AddKategoriForm";
import KonfirmasiPermintaan from "../components/KonfirmasiPermintaan";
import Riwayat from "../components/Riwayat";

function LandingPageAdmin() {
  const [adminName, setAdminName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("dashboard");
  const [eksemplarBuku, setEksemplarBuku] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [filteredEksemplar, setFilteredEksemplar] = useState([]);
  const [sudahAmbilBuku, setSudahAmbilBuku] = useState(false);
  const [sudahAmbilKategori, setSudahAmbilKategori] = useState(false);
  const [tampilBuku, setTampilBuku] = useState(false);
  const [tampilKategori, setTampilKategori] = useState(false);
  const navigate = useNavigate();
  const [showTokenExpiryPopup, setShowTokenExpiryPopup] = useState(false);

  useEffect(() => {
    const adminNameFromStorage = localStorage.getItem("adminName");
    setAdminName(adminNameFromStorage);
    // Consider initial redirect if no token/adminName, ensure this logic is sound for your app's flow.
    // if (!adminNameFromStorage && !document.cookie.includes("token=")) {
    //   navigate("/login");
    // }
  }, []); 

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" }
    }
  };

  const handleSessionExpired = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    localStorage.removeItem("adminName");
    setAdminName(""); 
    setShowTokenExpiryPopup(true);
    setTimeout(() => {
      setShowTokenExpiryPopup(false);
      navigate("/login");
    }, 3500);
  };

  const handleLogout = () => {
    handleSessionExpired();
  };

  const fetchDataWithAuth = async (url, options = {}) => {
    const defaultOptions = {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, defaultOptions);

    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("Sesi kedaluwarsa"); 
    }
    return response;
  };
  
  useEffect(() => {
    let hasilFilter = [...eksemplarBuku];
    if (query) {
      const q = query.toLowerCase();
      hasilFilter = hasilFilter.filter(
        (item) =>
          item.buku?.judul?.toLowerCase().includes(q) ||
          item.buku?.pengarang?.toLowerCase().includes(q) ||
          item.buku?.penerbit?.toLowerCase().includes(q) ||
          item.buku?.tahunTerbit?.toString().includes(q) ||
          item.kodeEksemplar?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      hasilFilter = hasilFilter.filter(
        (item) => item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredEksemplar(hasilFilter);
  }, [query, statusFilter, eksemplarBuku]);

  const handleKlikEksemplar = async () => {
    const akanTampil = !tampilBuku;
    setTampilBuku(akanTampil);
    if (akanTampil) {
      setTampilKategori(false);
      if (!sudahAmbilBuku) {
        try {
          const res = await fetchDataWithAuth(
            "https://be-appbuku-production-6cfd.up.railway.app/eksemplarBuku"
          );
          // fetchDataWithAuth throws on 401, so res should be valid if we reach here
          const data = await res.json(); 
          if (res.ok) {
            setEksemplarBuku(data.data || []);
            setSudahAmbilBuku(true);
          } else {
            console.error("Gagal mendapatkan eksemplar buku:", data.message);
          }
        } catch (error) {
          if (error.message !== "Sesi kedaluwarsa") {
            console.error("Error fetching books:", error);
          }
        }
      }
    }
  };

  const handleKlikKategori = async () => {
    const akanTampil = !tampilKategori;
    setTampilKategori(akanTampil);
    if (akanTampil) {
      setTampilBuku(false);
      if (!sudahAmbilKategori) {
        try {
          const res = await fetchDataWithAuth("https://be-appbuku-production-6cfd.up.railway.app/kategori");
          // fetchDataWithAuth throws on 401, so res should be valid
          const data = await res.json();
          if (res.ok) {
            setKategori(data.data || []);
            setSudahAmbilKategori(true);
          } else {
            console.error("Gagal mendapatkan kategori:", data.message);
          }
        } catch (error) {
          if (error.message !== "Sesi kedaluwarsa") {
            console.error("Error fetching categories:", error);
          }
        }
      }
    }
  };

  const globalApiConfig = { fetchDataWithAuth, handleSessionExpired };

  const DashboardCard = ({ icon, title, description, onClick, gradientFrom, gradientTo, textColor }) => (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      onClick={onClick}
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer text-white min-h-[180px] flex flex-col justify-between`}
    >
      <div>
        <div className={`mb-3 text-4xl ${textColor} opacity-80`}>{icon}</div>
        <h2 className={`text-xl font-bold ${textColor}`}>{title}</h2>
      </div>
      <p className={`text-sm ${textColor} opacity-90 mt-1`}>{description}</p>
    </motion.div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans">
      {showTokenExpiryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4"
          >
            <FaExclamationTriangle className="text-7xl text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Sesi Kedaluwarsa</h3>
            <p className="text-slate-600 mb-6">
              Sesi Anda telah berakhir. Anda akan dialihkan ke halaman login secara otomatis.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
              <motion.div
                className="bg-yellow-500 h-2.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.2, ease: "linear" }}
              />
            </div>
            <p className="text-sm text-slate-500">Mengalihkan...</p>
          </motion.div>
        </div>
      )}

      <div
        className={`w-64 bg-emerald-800 text-slate-100 flex flex-col justify-between shadow-lg transition-all duration-300 ${
          showTokenExpiryPopup ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <div>
          <h2 className="text-2xl font-semibold p-6 tracking-tight text-white">
            BookNest Admin
          </h2>
          <nav className="flex flex-col gap-1 p-3">
            {[
              { label: "Dashboard", icon: <FaHome />, id: "dashboard", color: "text-sky-300" },
              { label: "Kelola Buku", icon: <FaBook />, id: "buku", color: "text-rose-300" },
              { label: "Kelola Kategori", icon: <FaFolder />, id: "kategori", color: "text-amber-300" },
              { label: "Buku Kategori", icon: <FaUserFriends />, id: "BukuKategori", color: "text-fuchsia-300" },
              { label: "Konfirmasi", icon: <FaCheck />, id: "Konfirmasi", color: "text-lime-300" },
              { label: "Riwayat", icon: <FaHistory className="text-orange-400" />, id: "Riwayat", color: "text-lime-300" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center text-left p-3 hover:bg-emerald-700 rounded-lg transition-colors duration-150 ${
                  active === item.id ? "bg-emerald-600 shadow-inner" : ""
                }`}
              >
                <span className={`w-6 h-6 flex items-center justify-center mr-3 ${item.color}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-emerald-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors duration-150 font-semibold text-sm text-white"
          >
            Keluar
          </button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          showTokenExpiryPopup ? "blur-sm pointer-events-none" : ""
        } ${
          active === "dashboard"
            ? "p-6 md:p-8 lg:p-10"
            : "pt-3 md:pt-4 lg:pt-6 px-6 pb-6 md:px-8 md:pb-8 lg:px-10 lg:pb-10"
        }`}
      >
        {active === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-800">
              Selamat Datang, {adminName?.split("@")[0] || "Admin"}! 👋
            </h1>
            <p className="text-md text-slate-600 mt-1">
              Semoga harimu menyenangkan! Ayo kelola perpustakaan hari ini.
            </p>
          </motion.div>
        )}

        {active === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <DashboardCard
                icon={<FaBookOpen />}
                title="Kelola Koleksi Buku"
                description="Lihat, tambah, dan atur semua koleksi buku perpustakaan."
                onClick={handleKlikEksemplar}
                gradientFrom="from-sky-500"
                gradientTo="to-indigo-600"
                textColor="text-white"
              />
              <DashboardCard
                icon={<FaTags />}
                title="Kelola Kategori Buku"
                description="Atur klasifikasi dan pengelompokan buku berdasarkan tema."
                onClick={handleKlikKategori}
                gradientFrom="from-emerald-500"
                gradientTo="to-green-600"
                textColor="text-white"
              />
            </div>

            {tampilBuku && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-xl space-y-6"
              >
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <FaListUl className="mr-3 text-sky-600" />
                  Daftar Koleksi Buku
                </h2>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4 shadow-sm">
                  <div className="relative w-full md:flex-1">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari buku (judul, pengarang, dll...)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm shadow-inner"
                    />
                  </div>
                  <div className="relative w-full md:w-auto">
                    <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full md:w-52 pl-10 pr-4 py-2.5 appearance-none rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm shadow-inner"
                    >
                      <option value="">Semua Status</option>
                      <option value="tersedia">Tersedia</option>
                      <option value="dipinjam">Dipinjam</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
                  <motion.table
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-w-full text-sm"
                  >
                    <thead className="bg-slate-100">
                      <tr>
                        {[
                          "Kode", "Judul Buku", "Kategori", "Pengarang", "Penerbit", "Tahun", "Status"
                        ].map((head) => (
                          <th key={head} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredEksemplar.length > 0 ? (
                        filteredEksemplar.map((bukus) => (
                          <motion.tr
                            key={bukus.id || bukus.kodeEksemplar}
                            variants={rowVariants}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-slate-600">{bukus.kodeEksemplar}</td>
                            <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-800 max-w-xs truncate" title={bukus.buku?.judul}>
                              {bukus.buku?.judul}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-600 text-xs max-w-xs truncate" title={bukus.buku?.kategori?.map((k) => k.kategori?.nama).join(", ") || "-"}>
                              {bukus.buku?.kategori?.map((k) => k.kategori?.nama).join(", ") || "-"}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-600 max-w-xs truncate" title={bukus.buku?.pengarang}>
                              {bukus.buku?.pengarang}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-600 max-w-xs truncate" title={bukus.buku?.penerbit}>
                              {bukus.buku?.penerbit}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-600">{bukus.buku?.tahunTerbit}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full capitalize ${
                                  bukus.status?.toLowerCase() === "tersedia"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {bukus.status?.toLowerCase() === "tersedia" ? <FaCheckCircle className="mr-1.5" /> : <FaRegClock className="mr-1.5" />}
                                {bukus.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-8 text-slate-500 italic">
                            Tidak ada data buku yang cocok dengan filter Anda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </motion.table>
                </div>
              </motion.section>
            )}

            {tampilKategori && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-xl space-y-6"
              >
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <FaThLarge className="mr-3 text-emerald-600" />
                  Daftar Kategori Buku
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {kategori.length > 0 ? (
                    kategori.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-emerald-300 transform hover:-translate-y-1 transition-all"
                      >
                        <div className="flex items-center mb-2">
                          <FaFolder className="text-emerald-500 mr-2.5 text-lg" />
                          <h3 className="text-md font-semibold text-slate-800 truncate" title={item.nama}>
                            {item.nama}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {item.deskripsi || "Tidak ada deskripsi."}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="col-span-full text-center py-8 text-slate-500 italic">
                      Belum ada kategori yang ditambahkan.
                    </p>
                  )}
                </div>
              </motion.section>
            )}
          </motion.div>
        )}

        {active !== "dashboard" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
            {active === "buku" && <AddBookForm globalApiConfig={globalApiConfig} onSuccess={() => { console.log("Form buku sukses"); setSudahAmbilBuku(false); }} />}
            {active === "kategori" && <AddKategoriForm globalApiConfig={globalApiConfig} onSuccess={() => { console.log("Kategori Form sukses"); setSudahAmbilKategori(false); }}/>}
            {active === "BukuKategori" && <AddBukuKatForm globalApiConfig={globalApiConfig} />}
            {active === "Konfirmasi" && <KonfirmasiPermintaan globalApiConfig={globalApiConfig} />}
            {active === "Riwayat" && <Riwayat />}
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPageAdmin;