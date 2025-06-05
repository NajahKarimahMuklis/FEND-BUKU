import { useState } from "react";
import { FaBookmark, FaKey } from "react-icons/fa";

function AddStatusFrom() {
  const [nama, setNama] = useState("");
  const [sukses, setSukses] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://be-appbuku-production-6cfd.up.railway.app/statusBuku", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nama
        })
      });

      const data = await res.json();

      if (res.ok) {
        setNama("");
        setSukses(true);
        alert("Status buku berhasil ditambahkan!");
      } else {
        alert("Gagal: " + (data.message || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("Error saat mengirim data:", error);
      alert("Terjadi kesalahan saat mengirim data");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-center">
        {/* Form */}
        <div className="w-full md:w-1/2 mr-20">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
            <FaKey /> Tambah Status Buku
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Status
              </label>
              <input
                type="text"
                id="status"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Tersedia, Dipinjam, Rusak"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
                loading
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan Status"}
            </button>

            {sukses && (
              <p className="text-green-600 text-sm font-medium">
                ✅ Status berhasil ditambahkan!
              </p>
            )}
          </form>
        </div>

        {/* Ilustrasi */}
        <div className=" md:block w-full md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src="/key.svg"
            alt="Ilustrasi Tambah Status Buku"
            className="max-w-[200px] ml-20"
          />
        </div>
      </div>
    </div>
  );
}

export default AddStatusFrom;
