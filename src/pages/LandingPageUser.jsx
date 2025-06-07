import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaFilter,
  FaListUl,
  FaRegClock,
  FaSearch,
} from "react-icons/fa";

function LandingPageUser() {
  // --- STATE LAMA ---
  const [books, setBooks] = useState([]);
  const [eksemplarData, setEksemplarData] = useState([]);
  const [userName, setUserName] = useState(""); // Mengganti adminName menjadi userName
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE BARU UNTUK DIALOG (MODAL) ---
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedEksemplarId, setSelectedEksemplarId] = useState(null);
  const [tanggalKembali, setTanggalKembali] = useState("");

  const navigate = useNavigate();

  // --- Fetch Data Awal ---
  useEffect(() => {
    fetch("https://be-appbuku-production-6cfd.up.railway.app/buku", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) setBooks(res.data);
      })
      .catch((err) => console.error("Gagal fetch buku:", err));

    fetch("https://be-appbuku-production-6cfd.up.railway.app/eksemplarBuku", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) setEksemplarData(res.data);
      })
      .catch((err) => console.error("Gagal fetch eksemplar:", err));

    // Mengambil nama user dari localStorage, ganti "userName" jika key-nya berbeda
    const nameFromStorage = localStorage.getItem("userName");
    setUserName(nameFromStorage);
  }, []);

  // --- FUNGSI BARU UNTUK MEMBUKA DIALOG ---
  const handleOpenPinjamModal = (buku) => {
    const tersediaList = eksemplarData.filter(
      (e) => e.bukuId === buku.id && e.status === "TERSEDIA"
    );

    if (tersediaList.length === 0) {
      alert("Maaf, tidak ada eksemplar dari buku ini yang tersedia saat ini.");
      return;
    }

    // Simpan data buku dan eksemplar yang dipilih ke state
    setSelectedBook(buku);
    setSelectedEksemplarId(tersediaList[0].id); // Ambil eksemplar pertama yang tersedia
    setTanggalKembali(""); // Reset tanggal kembali setiap kali modal dibuka
    setShowModal(true); // Tampilkan modal
  };

  // --- FUNGSI BARU UNTUK MENGIRIM PERMINTAAN DARI DIALOG ---
  const handleSubmitPeminjaman = async () => {
    if (!selectedEksemplarId) {
      alert("Terjadi kesalahan, ID buku tidak ditemukan.");
      return;
    }

    // Siapkan body request
    const requestBody = {
      eksemplarId: selectedEksemplarId,
    };
    if (tanggalKembali) {
      requestBody.tanggalKembali = tanggalKembali;
    }

    try {
      const response = await fetch(
        "https://be-appbuku-production-6cfd.up.railway.app/peminjaman",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengirim permintaan peminjaman.");
      } else {
        alert("Permintaan peminjaman berhasil dikirim!");
        // Update state agar UI langsung berubah tanpa refresh
        setEksemplarData((currentData) =>
          currentData.map((e) =>
            e.id === selectedEksemplarId ? { ...e, status: "DIPINJAM" } : e
          )
        );
        setShowModal(false); // Tutup modal setelah berhasil
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat mengirim permintaan.");
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  // --- Logika Filtering dan Paginasi (Tidak berubah) ---
  const filteredBooks = books.filter((b) => {
    const matchesQuery = b.judul?.toLowerCase().includes(query.toLowerCase());
    const terkait = eksemplarData.filter((e) => e.bukuId === b.id);
    const tersediaCount = terkait.filter((e) => e.status === "TERSEDIA").length;
    const matchesStatus =
      statusFilter === "tersedia"
        ? tersediaCount > 0
        : statusFilter === "dipinjam"
        ? tersediaCount === 0 && terkait.length > 0
        : true;
    return matchesQuery && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  // Fungsi handlePinjam yang lama sudah tidak diperlukan lagi, jadi bisa dihapus.

  return (
    <div className="flex h-screen bg-gray-100 raleway-general">
      {/* DIALOG KONFIRMASI (MODAL) */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
            <h3 className="text-xl font-semibold text-gray-800">
              Konfirmasi Peminjaman
            </h3>
            <p>
              Apakah Anda yakin ingin meminjam buku{" "}
              <strong>{selectedBook.judul}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Kembali (opsional)
              </label>
              <input
                type="date"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
              >
                Batal
              </button>
              {/* Tombol ini sekarang memanggil fungsi yang sudah dibuat */}
              <button
                onClick={handleSubmitPeminjaman}
                className="px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Kirim Permintaan
              </button>
            </div>
          </div>
        </div>
      )}

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
        <h1 className="text-3xl font-bold text-slate-800">
          Selamat Datang, {userName?.split("@")[0] || "User"}! 👋
        </h1>
        <section className="bg-white p-6 rounded-2xl shadow-xl space-y-6 mt-6">
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
            <FaListUl className="mr-3 text-sky-600" />
            Daftar Koleksi Buku
          </h2>

          {/* ... Filter controls (tidak berubah) ... */}
          <div className="p-4 bg-slate-50 rounded-xl border flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari buku..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="relative w-full md:w-auto">
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-52 pl-10 pr-4 py-2.5 appearance-none rounded-lg border bg-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Semua Status</option>
                <option value="tersedia">Tersedia</option>
                <option value="dipinjam">Dipinjam</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {[
                    "Judul Buku",
                    "Kategori",
                    "Pengarang",
                    "Penerbit",
                    "Tahun",
                    "Status",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedBooks.length > 0 ? (
                  paginatedBooks.map((buku) => {
                    const terkait = eksemplarData.filter(
                      (e) => e.bukuId === buku.id
                    );
                    const total = terkait.length;
                    const tersedia = terkait.filter(
                      (e) => e.status === "TERSEDIA"
                    ).length;
                    return (
                      <tr key={buku.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-medium max-w-xs truncate">
                          {buku.judul}
                        </td>
                        <td className="px-5 py-4 text-xs max-w-xs truncate">
                          {buku.kategori
                            ?.map((k) => k.kategori?.nama)
                            .join(", ") || "-"}
                        </td>
                        <td className="px-5 py-4 truncate">{buku.pengarang}</td>
                        <td className="px-5 py-4 truncate">{buku.penerbit}</td>
                        <td className="px-5 py-4">{buku.tahunTerbit}</td>
                        <td className="px-5 py-4 space-y-1">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              tersedia > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {tersedia > 0
                              ? `${tersedia} dari ${total} tersedia`
                              : "Dipinjam"}
                          </span>
                          {tersedia > 0 && (
                            // TOMBOL INI SEKARANG MEMANGGIL FUNGSI UNTUK MEMBUKA MODAL
                            <button
                              onClick={() => handleOpenPinjamModal(buku)}
                              className="mt-1 block px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-500"
                            >
                              Pinjam
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-slate-500 italic"
                    >
                      Buku tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <ul className="flex justify-center gap-3 text-gray-900 mt-6">
              <li>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="grid size-8 place-content-center rounded border hover:bg-gray-50 disabled:opacity-50"
                >
                  ◀
                </button>
              </li>
              <li className="text-sm font-medium flex items-center">
                {currentPage} / {totalPages || 1}
              </li>
              <li>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="grid size-8 place-content-center rounded border hover:bg-gray-50 disabled:opacity-50"
                >
                  ▶
                </button>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPageUser;
