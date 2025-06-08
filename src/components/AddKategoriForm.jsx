import { useState } from "react";
import { FaArrowLeft, FaFolderPlus, FaPlus } from "react-icons/fa";

function AddKategoriForm() {
  const [nama, setNama] = useState("");
  const [sukses, setSukses] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSukses(false);
    try {
      const res = await fetch(
        "https://be-appbuku-production-6cfd.up.railway.app/kategori",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSukses(true);
        setNama("");
        alert("Kategori berhasil ditambahkan!");
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

  // --- JSX dengan UI yang Telah Diperbaiki ---
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 grid md:grid-cols-2 items-center gap-16">
      {/* Kolom Form */}
      <div className="w-full">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
          <FaFolderPlus className="text-emerald-500 mr-4" />
          Tambah Kategori Baru
        </h2>
        <p className="text-slate-500 mb-8">
          Buat kategori baru untuk mengelompokkan koleksi buku Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="nama-kategori"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Nama Kategori
            </label>
            <input
              id="nama-kategori"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Fiksi, Teknologi, Sejarah"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-400"
          >
            <FaPlus />
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </button>

          {sukses && (
            <p className="text-green-600 font-medium mt-4 p-3 bg-green-50 rounded-lg text-center">
              ✅ Kategori berhasil ditambahkan!
            </p>
          )}
        </form>
      </div>

      {/* Kolom Gambar (Sekarang di Tengah) */}
      <div className="hidden md:flex items-center justify-center">
        <img
          src="/kateg.svg" // Ganti dengan path gambar ilustrasi Anda
          alt="Ilustrasi Tambah Kategori"
          className="w-full max-w-sm"
        />
      </div>
    </div>
  );
}

export default AddKategoriForm;
