import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  FaBook,
  FaCheck,
  FaFolder,
  FaHome,
  FaHistory,
  FaExclamationTriangle,
  FaListUl,
  FaTags,
  FaUserFriends,
  FaThLarge,
  FaEdit,
  FaTimes,
  FaUsers,
  FaTrash,
  FaArchive,
  FaBars,
  FaUndo,
  FaBookOpen,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router";

// Import komponen
import AddBookForm from "../components/AddBookForm";
import AddBukuKatForm from "../components/AddBukuKatForm";
import AddKategoriForm from "../components/AddKategoriForm";
import KonfirmasiPermintaan from "../components/KonfirmasiPermintaan";
import Riwayat from "../components/Riwayat";
import ManageUser from "../components/ManageUser";

function LandingPageAdmin() {
  // --- STATE MANAGEMENT ---
  const [active, setActive] = useState("dashboard");
  const [adminName, setAdminName] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Data States
  const [eksemplarBuku, setEksemplarBuku] = useState([]);
  const [arsipEksemplar, setArsipEksemplar] = useState([]);
  const [kategori, setKategori] = useState([]);

  const [dataFetched, setDataFetched] = useState({
    buku: false,
    kategori: false,
    arsip: false,
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditKategoriModal, setShowEditKategoriModal] = useState(false);
  const [currentKategoriToEdit, setCurrentKategoriToEdit] = useState(null);
  const [editNamaKategori, setEditNamaKategori] = useState("");
  const [editDeskripsiKategori, setEditDeskripsiKategori] = useState("");
  const [showTokenExpiryPopup, setShowTokenExpiryPopup] = useState(false);

  const navigate = useNavigate();

  // --- API & SESSION HANDLING ---
  const handleSessionExpired = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    localStorage.removeItem("adminName");
    setShowTokenExpiryPopup(true);
    setTimeout(() => navigate("/login"), 3500);
  };

  const fetchDataWithAuth = async (url, options = {}) => {
    const response = await fetch(url, { credentials: "include", ...options });
    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("Sesi kedaluwarsa");
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }
    return response;
  };

  const globalApiConfig = { fetchDataWithAuth, handleSessionExpired };

  const loadData = async (type) => {
    if (dataFetched[type] && !["kategori"].includes(type)) return;

    let endpoint = "";
    let setDataFunc;

    switch (type) {
      case "buku":
        endpoint = "eksemplarBuku";
        setDataFunc = setEksemplarBuku;
        break;
      case "kategori":
        endpoint = "kategori";
        setDataFunc = setKategori;
        break;
      case "arsip":
        endpoint = "eksemplarBuku/archived";
        setDataFunc = setArsipEksemplar;
        break;
      default:
        return;
    }

    try {
      const res = await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/${endpoint}`
      );
      const result = await res.json();
      setDataFunc(result.data || []);
      setDataFetched((prev) => ({ ...prev, [type]: true }));
    } catch (error) {
      setDataFunc([]);
      if (error.message !== "Sesi kedaluwarsa")
        console.error(`Gagal memuat data ${type}:`, error);
    }
  };

  const refreshData = (type) => {
    setDataFetched((prev) => ({ ...prev, [type]: false }));
    loadData(type);
  };

  // --- CRUD HANDLERS ---
  const handleArchive = async (id, name) => {
    if (!confirm(`Yakin mau arsipkan eksemplar "${name}"?`)) return;
    try {
      await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/eksemplarBuku/archive/${id}`,
        { method: "PATCH" }
      );
      alert(`Eksemplar "${name}" berhasil diarsipkan.`);
      refreshData("buku");
      setDataFetched((prev) => ({ ...prev, arsip: false }));
    } catch (error) {
      console.error("Gagal mengarsipkan:", error);
      alert(`Gagal mengarsipkan: ${error.message || ""}`);
    }
  };

  const handleRestore = async (id, name) => {
    if (!confirm(`Yakin mau pulihkan eksemplar "${name}"?`)) return;
    try {
      await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/eksemplarBuku/restore/${id}`,
        { method: "PATCH" }
      );
      alert(`Eksemplar "${name}" berhasil dipulihkan.`);
      refreshData("arsip");
      setDataFetched((prev) => ({ ...prev, buku: false }));
    } catch (error) {
      console.error("Gagal memulihkan:", error);
      alert(`Gagal memulihkan: ${error.message || ""}`);
    }
  };

  const handleEditKategoriClick = (kategoriItem) => {
    setCurrentKategoriToEdit(kategoriItem);
    setEditNamaKategori(kategoriItem.nama);
    setEditDeskripsiKategori(kategoriItem.deskripsi || "");
    setShowEditKategoriModal(true);
  };

  const handleEditKategoriSubmit = async (e) => {
    e.preventDefault();
    if (!currentKategoriToEdit) return;
    try {
      await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/kategori/${currentKategoriToEdit.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: editNamaKategori,
            deskripsi: editDeskripsiKategori,
          }),
        }
      );
      alert("Kategori berhasil diupdate!");
      setShowEditKategoriModal(false);
      refreshData("kategori");
    } catch (error) {
      console.error("Error updating kategori:", error);
      alert(`Terjadi kesalahan: ${error.message}`);
    }
  };

  // --- MEMOIZED CALCULATIONS ---
  const filteredEksemplar = useMemo(() => {
    return eksemplarBuku.filter((item) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        item.buku?.judul?.toLowerCase().includes(q) ||
        item.kodeEksemplar?.toLowerCase().includes(q);
      const matchesStatus =
        !statusFilter ||
        item.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesKategori =
        !kategoriFilter ||
        item.buku?.kategori?.some(
          (k) => k.kategori?.id?.toString() === kategoriFilter
        );
      return matchesQuery && matchesStatus && matchesKategori;
    });
  }, [eksemplarBuku, query, statusFilter, kategoriFilter]);

  const totalPages = Math.ceil(filteredEksemplar.length / itemsPerPage);
  const paginatedEksemplar = useMemo(() => {
    return filteredEksemplar.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredEksemplar, currentPage, itemsPerPage]);

  // --- LIFECYCLE EFFECTS ---
  useEffect(() => {
    setAdminName(localStorage.getItem("adminName"));
    loadData("kategori");
  }, []);

  useEffect(() => {
    if (active === "buku") loadData("buku");
    if (active === "arsip") loadData("arsip");
    if (active === "kategori") loadData("kategori");

    setQuery("");
    setStatusFilter("");
    setKategoriFilter("");
    setCurrentPage(1);
  }, [active]);

  return (
    <div
      className={`flex h-screen bg-gradient-to-r from-green-200 to-blue-200 raleway-general`}
    >
      {showTokenExpiryPopup && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
            <FaExclamationTriangle className="text-7xl text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold">Sesi Kedaluwarsa</h3>
            <p className="text-slate-600 mt-2">
              Anda akan dialihkan ke halaman login.
            </p>
          </div>
        </div>
      )}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
    fixed xl:static z-50 inset-y-0 left-0 transform xl:transform-none
    w-64 bg-emerald-800 text-slate-100 flex flex-col justify-between shadow-lg
    transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0
  `}
      >
        {/* Bagian Atas: Tombol close + Judul */}
        <div>
          {/* Tombol close hanya di mobile */}
          <div className="flex justify-end xl:hidden p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Judul Sidebar */}
          <h2 className="text-2xl font-semibold px-6 pb-2 pt-15 text-white">
            BookNest Admin
          </h2>

          {/* Navigasi */}
          <nav className="flex flex-col gap-1 p-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
              { id: "buku", label: "Kelola Buku", icon: <FaBookOpen /> },
              { id: "kategori", label: "Kelola Kategori", icon: <FaTags /> },
              { id: "arsip", label: "Arsip Eksemplar", icon: <FaArchive /> },
              {
                id: "BukuKategori",
                label: "Hubungkan Buku",
                icon: <FaUserFriends />,
              },
              {
                id: "Konfirmasi",
                label: "Konfirmasi Pinjam",
                icon: <FaCheck />,
              },
              { id: "Riwayat", label: "Riwayat Pinjam", icon: <FaHistory /> },
              { id: "manageUsers", label: "Kelola User", icon: <FaUsers /> },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center text-left p-3 hover:bg-emerald-700 rounded-lg transition-colors ${
                  active === id ? "bg-emerald-600 shadow-inner" : ""
                }`}
              >
                <span className="w-6 mr-3">{icon}</span> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tombol Logout */}
        <div className="p-4 border-t border-emerald-700">
          <button
            onClick={handleSessionExpired}
            className="w-full bg-red-600 py-2.5 rounded-lg hover:bg-red-700 font-semibold"
          >
            Keluar
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="xl:hidden fixed top-4 left-4 z-40 p-2 bg-emerald-800 text-white rounded-lg shadow-lg"
        >
          <FaBars />
        </button>
        {active === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 "
          >
            <div className="pt-7 px-4 text-center xl:text-left sm:px-0">
              <h1 className="text-3xl font-bold text-slate-800">
                Selamat Datang, {adminName?.split("@")[0] || "Admin"}! 👋
              </h1>
              <p className="text-md text-slate-600 mt-1">
                Gunakan panel ini untuk mengelola data perpustakaan.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => setActive("buku")}
                className="bg-gradient-to-br from-sky-500 to-indigo-600 p-6 rounded-2xl shadow-xl cursor-pointer text-white hover:scale-105 transition-transform"
              >
                <FaBookOpen className="text-4xl mb-3" />
                <h2 className="text-xl font-bold">Kelola Koleksi Buku</h2>
              </div>
              <div
                onClick={() => setActive("kategori")}
                className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-xl cursor-pointer text-white hover:scale-105 transition-transform"
              >
                <FaTags className="text-4xl mb-3" />
                <h2 className="text-xl font-bold">Kelola Kategori Buku</h2>
              </div>
              <div
                onClick={() => setActive("arsip")}
                className="bg-gradient-to-br from-slate-500 to-gray-600 p-6 rounded-2xl shadow-xl cursor-pointer text-white hover:scale-105 transition-transform"
              >
                <FaArchive className="text-4xl mb-3" />
                <h2 className="text-xl font-bold">Lihat Arsip</h2>
              </div>
            </div>
          </motion.div>
        )}

        {active === "buku" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-slate-200 pt-7">
              <h1 className="text-2xl font-bold text-slate-800 pt-4 sm:pt-0">
                <FaBookOpen className="inline-block mr-4 text-sky-600" />
                Kelola Koleksi Buku
              </h1>

              <button
                onClick={() => setShowAddBookModal(true)}
                className="mt-4 sm:mt-0 bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-300"
              >
                <FaPlus />
                Tambah Buku
              </button>
            </div>

            <section className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full">
                  <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Judul, Kode..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-2 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-52 p-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                >
                  <option value="">Semua Status</option>
                  <option value="TERSEDIA">Tersedia</option>
                  <option value="DIPINJAM">Dipinjam</option>
                </select>
                <select
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="w-full md:w-52 p-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                >
                  <option value="">Semua Kategori</option>
                  {kategori.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-base">
                  <thead className="border-b-2 border-slate-200">
                    <tr>
                      <th className="p-4 text-left font-semibold text-slate-600 uppercase tracking-wider">
                        Kode
                      </th>
                      <th className="p-4 text-left font-semibold text-slate-600 uppercase tracking-wider">
                        Judul
                      </th>
                      <th className="p-4 text-left font-semibold text-slate-600 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="p-4 text-left font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedEksemplar.length > 0 ? (
                      paginatedEksemplar.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 font-mono text-sky-600">
                            {item.kodeEksemplar}
                          </td>
                          <td className="p-4 font-medium text-slate-800">
                            {item.buku?.judul}
                          </td>
                          <td className="p-4 text-slate-600 text-sm">
                            {item.buku?.kategori
                              ?.map((k) => k.kategori.nama)
                              .join(", ")}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${
                                item.status === "TERSEDIA"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {item.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() =>
                                handleArchive(item.id, item.kodeEksemplar)
                              }
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                              title={`Arsipkan ${item.kodeEksemplar}`}
                            >
                              <FaArchive />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-16 text-center text-slate-500"
                        >
                          <FaBookOpen className="mx-auto text-4xl text-slate-300 mb-4" />
                          Tidak ada data buku aktif yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-6 mt-4 border-t border-slate-200">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <span className="font-medium text-slate-600">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {active === "kategori" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-8"
          >
            <h1 className="text-3xl font-bold text-slate-800 pt-7 pl-7">
              <FaTags className="inline-block mr-4 text-emerald-600" />
              Kelola Kategori
            </h1>
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <AddKategoriForm
                globalApiConfig={globalApiConfig}
                onSuccess={() => refreshData("kategori")}
              />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">
                Daftar Kategori Saat Ini
              </h2>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {kategori.length > 0 ? (
                  kategori.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.nama}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.deskripsi || "Tidak ada deskripsi."}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditKategoriClick(item)}
                          className="p-2 text-slate-500 hover:text-blue-600"
                          title="Edit Kategori"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">
                    Belum ada kategori.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {active === "arsip" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold pt-7">
              <FaArchive className="inline mr-3 text-slate-600" />
              Daftar Eksemplar yang Diarsipkan
            </h2>
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-4 text-left font-bold">Kode</th>
                      <th className="p-4 text-left font-bold">Judul</th>
                      <th className="p-4 text-left font-bold">Status</th>
                      <th className="p-4 text-center font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arsipEksemplar.length > 0 ? (
                      arsipEksemplar.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="p-4 font-mono">
                            {item.kodeEksemplar}
                          </td>
                          <td className="p-4">{item.buku?.judul || "N/A"}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-full font-semibold">
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() =>
                                handleRestore(item.id, item.kodeEksemplar)
                              }
                              className="p-2 text-slate-500 hover:text-emerald-600 transition-colors"
                              title="Pulihkan Eksemplar"
                            >
                              <FaUndo />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-slate-500"
                        >
                          Arsip kosong.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {active === "BukuKategori" && (
          <AddBukuKatForm globalApiConfig={globalApiConfig} />
        )}
        {active === "Konfirmasi" && (
          <KonfirmasiPermintaan globalApiConfig={globalApiConfig} />
        )}
        {active === "Riwayat" && <Riwayat />}
        {active === "manageUsers" && (
          <ManageUser globalApiConfig={globalApiConfig} />
        )}
      </main>

      <AnimatePresence>
        {showAddBookModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative"
            >
              <div className="p-8 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <FaPlus className="text-emerald-500" />
                  Tambah Eksemplar Buku Baru
                </h2>
                <p className="text-slate-500 mt-1">
                  Isi detail buku dan jumlah eksemplar yang akan ditambahkan.
                </p>
              </div>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 z-10 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <FaTimes size={20} />
              </button>
              <AddBookForm
                globalApiConfig={globalApiConfig}
                onSuccess={() => {
                  setShowAddBookModal(false);
                  refreshData("buku");
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showEditKategoriModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative p-8"
          >
            <button
              onClick={() => setShowEditKategoriModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 z-10 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Edit Kategori
            </h2>
            <form onSubmit={handleEditKategoriSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="editNamaKategori"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Kategori
                </label>
                <input
                  type="text"
                  id="editNamaKategori"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  value={editNamaKategori}
                  onChange={(e) => setEditNamaKategori(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="editDeskripsiKategori"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi (Opsional)
                </label>
                <textarea
                  id="editDeskripsiKategori"
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  value={editDeskripsiKategori}
                  onChange={(e) => setEditDeskripsiKategori(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditKategoriModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default LandingPageAdmin;
