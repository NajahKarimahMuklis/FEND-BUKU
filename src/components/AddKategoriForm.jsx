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
      const res = await fetch("https://be-appbuku-production-6cfd.up.railway.app/kategori", {
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
        setSukses(true);
        setNama("");
        alert("Kategori berhasil ditambahkan!");
      } else {
        alert("Gagal: " + (data.message || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("Error saat mengirim data:", error);
      alert("Terjadi kesalahan saat mengirim data");
    }
  };
   return (
    <div className="min-h-screen flex justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row max-w-2xl w-full h-80">
        {/* Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-emerald-700 flex items-center gap-2 mb-6">
            <FaFolderPlus /> Tambah Kategori
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 ">
            <div>
              <label htmlFor="nama" className="block text-sm text-gray-700 mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Fiksi, Teknologi, Edukasi"
                className="w-[400px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </button>

            {sukses && (
              <p className="text-green-600 text-center font-medium">
                ✅ Kategori berhasil ditambahkan!
              </p>
            )}
          </form>
        </div>

       
      </div> 
      {/* Gambar */}
        <div className="hidden md:flex w-full md:w-1/2 -mt-80 items-center justify-center">
          <img
            src="/kateg.svg"
            alt="Kategori Illustration"
            className="max-w-xs"
          />
        </div>
    </div>
  );
}

export default AddKategoriForm;
