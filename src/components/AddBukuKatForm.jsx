import { useEffect, useState } from "react";
import { FaBookOpen, FaTags } from "react-icons/fa";

function AddBukuKatForm() {
  const [idBuku, setIdBuku] = useState("");
  const [idKategori, setIdKategori] = useState("");
  const [bukuList, setBukuList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [sukses, setSukses] = useState(false);

  useEffect(() => {
    const fetchBuku = async () => {
      try {
        const res = await fetch("http://localhost:3000/buku", {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        if (res.ok) {
          setBukuList(data.data || []);
          setIdBuku(data.data?.[0]?.id || "");
        } else {
          console.error("Gagal mengambil data buku:", data.message);
        }
      } catch (error) {
        console.error("Error fetching buku:", error);
      }
    };
    fetchBuku();
  }, []);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await fetch("http://localhost:3000/kategori", {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        if (res.ok) {
          setKategoriList(data.data || []);
          setIdKategori(data.data?.[0]?.id || "");
        } else {
          console.error("Gagal mengambil kategori:", data.message);
        }
      } catch (error) {
        console.error("Error fetching kategori:", error);
      }
    };
    fetchKategori();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bukuKategoriBaru = {
      idBuku: parseInt(idBuku),
      idKategori: parseInt(idKategori)
    };
    try {
      const res = await fetch("http://localhost:3000/bukuKategori", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bukuKategoriBaru)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Buku kategori berhasil ditambahkan!");
        setIdBuku("");
        setIdKategori("");
        setSukses(true);
      } else {
        alert("Gagal: " + (data.message || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("POST error:", error);
      alert("Terjadi error saat mengirim data");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
      {/* Form Section */}
      <div className="flex-1 w-full">
        <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
          <FaBookOpen className="w-6 h-6 text-green-600" />
          Tambah Buku ke Kategori
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dropdown Buku */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Buku
            </label>
            <select
              value={idBuku}
              onChange={(e) => setIdBuku(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="" disabled>
                Pilih Buku
              </option>
              {bukuList.map((buku) => (
                <option key={buku.id} value={buku.id}>
                  {buku.judul} ({buku.statusBuku?.nama || "Tanpa Status"})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={idKategori}
              onChange={(e) => setIdKategori(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {kategoriList.map((kategori) => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition-all"
          >
            Simpan Kategori
          </button>
        </form>

        {/* Pesan sukses */}
        {sukses && (
          <p className="text-green-600 font-medium mt-4">
            ✅ Buku berhasil ditambahkan ke kategori!
          </p>
        )}
      </div>

      {/* Ilustrasi Section */}
      <div className="hidden md:block flex-1">
        <img
          src="/bukukat.svg" // ganti dengan ilustrasi SVG yang kamu pakai
          alt="Ilustrasi Tambah Buku"
          className="w-full max-w-sm mx-auto"
        />
      </div>
    </div>
  );
}

export default AddBukuKatForm;
