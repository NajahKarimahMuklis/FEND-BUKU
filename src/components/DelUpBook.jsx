import { useEffect, useState } from "react";
import { FaTrash, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import ikon yang diperlukan
import { motion, AnimatePresence } from "framer-motion"; // Import motion dan AnimatePresence untuk animasi

function DelUpBook() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null); // Menyimpan buku yang akan dihapus
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // 'success' atau 'error'

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

  const handleDeleteClick = (buku) => {
    setBookToDelete(buku);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    setShowConfirmModal(false); // Tutup modal konfirmasi
    
    try {
      const response = await fetch(`http://localhost:3000/buku/${bookToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        // Coba baca pesan error dari respons jika ada
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus buku");
      }

      const result = await response.json();
      console.log(result.message);
      showTimedNotification(result.message || "Buku berhasil dihapus!", "success");

      // Perbarui state setelah berhasil
      setBooks((prevBooks) => prevBooks.filter((buku) => buku.id !== bookToDelete.id));
      setBookToDelete(null); // Reset buku yang akan dihapus
    } catch (error) {
      showTimedNotification(error.message || "Terjadi kesalahan saat menghapus buku.", "error");
      console.error("Error saat menghapus buku:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setBookToDelete(null); // Reset buku yang akan dihapus
  };

  useEffect(() => {
    const fetchBuku = async () => {
      try {
        const response = await fetch("http://localhost:3000/buku", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data buku");
        }

        const result = await response.json();

        if (result.data) {
          setBooks(result.data);
        } else {
          setBooks([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuku();
  }, []);

  // Tampilan loading yang lebih menarik
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-slate-50 rounded-xl shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
        <p className="ml-4 text-lg text-slate-700">Memuat daftar buku...</p>
      </div>
    );
  }

  // Tampilan jika tidak ada buku ditemukan
  if (books.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 bg-slate-50 rounded-xl shadow-md text-slate-600 italic">
        <p>Tidak ada buku ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b-2 pb-3 border-emerald-200">
        Daftar Koleksi Buku
      </h1>

      {/* Notifikasi */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center z-50 ${
              notificationType === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {notificationType === "success" ? (
              <FaCheckCircle className="mr-3 text-xl" />
            ) : (
              <FaTimesCircle className="mr-3 text-xl" />
            )}
            <p className="font-medium">{notificationMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((buku) => (
          <li
            key={buku.id}
            className="p-5 bg-slate-50 rounded-xl shadow-md border border-slate-200
                       hover:shadow-lg hover:border-emerald-300 transform hover:-translate-y-1
                       transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2 leading-tight">
                {buku.judul}
              </h2>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Pengarang:</span> {buku.pengarang}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Penerbit:</span> {buku.penerbit}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Tahun Terbit:</span> {buku.tahunTerbit}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                <span className="font-medium">Jumlah Eksemplar:</span> {buku.jumlahBuku || "N/A"}
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              {/* Tombol Hapus */}
              <button
                onClick={() => handleDeleteClick(buku)} // Panggil handleDeleteClick
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600
                           transition-colors duration-200 shadow-md hover:shadow-lg
                           flex items-center justify-center text-lg"
                title="Hapus Buku"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal Konfirmasi Kustom */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center"
            >
              <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-3">Konfirmasi Penghapusan</h3>
              <p className="text-slate-600 mb-6">
                Apakah Anda yakin ingin menghapus buku "
                <span className="font-semibold">{bookToDelete?.judul}</span>"?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DelUpBook;
