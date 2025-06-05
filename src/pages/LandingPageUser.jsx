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
  const [books, setBooks] = useState([]);
  const [adminName, setAdminName] = useState();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/buku", { credentials: "include" })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) setBooks(res.data);
      })
      .catch((err) => console.error("Gagal fetch buku:", err));
  }, []);

  useEffect(() => {
    const adminNameFromStorage = localStorage.getItem("adminName");
    setAdminName(adminNameFromStorage);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBooks = books.filter((b) => {
    const matchesQuery = b.judul?.toLowerCase().includes(query.toLowerCase());
    const tersediaCount =
      b.eksemplarBuku?.filter((e) => e.status === "TERSEDIA").length || 0;
    const matchesStatus =
      statusFilter === "tersedia"
        ? tersediaCount > 0
        : statusFilter === "dipinjam"
        ? tersediaCount === 0
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

  const handlePinjam = async (buku) => {
    const tersediaList = buku.eksemplarBuku?.filter(
      (e) => e.status === "TERSEDIA"
    );
    if (!tersediaList || tersediaList.length === 0) return;

    const eksemplarId = tersediaList[0].id;

    try {
      const res = await fetch("/peminjaman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // sesuaikan kalau pakai context/auth state
        },
        body: JSON.stringify({ eksemplarId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengirim permintaan");
        return;
      }

      alert("Permintaan peminjaman berhasil dikirim!");
      // opsional: refresh halaman atau re-fetch data
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat meminjam");
    }
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
        <h1 className="text-3xl font-bold text-slate-800">
          Selamat Datang, {adminName?.split("@")[0] || "Admin"}! 👋
        </h1>

        <section className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
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
                      className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedBooks.length > 0 ? (
                  paginatedBooks.map((buku) => {
                    const total = buku.eksemplarBuku?.length || 0;
                    const tersedia =
                      buku.eksemplarBuku?.filter((e) => e.status === "TERSEDIA")
                        .length || 0;
                    return (
                      <tr
                        key={buku.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td
                          className="px-5 py-4 font-medium text-slate-800 max-w-xs truncate"
                          title={buku.judul}
                        >
                          {buku.judul}
                        </td>
                        <td
                          className="px-5 py-4 text-slate-600 text-xs max-w-xs truncate"
                          title={
                            buku.kategori
                              ?.map((k) => k.kategori?.nama)
                              .join(", ") || "-"
                          }
                        >
                          {buku.kategori
                            ?.map((k) => k.kategori?.nama)
                            .join(", ") || "-"}
                        </td>
                        <td
                          className="px-5 py-4 text-slate-600 truncate"
                          title={buku.pengarang}
                        >
                          {buku.pengarang}
                        </td>
                        <td
                          className="px-5 py-4 text-slate-600 truncate"
                          title={buku.penerbit}
                        >
                          {buku.penerbit}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {buku.tahunTerbit}
                        </td>
                        <td className="px-5 py-4 space-y-1">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full 
    ${
      tersedia > 0
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
                          >
                            {tersedia} dari {total} tersedia
                          </span>
                          {tersedia > 0 && (
                            <button
                              onClick={() => handlePinjam(buku)}
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
                  className="grid size-8 place-content-center rounded border border-gray-200 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
              <li className="text-sm font-medium tracking-wider flex items-center">
                {currentPage} / {totalPages || 1}
              </li>
              <li>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="grid size-8 place-content-center rounded border border-gray-200 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
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
