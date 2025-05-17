import React, { useState, useEffect } from "react";
import { addBook, updateBook } from "../services/api";

const BookForm = ({
  editBook,
  setEditBook,
  statusOptions,
  onBookAdded,
  onBookUpdated,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    pengarang: "",
    penerbit: "",
    tahunTerbit: "",
    statusBukuId: 1, // Default to available (1)
  });

  useEffect(() => {
    if (editBook) {
      setFormData({
        judul: editBook.judul || "",
        pengarang: editBook.pengarang || "",
        penerbit: editBook.penerbit || "",
        tahunTerbit: editBook.tahunTerbit || "",
        statusBukuId:
          editBook.statusBukuId ||
          (statusOptions.length > 0 ? statusOptions[0].id : 1),
      });
    } else {
      setFormData({
        judul: "",
        pengarang: "",
        penerbit: "",
        tahunTerbit: "",
        statusBukuId: statusOptions.length > 0 ? statusOptions[0].id : 1,
      });
    }
  }, [editBook, statusOptions]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form data
    if (
      !formData.judul ||
      !formData.pengarang ||
      !formData.penerbit ||
      !formData.tahunTerbit
    ) {
      onError("Semua field harus diisi");
      setLoading(false);
      return;
    }

    // Convert tahunTerbit to number
    const bookData = {
      ...formData,
      tahunTerbit: Number(formData.tahunTerbit),
      statusBukuId: Number(formData.statusBukuId),
    };

    try {
      if (editBook) {
        // Update existing book
        const updatedBook = await updateBook(editBook.id, bookData);

        // Add statusBuku details to the updated book data
        const statusBuku = statusOptions.find(
          (option) => option.id === Number(updatedBook.statusBukuId)
        );

        const updatedBookWithStatus = {
          ...updatedBook,
          statusBuku: statusBuku || { nama: "Unknown" },
        };

        onBookUpdated(updatedBookWithStatus);
        onError("");
      } else {
        // Add new book
        const newBook = await addBook(bookData);

        // Add statusBuku details to the book data
        const statusBuku = statusOptions.find(
          (option) => option.id === Number(newBook.statusBukuId)
        );

        const newBookWithStatus = {
          ...newBook,
          statusBuku: statusBuku || { nama: "Unknown" },
        };

        onBookAdded(newBookWithStatus);

        // Reset form
        setFormData({
          judul: "",
          pengarang: "",
          penerbit: "",
          tahunTerbit: "",
          statusBukuId: statusOptions.length > 0 ? statusOptions[0].id : 1,
        });

        onError("");
      }
    } catch (err) {
      onError("Gagal menghubungi server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {editBook ? "Edit Buku" : "Tambahkan Buku Baru"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="judul"
          placeholder="Judul"
          value={formData.judul}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="pengarang"
          placeholder="Pengarang"
          value={formData.pengarang}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="penerbit"
          placeholder="Penerbit"
          value={formData.penerbit}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="tahunTerbit"
          placeholder="Tahun Terbit"
          value={formData.tahunTerbit}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="statusBukuId"
          value={formData.statusBukuId}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.length > 0 ? (
            statusOptions.map((status) => (
              <option key={status.id} value={status.id}>
                {status.nama}
              </option>
            ))
          ) : (
            <option value={1}>Loading status options...</option>
          )}
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading
              ? editBook
                ? "Updating..."
                : "Adding..."
              : editBook
              ? "Update Buku"
              : "Tambah Buku"}
          </button>

          {editBook && (
            <button
              type="button"
              onClick={() => setEditBook(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookForm;