import { useEffect, useState } from "react";
import { FaClock, FaCheckCircle, FaBook, FaUser } from "react-icons/fa";

function Riwayat() {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      const res = await fetch("https://be-appbuku-production-6cfd.up.railway.app/peminjaman/riwayat", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const body = await res.json();
      if (res.ok) {
        setRiwayat(body.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data riwayat:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-emerald-700 mb-6">📚 Riwayat Peminjaman</h1>

      {riwayat.length === 0 ? (
        <p className="text-gray-500">Belum ada riwayat peminjaman.</p>
      ) : (
        <div className="space-y-4">
          {riwayat.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                    item.status === "SELESAI"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status === "SELESAI" ? (
                    <FaCheckCircle className="mr-2" />
                  ) : (
                    <FaClock className="mr-2" />
                  )}
                  {item.status}
                </span>
                <p className="text-sm text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700 flex items-center gap-2">
                  <FaUser className="text-emerald-500" />
                  <span className="font-semibold">Peminjam:</span> {item.user?.name}
                </p>

                <p className="text-gray-700 flex items-center gap-2">
                  <FaBook className="text-emerald-500" />
                  <span className="font-semibold">Judul Buku:</span> {item.eksemplar?.buku?.judul}
                </p>

                <p className="text-gray-700">
                  <span className="font-semibold">Kode Eksemplar:</span> {item.eksemplar?.kodeEksemplar}
                </p>


                <p className="text-gray-700">
                  <span className="font-semibold">Tanggal Kembali:</span>{" "}
                  {new Date(item.tanggalKembali).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Riwayat;
