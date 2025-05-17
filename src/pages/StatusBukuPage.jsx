import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";

const StatusBukuPage = () => {
  const [statusList, setStatusList] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  const [editStatusId, setEditStatusId] = useState(null);
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

  const fetchStatus = async () => {
    setLoading(true);
    const token = getTokenFromCookies();

    try {
      const response = await fetch("http://localhost:3000/statusBuku", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setStatusList(data.data);
        setError("");
      } else {
        setError(data.message || "Gagal mengambil status buku.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAddStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getTokenFromCookies();

    if (!newStatus.trim()) {
      setError("Nama status wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/statusBuku", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nama: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        setNewStatus("");
        await fetchStatus();
        setError("");
      } else {
        setError(data.message || "Gagal menambahkan status.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatus = async (id) => {
    const confirmDelete = confirm("Yakin ingin menghapus status ini?");
    if (!confirmDelete) return;

    setLoading(true);
    const token = getTokenFromCookies();

    try {
      const response = await fetch(`http://localhost:3000/statusBuku/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        await fetchStatus();
        setError("");
      } else {
        setError(data.message || "Gagal menghapus status.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (status) => {
    setEditStatusId(status.id);
    setEditNama(status.nama);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getTokenFromCookies();

    if (!editNama.trim()) {
      setError("Nama status tidak boleh kosong.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/statusBuku/${editStatusId}`,
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
        setEditStatusId(null);
        setEditNama("");
        await fetchStatus();
        setError("");
      } else {
        setError(data.message || "Gagal mengupdate status.");
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
        <h1 className="text-3xl font-bold text-emerald-500 mb-6">
          Status Buku
        </h1>
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form Tambah Status */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Tambah Status Buku</h2>
          <form onSubmit={handleAddStatus} className="space-y-4">
            <input
              type="text"
              placeholder="Nama Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Tambah Status"}
            </button>
          </form>
        </div>

        {/* Daftar Status Buku */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statusList.map((status) => (
            <div
              key={status.id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col"
            >
              {editStatusId === status.id ? (
                <form onSubmit={handleUpdateStatus} className="space-y-2">
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onClick={() => setEditStatusId(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-gray-600 ">
                    ID : <span className="font-bold">{status.id}</span>
                  </p>
                  <h3 className="text-lg font-semibold">{status.nama}</h3>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleEditStatus(status)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStatus(status.id)}
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

export default StatusBukuPage;
