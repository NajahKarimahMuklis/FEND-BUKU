import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Navbar } from "../components/Navbar";

const KategoriPage = () => {
  const [kategoriList, setKategoriList] = useState([]);
  const [newKategori, setNewKategori] = useState("");
  const [editKategoriId, setEditKategoriId] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getTokenFromCookies = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    return token;
  };

  const fetchKategori = async () => {
    setLoading(true);
    const token = getTokenFromCookies();

    try {
      const response = await fetch("http://localhost:3000/kategori", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setKategoriList(data.data);
        setError("");
      } else {
        setError(data.message || "Gagal mengambil kategori");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const handleAddKategori = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getTokenFromCookies();

    if (!newKategori.trim()) {
      setError("Nama kategori wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/kategori", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nama: newKategori })
      });

      const data = await response.json();
      if (response.ok) {
        setNewKategori("");
        await fetchKategori();
        setError("");
      } else {
        setError(data.message || "Gagal menambahkan kategori.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKategori = async (id) => {
    const confirmDelete = confirm("Yakin ingin menghapus kategori ini?");
    if (!confirmDelete) return;

    setLoading(true);
    const token = getTokenFromCookies();

    try {
      const response = await fetch(`http://localhost:3000/kategori/${id}`, {
        method: "DELETE",
       credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        await fetchKategori();
        setError("");
      } else {
        setError(data.message || "Gagal menghapus kategori.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditKategori = (kategori) => {
    setEditKategoriId(kategori.id);
    setEditNama(kategori.nama);
  };

  const handleUpdateKategori = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getTokenFromCookies();

    if (!editNama.trim()) {
      setError("Nama kategori tidak boleh kosong.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/kategori/${editKategoriId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ nama: editNama })
        }
      );

      const data = await response.json();
      if (response.ok) {
        setEditKategoriId(null);
        setEditNama("");
        await fetchKategori();
        setError("");
      } else {
        setError(data.message || "Gagal mengupdate kategori.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-600 mb-6">
          Kategori Buku
        </h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form Tambah Kategori */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Tambah Kategori</h2>
          <form onSubmit={handleAddKategori} className="space-y-4">
            <input
              type="text"
              placeholder="Nama Kategori"
              value={newKategori}
              onChange={(e) => setNewKategori(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Tambah Kategori"}
            </button>
          </form>
        </div>

        {/* Daftar Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kategoriList.map((kategori) => (
            <div
              key={kategori.id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col"
            >
              {editKategoriId === kategori.id ? (
                <form onSubmit={handleUpdateKategori} className="space-y-2">
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      disabled={loading}
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditKategoriId(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p>ID: {kategori.id}</p>
                  <h3 className="text-lg font-semibold">{kategori.nama}</h3>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleEditKategori(kategori)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteKategori(kategori.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default KategoriPage;
