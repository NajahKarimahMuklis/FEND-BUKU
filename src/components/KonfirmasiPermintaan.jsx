import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaInbox,
  FaBell,
  FaArrowCircleRight,
} from "react-icons/fa";

// Asumsikan globalApiConfig di-pass sebagai prop jika digunakan
function KonfirmasiPermintaan({ globalApiConfig }) {
  const [permintaan, setPermintaan] = useState([]);
  const [pengembalian, setPengembalian] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  useEffect(() => {
    fetchData();
  }, []);

  const displayPopup = (message, type = "success", duration = 3000) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    if (window.popupTimeout) {
      clearTimeout(window.popupTimeout);
    }
    window.popupTimeout = setTimeout(() => {
      setShowPopup(false);
    }, duration);
  };

  const fetchData = async () => {
    const fetchFn = globalApiConfig?.fetchDataWithAuth || fetch;
    const options = globalApiConfig ? {} : { method: "GET", credentials: "include" };

    try {
      const res = await fetchFn("http://localhost:3000/peminjaman/permintaan", options);
      
      if (!globalApiConfig && res.status === 401) {
        console.error("Sesi mungkin kedaluwarsa.");
        displayPopup("Sesi Anda mungkin telah berakhir. Silakan coba muat ulang atau login kembali.", "error");
        if (globalApiConfig?.handleSessionExpired) {
            globalApiConfig.handleSessionExpired();
        }
        return; 
      }

      const data = await res.json();
      if (res.ok) {
        setPermintaan(data.peminjamanPending || []);
        setPengembalian(data.pengembalianPending || []);
      } else {
        console.error("Gagal mengambil data:", data.message);
        displayPopup(`Gagal mengambil data: ${data.message || "Kesalahan server"}`, "error");
      }
    } catch (error) {
      if (error.message !== "Sesi kedaluwarsa") {
        console.error("Error fetching data:", error);
        displayPopup(`Error mengambil data: ${error.message || "Tidak bisa menghubungi server"}`, "error");
      }
    }
  };

  const createActionHandler = (actionType, successMessage, errorMessagePrefix, endpointUrlBuilder) => {
    return async (e, id) => {
      e.preventDefault();
      setLoadingId(id);
      
      const fetchFn = globalApiConfig?.fetchDataWithAuth || fetch;
      const baseOptions = { method: "PUT" };
      const options = globalApiConfig ? baseOptions : { ...baseOptions, credentials: "include" };

      try {
        const res = await fetchFn(endpointUrlBuilder(id), options);

        if (!globalApiConfig && res.status === 401) {
            console.error("Sesi mungkin kedaluwarsa saat aksi.");
            displayPopup("Sesi Anda mungkin telah berakhir. Silakan login ulang.", "error");
            if (globalApiConfig?.handleSessionExpired) {
                globalApiConfig.handleSessionExpired();
            }
            setLoadingId(null);
            return;
        }

        let dataResponse = {}; 
        if (res.status !== 204) { 
            try {
                dataResponse = await res.json();
            } catch (jsonError) {
                console.warn("Respons bukan JSON:", jsonError);
                if (!res.ok) { 
                    displayPopup(`${errorMessagePrefix}: Respons server tidak valid`, "error");
                    setLoadingId(null);
                    return;
                }
            }
        }

        if (res.ok) {
          fetchData(); 
          displayPopup(successMessage, "success");
        } else {
          console.error(`${errorMessagePrefix}:`, dataResponse.message || res.statusText);
          displayPopup(`${errorMessagePrefix}: ${dataResponse.message || res.statusText || "Terjadi kesalahan"}`, "error");
        }
      } catch (error) {
        if (error.message !== "Sesi kedaluwarsa") {
            console.error(`Error ${actionType}:`, error);
            displayPopup(`Error: ${error.message || "Tidak dapat menghubungi server"}`, "error");
        }
      } finally {
        setLoadingId(null);
      }
    };
  };

  const handleTerimaPeminjaman = createActionHandler(
    "terima peminjaman", "Peminjaman berhasil disetujui!", "Gagal menyetujui peminjaman",
    (id) => `http://localhost:3000/peminjaman/konfirmasi/${id}`
  );
  const handleTolakPeminjaman = createActionHandler(
    "tolak peminjaman", "Peminjaman berhasil ditolak!", "Gagal menolak peminjaman",
    (id) => `http://localhost:3000/peminjaman/tolak/${id}`
  );
  const handleTerimaPengembalian = createActionHandler(
    "terima pengembalian", "Pengembalian berhasil disetujui!", "Gagal menyetujui pengembalian",
    (id) => `http://localhost:3000/peminjaman/konfirmasi-kembali/${id}`
  );
  const handleTolakPengembalian = createActionHandler(
    "tolak pengembalian", "Pengembalian berhasil ditolak!", "Gagal menolak pengembalian",
    (id) => `http://localhost:3000/peminjaman/tolak-kembali/${id}` 
  );

  const Card = ({ data, type }) => {
    const isPeminjaman = type === "Peminjaman";
    const accentColorClass = isPeminjaman ? "border-indigo-500" : "border-teal-500";
    const typeBadgeClass = isPeminjaman
      ? "bg-indigo-100 text-indigo-700"
      : "bg-teal-100 text-teal-700";

    const statusColors = {
      pending: "bg-yellow-400 ring-yellow-300",
      dipinjam: "bg-blue-400 ring-blue-300",
      pending_kembali: "bg-orange-400 ring-orange-300", // Menggunakan underscore sesuai JSON
    };
    const statusColor = statusColors[data.status?.toLowerCase()] || "bg-gray-400 ring-gray-300";

    // Mengakses data pengguna dan buku sesuai struktur JSON yang Anda berikan
    // Menggunakan optional chaining (?.) untuk keamanan jika ada data yang mungkin null/undefined
    const userName = data.user?.name;
    const userEmail = data.user?.email;
    const kodeEksemplar = data.eksemplar?.kodeEksemplar;
    const judulBuku = data.eksemplar?.buku?.judul;
    // Anda juga bisa mengambil pengarang dan penerbit jika ingin ditampilkan
    // const pengarangBuku = data.eksemplar?.buku?.pengarang;
    // const penerbitBuku = data.eksemplar?.buku?.penerbit;


    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out font-sans">
        <div className={`p-5 border-l-4 ${accentColorClass}`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${typeBadgeClass}`}>{type}</span>
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ring-1 ring-opacity-50 ${statusColor}`}></span>
              <p className="text-sm font-semibold text-slate-700 capitalize">
                {/* Menampilkan status, mengganti underscore dengan spasi */}
                {data.status?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>
          </div>

          {/* Informasi Pengguna */}
          <div className="mb-2 flex items-center text-slate-700 group">
            <FaUserCircle className="w-5 h-5 mr-2.5 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
            <div className="text-sm">
              {userName && <strong className="font-medium text-slate-800 block" title={userName}>{userName}</strong>}
              {userEmail && <span className="text-slate-500 text-xs" title={userEmail}>{userEmail}</span>}
              {!userName && !userEmail && <span className="text-slate-500 italic">Pengguna tidak diketahui</span>}
            </div>
          </div>
          
          {/* Informasi Buku */}
          { (kodeEksemplar || judulBuku) && ( // Hanya tampilkan bagian buku jika ada kode atau judul
            <div className="mb-4 flex items-start text-slate-700 group pt-2 mt-2 border-t border-slate-100">
              <FaBook className="w-5 h-5 mr-2.5 mt-0.5 text-slate-400 group-hover:text-sky-500 transition-colors flex-shrink-0" />
              <div>
                {judulBuku && <p className="font-semibold text-sm leading-tight text-slate-800" title={judulBuku}>{judulBuku}</p>}
                {kodeEksemplar && <p className="text-xs text-slate-500 mt-0.5">Kode: {kodeEksemplar}</p>}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-200">
            {/* Tombol Tolak: Tampilkan jika isPeminjaman atau jika type adalah Pengembalian (jika Anda punya handleTolakPengembalian) */}
            {/* Jika Anda benar-benar tidak ingin ada tombol tolak untuk pengembalian, Anda bisa tambahkan kondisi di sini */}
            { (isPeminjaman || type === "Pengembalian") && ( // Tombol tolak akan muncul untuk kedua tipe jika handlernya ada
              <button
                type="button"
                onClick={(e) => isPeminjaman ? handleTolakPeminjaman(e, data.id) : handleTolakPengembalian(e, data.id)}
                disabled={loadingId === data.id}
                className={`flex items-center justify-center px-3.5 py-2 rounded-md font-semibold transition-all duration-150 ease-in-out
                                text-xs text-red-600 border border-red-300 hover:bg-red-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-40
                                ${loadingId === data.id ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}`}
              >
                {loadingId === data.id ? (
                  <FaSpinner className="animate-spin mr-1.5" />
                ) : (
                  <FaTimesCircle className="mr-1.5" />
                )}
                Tolak
              </button>
            )}
            
            <button
              type="button"
              onClick={(e) => isPeminjaman ? handleTerimaPeminjaman(e, data.id) : handleTerimaPengembalian(e, data.id)}
              disabled={loadingId === data.id}
              className={`flex items-center justify-center px-3.5 py-2 rounded-md font-semibold transition-all duration-150 ease-in-out
                              text-xs bg-green-500 text-white hover:bg-green-600 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-40
                              ${loadingId === data.id ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}`}
            >
              {loadingId === data.id ? (
                <FaSpinner className="animate-spin mr-1.5" />
              ) : (
                <FaCheckCircle className="mr-1.5" />
              )}
              Setujui
            </button>
          </div>
        </div>
      </div>
    );
  };
  // --- AKHIR MODIFIKASI KOMPONEN CARD ---

  const EmptyState = ({ message }) => (
    <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
      <FaInbox className="mx-auto text-5xl md:text-6xl text-slate-300 mb-5" />
      <p className="text-slate-500 text-base md:text-lg font-medium">{message}</p>
    </div>
  );

  return (
    <div className="p-3 md:p-6 font-sans">
      {showPopup && (
        <div
          className={`fixed top-5 right-5 flex items-center p-4 pr-8 rounded-lg shadow-2xl text-white z-[100] transition-all duration-300 ease-in-out transform
                          ${showPopup ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
                          ${popupType === "success" ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}`}
        >
          <FaBell className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-semibold">{popupMessage}</span>
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-1 right-1 p-1 text-xl leading-none hover:text-gray-200"
            aria-label="Tutup"
          >
            &times;
          </button>
        </div>
      )}

      <div className="w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 sm:mb-8 pb-3 text-center border-b-2 border-slate-200">
          Konfirmasi Permintaan
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-5 text-center lg:text-left flex items-center justify-center lg:justify-start">
              <FaArrowCircleRight className="mr-3 text-indigo-500 hidden sm:inline" />
              Permintaan Peminjaman
            </h2>
            {permintaan.length > 0 ? (
              <div className="space-y-5">
                {permintaan.map((item) => (
                  <Card key={item.id} data={item} type="Peminjaman" />
                ))}
              </div>
            ) : (
              <EmptyState message="Tidak ada permintaan peminjaman saat ini." />
            )}
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-5 text-center lg:text-left flex items-center justify-center lg:justify-start">
              <FaArrowCircleRight className="mr-3 text-teal-500 hidden sm:inline" />
              Permintaan Pengembalian
            </h2>
            {pengembalian.length > 0 ? (
              <div className="space-y-5">
                {pengembalian.map((item) => (
                  <Card key={item.id} data={item} type="Pengembalian" />
                ))}
              </div>
            ) : (
              <EmptyState message="Tidak ada permintaan pengembalian saat ini." />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default KonfirmasiPermintaan;