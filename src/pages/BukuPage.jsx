import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { fetchBooks, fetchStatusOptions } from "../services/api";
import BookForm from "../components/BukuForm";
import BookList from "../components/BookList";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";

const BukuPage = () => {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editBook, setEditBook] = useState(null);

  // Hardcode userRole di sini, atau bisa nanti diganti props/context
  const [userRole, setUserRole] = useState(""); // kosong = guest

  // Contoh assign role langsung, misal "ADMIN" atau "USER"
  // Kamu bisa ganti logika ini sesuai kebutuhan autentikasi
  useEffect(() => {
    // Contoh set role admin langsung (untuk testing)
    setUserRole("ADMIN"); 
  }, []);

  useEffect(() => {
    loadBooks();
    loadStatusOptions();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchBooks();
      setBooks(data);
      setError("");
    } catch (err) {
      setError("Gagal terhubung ke server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatusOptions = async () => {
    try {
      const options = await fetchStatusOptions();
      setStatusOptions(options);
    } catch (err) {
      setError("Gagal memuat status opsi");
    }
  };

  const handleBookAdded = (newBookWithStatus) => {
    setBooks((prev) => [...prev, newBookWithStatus]);
  };

  const handleBookUpdated = (updatedBookWithStatus) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === updatedBookWithStatus.id ? updatedBookWithStatus : book
      )
    );
    setEditBook(null);
  };

  const handleBookDeleted = (bukuId) => {
    setBooks((prev) => prev.filter((book) => book.id !== bukuId));
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="container mx-auto p-6 flex-grow">
        {error && <ErrorMessage message={error} />}

        {userRole === "ADMIN" && (
          <BookForm
            editBook={editBook}
            setEditBook={setEditBook}
            statusOptions={statusOptions}
            onBookAdded={handleBookAdded}
            onBookUpdated={handleBookUpdated}
            onError={handleError}
          />
        )}

        {userRole === "ADMIN" && (
          <h2 className="underline text-blue-600 pl-6 mb-6 hover:text-blue-800 cursor-pointer">
            <Link to="/bukuKategori">Tambahkan kategori dari buku disini!</Link>
          </h2>
        )}

        <h2 className="pl-6 text-3xl mb-4">Daftar Buku</h2>

        {loading && !editBook ? (
          <LoadingSpinner />
        ) : (
          <BookList
            books={books}
            statusOptions={statusOptions}
            onEditBook={setEditBook}
            onDeleteBook={handleBookDeleted}
            onError={handleError}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

export default BukuPage;
