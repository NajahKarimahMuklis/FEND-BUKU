import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  FaBook,
  FaCheck,
  FaFolder,
  FaHome,
  FaHistory,
  FaExclamationTriangle,
  FaListUl,
  FaFilter,
  FaSearch,
  FaBookOpen,
  FaTags,
  FaUserFriends,
  FaThLarge,
  FaEdit,
  FaTimes,
  FaUsers, // Tetap diimport karena digunakan di sidebar dan ManageUser
  FaTrash, // Tetap diimport karena masih digunakan untuk menghapus eksemplar buku
} from "react-icons/fa";
import { useNavigate } from "react-router";

// Import komponen Form
import AddBookForm from "../components/AddBookForm";
import AddBukuKatForm from "../components/AddBukuKatForm";
import AddKategoriForm from "../components/AddKategoriForm";
import KonfirmasiPermintaan from "../components/KonfirmasiPermintaan";
import Riwayat from "../components/Riwayat";
import ManageUser from "../components/ManageUser"; // Import komponen ManageUser yang baru

function LandingPageAdmin() {
  const [active, setActive] = useState("dashboard"); // Mengontrol menu sidebar aktif
  const [adminName, setAdminName] = useState("");
  const [eksemplarBuku, setEksemplarBuku] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [visibleSection, setVisibleSection] = useState(null);
  const [dataFetched, setDataFetched] = useState({
    buku: false,
    kategori: false,
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showTokenExpiryPopup, setShowTokenExpiryPopup] = useState(false);
  const [showEditKategoriModal, setShowEditKategoriModal] = useState(false);
  const [currentKategoriToEdit, setCurrentKategoriToEdit] = useState(null);
  const [editNamaKategori, setEditNamaKategori] = useState("");
  const [editDeskripsiKategori, setEditDeskripsiKategori] = useState("");
  const navigate = useNavigate();
  const handleSessionExpired = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    localStorage.removeItem("adminName");
    setShowTokenExpiryPopup(true);
    setTimeout(() => navigate("/login"), 3500);
  };

  // Wrapper untuk fetch API dengan penanganan otentikasi
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
      default:
        console.warn("Tipe data tidak dikenal:", type);
        return;
    }

    try {
      const res = await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/${endpoint}`
      );
      const result = await res.json();
      if (res.ok) {
        setDataFunc(result.data || []);
        setDataFetched((prev) => ({ ...prev, [type]: true }));
        // Jika fetch buku, juga fetch kategori untuk filter
        if (type === "buku" && !dataFetched.kategori) {
          loadData("kategori");
        }
      } else {
        console.error(`Gagal memuat data ${type}:`, result.message);
      }
    } catch (error) {
      if (error.message !== "Sesi kedaluwarsa")
        console.error(`Gagal memuat data ${type}:`, error);
    }
  };

  const handleShowSection = (type) => {
    if (visibleSection === type) {
      setVisibleSection(null);
    } else {
      setVisibleSection(type);
      loadData(type); // Muat data yang sesuai
    }
    setQuery(""); // Reset filter/query saat ganti section
    setStatusFilter("");
    setKategoriFilter("");
    setCurrentPage(1);
  };

  // Memaksa refresh data (digunakan setelah operasi CRUD)
  const refreshData = (type) => {
    setDataFetched((prev) => ({ ...prev, [type]: false }));
    loadData(type);
  };

  // Fungsi untuk menghapus item (HANYA untuk eksemplar buku)
  const handleDelete = async (type, id, name) => {
    if (type !== "eksemplar") {
      alert("Operasi delete hanya diizinkan untuk eksemplar buku.");
      return;
    }

    if (!confirm(`Yakin mau hapus ${type} "${name}"?`)) return;

    const endpoint = `eksemplarBuku/${id}`;

    try {
      await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/${endpoint}`,
        { method: "DELETE" }
      );
      alert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} berhasil dihapus!`
      );
      refreshData(type);
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert(`Gagal menghapus ${type}: ${error.message || ""}`);
    }
  };

  // --- Fungsi untuk Fitur EDIT Kategori ---
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: editNamaKategori,
            deskripsi: editDeskripsiKategori,
          }),
        }
      );

      alert("Kategori berhasil diupdate!");
      setShowEditKategoriModal(false);
      setCurrentKategoriToEdit(null);
      setEditNamaKategori("");
      setEditDeskripsiKategori("");
      refreshData("kategori");
    } catch (error) {
      console.error("Error updating kategori:", error);
      alert(`Terjadi kesalahan saat mengupdate kategori: ${error.message}`);
    }
  };

  // --- Fungsi untuk Fitur EDIT User Dihapus dari sini dan dipindahkan ke ManageUser.jsx ---
  // const handleEditUserClick ...
  // const handleEditUserSubmit ...

  // --- 3. Kalkulasi Data (Memoized untuk performa) ---
  const filteredEksemplar = useMemo(() => {
    return eksemplarBuku.filter((item) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        item.buku?.judul?.toLowerCase().includes(q) ||
        item.buku?.pengarang?.toLowerCase().includes(q) ||
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

  // --- 4. Effects (Lifecycle) ---
  useEffect(() => {
    setAdminName(localStorage.getItem("adminName"));
    loadData("kategori"); // Muat kategori saat komponen dimuat untuk filter buku
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, kategoriFilter]);

  // --- 5. Render JSX ---
  return (
    <div
      className={`flex h-screen bg-slate-100 font-sans raleway-general ${
        showTokenExpiryPopup ? "blur-sm pointer-events-none" : ""
      }`}
    >
      {/* Popup Sesi Kedaluwarsa */}
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

      {/* Sidebar Navigasi */}
      <div className="w-64 bg-emerald-800 text-slate-100 flex flex-col justify-between shadow-lg">
        <div>
          <h2 className="text-2xl font-semibold p-6 text-white">
            BookNest Admin
          </h2>
          <nav className="flex flex-col gap-1 p-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
              { id: "buku", label: "Tambah Buku", icon: <FaBook /> },
              { id: "kategori", label: "Tambah Kategori", icon: <FaFolder /> },
              {
                id: "BukuKategori",
                label: "Buku Kategori",
                icon: <FaUserFriends />,
              },
              { id: "Konfirmasi", label: "Konfirmasi", icon: <FaCheck /> },
              { id: "Riwayat", label: "Riwayat", icon: <FaHistory /> },
              { id: "manageUsers", label: "Kelola User", icon: <FaUsers /> }, // Menu baru untuk Manage User
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
        <div className="p-4 border-t border-emerald-700">
          <button
            onClick={handleSessionExpired}
            className="w-full bg-red-600 py-2.5 rounded-lg hover:bg-red-700 font-semibold"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Konten Dashboard (Kartu-kartu) */}
        {active === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Selamat Datang, {adminName?.split("@")[0] || "Admin"}! 👋
              </h1>
              <p className="text-md text-slate-600 mt-1">
                Semoga harimu menyenangkan!
              </p>
            </div>

            {/* Bagian Kartu Dashboard untuk navigasi kelola data */}
            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => handleShowSection("buku")}
                className="bg-gradient-to-br from-sky-500 to-indigo-600 p-6 rounded-2xl shadow-xl cursor-pointer text-white"
              >
                <FaBookOpen className="text-4xl mb-3" />
                <h2 className="text-xl font-bold">Kelola Koleksi Buku</h2>
              </div>
              <div
                onClick={() => handleShowSection("kategori")}
                className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-xl cursor-pointer text-white"
              >
                <FaTags className="text-4xl mb-3" />
                <h2 className="text-xl font-bold">Kelola Kategori Buku</h2>
              </div>
              {/* Card "Kelola User" DIHAPUS dari sini, karena sudah di sidebar */}
            </div>

            {/* BAGIAN UNTUK MENAMPILKAN DAFTAR KOLEKSI BUKU (Eksemplar) */}
            {visibleSection === "buku" && (
              <section className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
                <h2 className="text-2xl font-semibold">
                  <FaListUl className="inline mr-3 text-sky-600" />
                  Daftar Koleksi Buku
                </h2>
                <div className="p-4 bg-slate-50 rounded-xl text-lg flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Cari Judul, Kode..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-5 bg-gray-200 rounded-xl"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="md:w-52 p-2 border rounded-xl bg-white"
                  >
                    <option value="">Semua Status</option>
                    <option value="tersedia">Tersedia</option>
                    <option value="dipinjam">Dipinjam</option>
                  </select>
                  {/* Filter Kategori Buku */}
                  <select
                    value={kategoriFilter}
                    onChange={(e) => setKategoriFilter(e.target.value)}
                    className="md:w-52 p-1  border rounded-xl bg-white"
                  >
                    <option value="">Semua Kategori</option>
                    {kategori.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                      <tr>
                        {["Kode", "Judul", "Kategori", "Status", "Aksi"].map(
                          (h) => (
                            <th
                              key={h}
                              className="p-4 text-left text-lg font-bold uppercase tracking-wider text-slate-600 border-r border-slate-200 last:border-r-0"
                            >
                              <div className="flex items-center gap-2">
                                {h === "Kode" && (
                                  <span className="text-blue-500">🏷️</span>
                                )}
                                {h === "Judul" && (
                                  <span className="text-emerald-500">📚</span>
                                )}
                                {h === "Kategori" && (
                                  <span className="text-purple-500">📂</span>
                                )}
                                {h === "Status" && (
                                  <span className="text-amber-500">⚡</span>
                                )}
                                {h === "Aksi" && (
                                  <span className="text-red-500">⚙️</span>
                                )}
                                {h}
                              </div>
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {paginatedEksemplar.length > 0 ? (
                        paginatedEksemplar.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50 text-lg transition-colors duration-200 group"
                          >
                            <td className="p-4 font-mono  border-r border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                <code className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200">
                                  {item.kodeEksemplar}
                                </code>
                              </div>
                            </td>
                            <td
                              className="p-4 font-medium max-w-xs truncate border-r border-slate-100"
                              title={item.buku?.judul}
                            >
                              <div className="group-hover:text-emerald-600 transition-colors cursor-help">
                                {item.buku?.judul}
                              </div>
                            </td>
                            <td
                              className="p-4 max-w-xs truncate border-r border-slate-100"
                              title={
                                item.buku?.kategori
                                  ?.map((k) => k.kategori?.nama)
                                  .join(", ") || "-"
                              }
                            >
                              {item.buku?.kategori
                                ?.map((k) => k.kategori?.nama)
                                .join(", ") || "-"}
                            </td>
                            <td className="p-4 border-r border-slate-100">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    item.status?.toLowerCase() === "tersedia"
                                      ? "bg-green-400 animate-pulse"
                                      : "bg-yellow-400"
                                  }`}
                                ></div>
                                <span
                                  className={`px-3 py-1  font-semibold rounded-full capitalize border transition-all duration-200 ${
                                    item.status?.toLowerCase() === "tersedia"
                                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                  }`}
                                >
                                  {item.status?.toLowerCase() === "tersedia"
                                    ? "✓ Tersedia"
                                    : "⏳ Dipinjam"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      "eksemplar",
                                      item.id,
                                      item.kodeEksemplar
                                    )
                                  }
                                  className="group/btn relative p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
                                  title={`Hapus eksemplar ${item.kodeEksemplar}`}
                                >
                                  <FaTrash className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Hapus
                                  </div>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-slate-500"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📭</span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-600">
                                  Data tidak ditemukan
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                  Belum ada eksemplar yang tersedia
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-xl disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-xl disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* BAGIAN UNTUK MENAMPILKAN DAFTAR KATEGORI (Hanya tombol edit) */}
            {visibleSection === "kategori" && (
              <section className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
                <h2 className="text-2xl font-semibold">
                  <FaThLarge className="inline mr-3 text-emerald-600" />
                  Daftar Kategori
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {kategori.length > 0 ? (
                    kategori.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {item.nama}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {item.deskripsi || "Tidak ada deskripsi."}
                          </p>
                        </div>
                        <div className="mt-4 flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditKategoriClick(item)}
                            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            title="Edit Kategori"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-slate-500">
                      Belum ada kategori.
                    </p>
                  )}
                </div>
              </section>
            )}
          </motion.div>
        )}

        {/* Bagian untuk Form/Komponen Lain yang diakses dari Sidebar */}
        {active === "buku" && (
          <AddBookForm
            globalApiConfig={globalApiConfig}
            onSuccess={() => refreshData("buku")}
          />
        )}
        {active === "kategori" && (
          <AddKategoriForm
            globalApiConfig={globalApiConfig}
            onSuccess={() => refreshData("kategori")}
          />
        )}
        {active === "BukuKategori" && (
          <AddBukuKatForm globalApiConfig={globalApiConfig} />
        )}
        {active === "Konfirmasi" && (
          <KonfirmasiPermintaan globalApiConfig={globalApiConfig} />
        )}
        {active === "Riwayat" && <Riwayat />}
        {active === "manageUsers" && ( // Render ManageUser dari sidebar
          <ManageUser globalApiConfig={globalApiConfig} />
        )}
      </main>

      {/* Modal Edit Kategori */}
      {showEditKategoriModal && currentKategoriToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowEditKategoriModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Nama Kategori
                </label>
                <input
                  type="text"
                  id="editNamaKategori"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={editNamaKategori}
                  onChange={(e) => setEditNamaKategori(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="editDeskripsiKategori"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deskripsi (Opsional)
                </label>
                <textarea
                  id="editDeskripsiKategori"
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  value={editDeskripsiKategori}
                  onChange={(e) => setEditDeskripsiKategori(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditKategoriModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPageAdmin;
