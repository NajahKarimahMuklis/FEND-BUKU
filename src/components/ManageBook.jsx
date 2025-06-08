import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaRegClock,
  FaTags,
  FaTimesCircle, // Ikon untuk kesalahan/batal
  FaCheckCircle as FaCheckSuccess, // Ikon untuk sukses
  FaExclamationCircle // Ikon untuk peringatan umum/info
} from "react-icons/fa";
import AddBookForm from "./AddBookForm"; // Menggunakan kembali AddBookForm untuk menambahkan buku baru

// Komponen UpdateBookForm
// Saya menempatkannya di sini untuk kesederhanaan, tetapi bisa dipindahkan ke file terpisah
const UpdateBookForm = ({ book, categories, globalApiConfig, onUpdateSuccess, onCancel }) => {
  const { fetchDataWithAuth } = globalApiConfig;
  const [formData, setFormData] = useState({
    judul: book.buku?.judul || "",
    pengarang: book.buku?.pengarang || "",
    penerbit: book.buku?.penerbit || "",
    tahunTerbit: book.buku?.tahunTerbit || "",
    
  });
  // State untuk kategori yang dipilih (saat ini hanya untuk tampilan, karena endpoint PUT tidak mengupdate kategori)
  const [selectedCategories, setSelectedCategories] = useState(
    book.buku?.kategori?.map(k => k.kategoriId.toString()) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Menangani perubahan kategori (saat ini tidak berpengaruh pada update buku via API yang diberikan)
  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedCategories(value);
  };

  // Menangani submit form update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      judul: formData.judul,
      pengarang: formData.pengarang,
      penerbit: formData.penerbit,
      tahunTerbit: parseInt(formData.tahunTerbit),
      // Sertakan dummy userId dan statusBukuId jika backend Anda memerlukannya,
      // meskipun tidak langsung digunakan untuk pembaruan, sesuai endpoint yang Anda berikan.
      // Anda mungkin perlu menyesuaikan ini berdasarkan persyaratan backend Anda yang sebenarnya untuk bidang ini.
      userId: 1, // Mengasumsikan ID pengguna admin default untuk kesederhanaan
      statusBukuId: 1 // Mengasumsikan ID status default (misalnya, 'tersedia') untuk kesederhanaan
    };

    try {
      const response = await fetchDataWithAuth(`https://be-appbuku-production-6cfd.up.railway.app/buku/${book.bukuId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        // Jika backend Anda juga menangani pembaruan kategori melalui endpoint ini,
        // Anda akan mengirim permintaan terpisah atau memodifikasi payload.
        // Untuk saat ini, mengasumsikan pembaruan kategori terpisah atau ditangani secara berbeda.
        onUpdateSuccess(result.message || "Buku berhasil diperbarui!");
      } else {
        setError(result.message || "Gagal memperbarui buku.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-lg space-y-5"
    >
      <h3 className="text-xl font-semibold text-slate-800">Perbarui Detail Buku</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
          <FaTimesCircle className="mr-3 text-red-500" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="judul" className="block text-sm font-medium text-slate-700 mb-1">
          Judul Buku
        </label>
        <input
          type="text"
          id="judul"
          name="judul"
          value={formData.judul}
          onChange={handleChange}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
          required
        />
      </div>
      <div>
        <label htmlFor="pengarang" className="block text-sm font-medium text-slate-700 mb-1">
          Pengarang
        </label>
        <input
          type="text"
          id="pengarang"
          name="pengarang"
          value={formData.pengarang}
          onChange={handleChange}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
          required
        />
      </div>
      <div>
        <label htmlFor="penerbit" className="block text-sm font-medium text-slate-700 mb-1">
          Penerbit
        </label>
        <input
          type="text"
          id="penerbit"
          name="penerbit"
          value={formData.penerbit}
          onChange={handleChange}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
          required
        />
      </div>
      <div>
        <label htmlFor="tahunTerbit" className="block text-sm font-medium text-slate-700 mb-1">
          Tahun Terbit
        </label>
        <input
          type="number"
          id="tahunTerbit"
          name="tahunTerbit"
          value={formData.tahunTerbit}
          onChange={handleChange}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
          required
        />
      </div>
      {/* Pilihan kategori - ini saat ini hanya menampilkan, endpoint PUT Anda tidak mendukung pembaruan kategori secara langsung */}
      <div>
        <label htmlFor="categories" className="block text-sm font-medium text-slate-700 mb-1">
          Kategori (Saat Ini: {book.buku?.kategori?.map(k => k.kategori?.nama).join(", ") || "Tidak ada"})
        </label>
        <select
          id="categories"
          multiple
          value={selectedCategories}
          onChange={handleCategoryChange}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 h-24"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id.toString()}>
              {cat.nama}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          *Untuk mengubah kategori, Anda mungkin perlu mengelola "Buku Kategori" secara terpisah atau API update buku Anda harus mendukungnya.
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200 font-medium"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Memperbarui..." : "Perbarui Buku"}
        </button>
      </div>
    </motion.form>
  );
};


function ManageBooks({ globalApiConfig, refreshBooks, eksemplarBuku, kategori }) {
  const { fetchDataWithAuth } = globalApiConfig;

  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // State untuk menampung buku yang sedang diedit
  const [filteredBooks, setFilteredBooks] = useState([]); // Daftar buku yang difilter untuk ditampilkan
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // 'success' atau 'error'

  // Varian animasi untuk tabel
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };
  // Varian animasi untuk baris tabel
  const rowVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" }
    }
  };

  // Efek untuk memfilter buku
  useEffect(() => {
    let currentFilteredBooks = [...eksemplarBuku];

    // Filter berdasarkan query pencarian
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredBooks = currentFilteredBooks.filter(
        (item) =>
          item.buku?.judul?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.buku?.pengarang?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.buku?.penerbit?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.buku?.tahunTerbit?.toString().includes(lowerCaseSearchTerm) ||
          item.kodeEksemplar?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filter berdasarkan status
    if (statusFilter) {
      currentFilteredBooks = currentFilteredBooks.filter(
        (item) => item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter berdasarkan kategori
    if (categoryFilter) {
      currentFilteredBooks = currentFilteredBooks.filter((item) =>
        item.buku?.kategori?.some(
          (k) => k.kategori?.nama?.toLowerCase() === categoryFilter.toLowerCase()
        )
      );
    }

    setFilteredBooks(currentFilteredBooks);
  }, [eksemplarBuku, searchTerm, statusFilter, categoryFilter]);

  // Fungsi untuk menampilkan notifikasi berjangka waktu
  const showTimedNotification = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage("");
      setNotificationType("success");
    }, 3000); // Notifikasi menghilang setelah 3 detik
  };

  // Fungsi untuk menghapus buku
  const handleDeleteBook = async (bukuId, judulBuku) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus buku "${judulBuku}"?`)) {
      return;
    }

    try {
      const response = await fetchDataWithAuth(`https://be-appbuku-production-6cfd.up.railway.app/buku/${bukuId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (response.ok) {
        showTimedNotification(result.message || "Buku berhasil dihapus!", "success");
        refreshBooks(); // Memicu pengambilan ulang daftar buku di komponen induk
      } else {
        showTimedNotification(result.message || "Gagal menghapus buku.", "error");
        console.error("Gagal menghapus buku:", result.message);
      }
    } catch (error) {
      showTimedNotification("Terjadi kesalahan jaringan saat menghapus buku.", "error");
      console.error("Error menghapus buku:", error);
    }
  };

  // Fungsi yang dipanggil setelah pembaruan buku berhasil
  const handleUpdateSuccess = (message) => {
    setEditingBook(null); // Menutup formulir edit
    showTimedNotification(message, "success");
    refreshBooks(); // Mengambil ulang daftar buku untuk menampilkan data yang diperbarui
  };

  // Fungsi untuk membatalkan pembaruan
  const handleCancelUpdate = () => {
    setEditingBook(null); // Menutup formulir edit
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white p-6 rounded-2xl shadow-xl space-y-6"
    >
      <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
        <FaListUl className="mr-3 text-sky-600" />
        Kelola Koleksi Buku
      </h2>

      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg flex items-center ${
            notificationType === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {notificationType === "success" ? (
            <FaCheckSuccess className="mr-3 text-xl" />
          ) : (
            <FaTimesCircle className="mr-3 text-xl" />
          )}
          <p className="font-medium">{notificationMessage}</p>
        </motion.div>
      )}

      {isAddingBook ? (
        <AddBookForm
          globalApiConfig={globalApiConfig}
          onSuccess={() => {
            setIsAddingBook(false);
            refreshBooks();
            showTimedNotification("Buku berhasil ditambahkan!", "success");
          }}
          onCancel={() => setIsAddingBook(false)}
        />
      ) : editingBook ? (
        <UpdateBookForm
          book={editingBook}
          categories={kategori} // Meneruskan kategori ke formulir pembaruan
          globalApiConfig={globalApiConfig}
          onUpdateSuccess={handleUpdateSuccess}
          onCancel={handleCancelUpdate}
        />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsAddingBook(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold flex items-center"
            >
              <FaPlus className="mr-2" /> Tambah Buku Baru
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4 shadow-sm">
            <div className="relative w-full md:flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari buku (judul, pengarang, dll...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="relative w-full md:w-auto">
              <FaTags className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-52 pl-10 pr-4 py-2.5 appearance-none rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-inner"
              >
                <option value="">Semua Kategori</option>
                {kategori.map((cat) => (
                  <option key={cat.id} value={cat.nama}>
                    {cat.nama}
                  </option>
                ))}
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
                    "Kode", "Judul Buku", "Kategori", "Pengarang", "Penerbit", "Tahun", "Status", "Aksi"
                  ].map((head) => (
                    <th key={head} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <AnimatePresence>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((bukus) => (
                      <motion.tr
                        key={bukus.id || bukus.kodeEksemplar}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden" // Untuk penghapusan yang mulus
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
                        <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setEditingBook(bukus)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 p-1 rounded-md hover:bg-indigo-100"
                              title="Edit Buku"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(bukus.bukuId, bukus.buku?.judul)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150 p-1 rounded-md hover:bg-red-100"
                              title="Hapus Buku"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-slate-500 italic">
                        Tidak ada data buku yang cocok dengan filter Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </AnimatePresence>
            </motion.table>
          </div>
        </>
      )}
    </motion.section>
  );
}

export default ManageBooks;
