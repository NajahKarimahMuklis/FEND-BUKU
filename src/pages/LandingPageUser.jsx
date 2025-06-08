import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  FaCheckCircle,
  FaFilter,
  FaListUl,
  FaRegClock,
  FaSearch,
  FaHourglassHalf,
  FaHistory, // Ikon untuk riwayat
  FaBook, // Ikon untuk lihat buku
} from "react-icons/fa";

function LandingPageUser() {
  // --- STATE ---
  const [eksemplarData, setEksemplarData] = useState([]);
  const [riwayatData, setRiwayatData] = useState([]); // State baru untuk data riwayat
  const [userName, setUserName] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State untuk dialog peminjaman
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedEksemplarId, setSelectedEksemplarId] = useState(null);

  // State untuk mengontrol tampilan
  const [activeView, setActiveView] = useState("buku"); // 'buku' atau 'riwayat'
  const [isRiwayatFetched, setIsRiwayatFetched] = useState(false); // Flag agar tidak fetch berulang

  const navigate = useNavigate();

  // --- FETCH DATA ---
  useEffect(() => {
    // Fetch data buku (hanya sekali saat komponen dimuat)
    fetch("https://be-appbuku-production-6cfd.up.railway.app/eksemplarBuku", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) setEksemplarData(res.data);
      })
      .catch((err) => console.error("Gagal fetch eksemplar:", err));

    setUserName(localStorage.getItem("userName") || "");
  }, []);

  const fetchRiwayat = async () => {
    if (isRiwayatFetched) return; // Jangan fetch jika sudah pernah
    try {
      const res = await fetch(
        "https://be-appbuku-production-6cfd.up.railway.app/peminjaman/riwayat",
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setRiwayatData(data.data || []);
        setIsRiwayatFetched(true);
      } else {
        console.error("Gagal fetch riwayat:", data.message);
      }
    } catch (error) {
      console.error("Error fetching riwayat:", error);
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === "riwayat") {
      fetchRiwayat();
    }
  };

  // --- LOGIKA BUKU (Tidak Berubah) ---
  const uniqueBooks = useMemo(() => {
    /* ... (Logika sama seperti sebelumnya) ... */
    const bookMap = new Map();
    eksemplarData.forEach((eksemplar) => {
      if (eksemplar.buku && !bookMap.has(eksemplar.buku.id)) {
        bookMap.set(eksemplar.buku.id, eksemplar.buku);
      }
    });
    return Array.from(bookMap.values());
  }, [eksemplarData]);

  const filteredBooks = uniqueBooks.filter((buku) => {
    /* ... (Logika sama seperti sebelumnya) ... */
    const matchesQuery = buku.judul
      ?.toLowerCase()
      .includes(query.toLowerCase());
    const terkait = eksemplarData.filter((e) => e.bukuId === buku.id);
    const tersediaCount = terkait.filter((e) => e.status === "TERSEDIA").length;
    const dipinjamCount = terkait.filter(
      (e) => e.status === "DIPINJAM" || e.status === "PENDING"
    ).length;
    const matchesStatus =
      statusFilter === "tersedia"
        ? tersediaCount > 0
        : statusFilter === "dipinjam"
        ? tersediaCount === 0 && dipinjamCount > 0
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

  // --- HANDLERS (Peminjaman & Pengembalian) ---
  const handleLogout = () => {
    /* ... (Logika sama seperti sebelumnya) ... */
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  const openConfirmationModal = (buku) => {
    /* ... (Logika sama seperti sebelumnya) ... */
    const tersediaList = eksemplarData.filter(
      (e) => e.bukuId === buku.id && e.status === "TERSEDIA"
    );
    if (tersediaList.length === 0) {
      alert("Maaf, tidak ada eksemplar yang tersedia untuk buku ini.");
      return;
    }
    setSelectedBook(buku);
    setSelectedEksemplarId(tersediaList[0].id);
    setShowModal(true);
  };

  const handlePinjam = async () => {
    /* ... (Logika sama seperti sebelumnya) ... */
    if (!selectedEksemplarId) return;
    try {
      const response = await fetch(
        "https://be-appbuku-production-6cfd.up.railway.app/peminjaman",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eksemplarId: selectedEksemplarId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Gagal mengirim permintaan.");
      } else {
        alert(
          "Permintaan peminjaman berhasil dikirim! Menunggu konfirmasi admin."
        );
        const updatedEksemplar = eksemplarData.map((e) =>
          e.id === selectedEksemplarId ? { ...e, status: "PENDING" } : e
        );
        setEksemplarData(updatedEksemplar);
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat meminjam.");
    }
  };

  const handleKembalikan = async (peminjamanId) => {
    if (!confirm("Anda yakin ingin mengajukan pengembalian untuk buku ini?"))
      return;

    try {
      const res = await fetch(
        `https://be-appbuku-production-6cfd.up.railway.app/peminjaman/kembalikan/${peminjamanId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Permintaan pengembalian berhasil dikirim!");
        // Update status di UI secara langsung
        setRiwayatData((currentRiwayat) =>
          currentRiwayat.map((p) =>
            p.id === peminjamanId ? { ...p, status: "PENDING_KEMBALI" } : p
          )
        );
      } else {
        alert(`Gagal: ${data.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Gagal mengajukan pengembalian:", error);
    }
  };

  // --- Render JSX ---
  return (
    <div className="flex h-screen bg-gray-100 raleway-general">
      {/* Dialog Peminjaman */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-gray-800">
              Konfirmasi Peminjaman
            </h3>
            <p className="text-slate-700">
              Anda akan mengirim permintaan untuk meminjam buku:
              <br />
              <strong className="text-emerald-700">{selectedBook.judul}</strong>
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded border hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handlePinjam}
                className="px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Kirim Permintaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar dengan Navigasi Baru */}
      <div className="w-64 bg-emerald-800 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold p-6">BookNest User</h2>
          <nav className="flex flex-col gap-2 p-4">
            <button
              onClick={() => handleViewChange("buku")}
              className={`flex items-center gap-3 text-left p-2 hover:bg-emerald-700 rounded ${
                activeView === "buku" ? "bg-emerald-600" : ""
              }`}
            >
              <FaBook /> Lihat Buku
            </button>
            <button
              onClick={() => handleViewChange("riwayat")}
              className={`flex items-center gap-3 text-left p-2 hover:bg-emerald-700 rounded ${
                activeView === "riwayat" ? "bg-emerald-600" : ""
              }`}
            >
              <FaHistory /> Riwayat Saya
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

        {/* Tampilan Daftar Buku */}
        {activeView === "buku" && (
          <section className="bg-gray-200 mt-6 p-6 rounded-2xl shadow-xl space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
              <FaListUl className="mr-3 text-sky-600" />
              Daftar Koleksi Buku
            </h2>
            <div className="p-4 rounded-xl bg-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-800" />
                <input
                  type="text"
                  placeholder="Cari buku..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg  focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="relative w-full md:w-auto">
                <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-52 pl-10 pr-4 py-2.5 appearance-none rounded-lg 0 shadow-xl focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Semua Status</option>
                  <option value="tersedia">Tersedia</option>
                  <option value="dipinjam">Dipinjam</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg  shadow-md">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 divide-x">
                  <tr>
                    {[
                      "Judul Buku",
                      "Kategori",
                      "Pengarang",
                      "Penerbit",
                      "Tahun",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-sm font-semibold uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y-1  divide-slate-200">
                  {paginatedBooks.length > 0 ? (
                    paginatedBooks.map((buku) => {
                      const terkait = eksemplarData.filter(
                        (e) => e.bukuId === buku.id
                      );
                      const total = terkait.length;
                      const tersedia = terkait.filter(
                        (e) => e.status === "TERSEDIA"
                      ).length;
                      const isPendingByUser = terkait.some(
                        (e) => e.status === "PENDING"
                      );
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
                          <td className="px-5 py-4 truncate">
                            {buku.pengarang}
                          </td>
                          <td className="px-5 py-4 truncate">
                            {buku.penerbit}
                          </td>
                          <td className="px-5 py-4">{buku.tahunTerbit}</td>
                          <td className="px-5 py-4 space-y-1">
                            {isPendingByUser ? (
                              <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                <FaHourglassHalf className="mr-1.5" /> Menunggu
                                Konfirmasi
                              </span>
                            ) : tersedia > 0 ? (
                              <>
                                {" "}
                                <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                  <FaCheckCircle className="mr-1.5" />{" "}
                                  {tersedia} dari {total} tersedia
                                </span>
                                <button
                                  onClick={() => openConfirmationModal(buku)}
                                  className="mt-1 block px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-500"
                                >
                                  Pinjam
                                </button>
                              </>
                            ) : (
                              <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                                <FaRegClock className="mr-1.5" /> Semua Dipinjam
                              </span>
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
              {totalPages > 1 && (
                <div className="p-4 flex justify-center">
                  <ul className="flex justify-center gap-3 text-gray-900 mt-6">
                    <li>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="grid size-8 place-content-center rounded border hover:bg-gray-50 disabled:opacity-50"
                      >
                        ◀
                      </button>
                    </li>
                    <li className="text-sm font-medium flex items-center">
                      {currentPage} / {totalPages}
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
              )}
            </div>
          </section>
        )}

        {/* Tampilan Riwayat Peminjaman */}
        {activeView === "riwayat" && (
          <section className="bg-gradient-to-br from-white to-slate-50 mt-6 p-8 rounded-3xl shadow-2xl border border-slate-200/50 backdrop-blur-sm">
            {/* Header with improved styling */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                  <FaHistory className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Riwayat Peminjaman
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Kelola dan pantau aktivitas peminjaman Anda
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-slate-600">
                  {riwayatData.length} Total Peminjaman
                </span>
              </div>
            </div>

            {/* Enhanced table container */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  {/* Improved table header */}
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      {[
                        { label: "Judul Buku", icon: "📚" },
                        { label: "Kode Eksemplar", icon: "🏷️" },
                        { label: "Tanggal Pinjam", icon: "📅" },
                        { label: "Tanggal Kembali", icon: "⏰" },
                        { label: "Status", icon: "📊" },
                        { label: "Aksi", icon: "⚡" },
                      ].map((header) => (
                        <th
                          key={header.label}
                          className="px-6 py-4 text-left text-lg font-bold uppercase tracking-wider text-slate-700"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{header.icon}</span>
                            <span>{header.label}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Enhanced table body */}
                  <tbody className="divide-y divide-slate-100 se">
                    {riwayatData.length > 0 ? (
                      riwayatData.map((p, index) => (
                        <tr
                          key={p.id}
                          className={`
                    hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 
                    transition-all duration-300 group cursor-pointer
                    ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}
                  `}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              
                              <div>
                                <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {p.eksemplar?.buku?.judul ||
                                    "Judul tidak tersedia"}
                                </p>
                                
                              </div>
                            </div>
                          </td>

                          {/* Kode Eksemplar dengan badge styling */}
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {p.eksemplar?.kodeEksemplar || "N/A"}
                            </span>
                          </td>

                          {/* Tanggal Pinjam dengan format yang lebih baik */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">
                                {p.tanggalPinjam
                                  ? new Date(
                                      p.tanggalPinjam
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </span>
                              {p.tanggalPinjam && (
                                <span className="text-xs text-slate-500">
                                  {new Date(p.tanggalPinjam).toLocaleDateString(
                                    "id-ID",
                                    {
                                      weekday: "long",
                                    }
                                  )}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Tanggal Kembali */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">
                                {p.tanggalKembali
                                  ? new Date(
                                      p.tanggalKembali
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </span>
                              {p.tanggalKembali && (
                                <span className="text-xs text-slate-500">
                                  {new Date(
                                    p.tanggalKembali
                                  ).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                  })}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status dengan design yang lebih menarik */}
                          <td className="px-6 py-5">
                            <span
                              className={`
                        inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide
                        shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-105
                        ${
                          p.status === "SELESAI"
                            ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                            : p.status === "DIPINJAM"
                            ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white animate-pulse"
                            : "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                        }
                      `}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  p.status === "SELESAI"
                                    ? "bg-white"
                                    : p.status === "DIPINJAM"
                                    ? "bg-white animate-ping"
                                    : "bg-white"
                                }`}
                              ></div>
                              {p.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* Action button yang lebih menarik */}
                          <td className="px-6 py-5">
                            {p.status === "DIPINJAM" && (
                              <button
                                onClick={() => handleKembalikan(p.id)}
                                className="
                          group relative inline-flex items-center px-4 py-2.5 text-sm font-semibold
                          bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl
                          hover:from-sky-600 hover:to-blue-700 
                          transform hover:scale-105 hover:shadow-xl
                          transition-all duration-200
                          focus:outline-none focus:ring-4 focus:ring-blue-300/50
                          active:scale-95
                        "
                              >
                                <span className="mr-2">📤</span>
                                Kembalikan
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* Empty state yang lebih menarik */
                      <tr>
                        <td colSpan="6" className="text-center py-16">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                              <FaHistory className="text-slate-400 text-2xl" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-slate-600">
                                Belum Ada Riwayat Peminjaman
                              </p>
                              <p className="text-sm text-slate-500 max-w-md mx-auto">
                                Anda belum memiliki riwayat peminjaman buku.
                                Mulai pinjam buku untuk melihat riwayat di sini.
                              </p>
                            </div>
                            <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                              Jelajahi Buku
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer statistics */}
            {riwayatData.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                        Selesai
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {
                          riwayatData.filter((p) => p.status === "SELESAI")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📖</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        Dipinjam
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {
                          riwayatData.filter((p) => p.status === "DIPINJAM")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                        Total
                      </p>
                      <p className="text-lg font-bold text-purple-700">
                        {riwayatData.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default LandingPageUser;
