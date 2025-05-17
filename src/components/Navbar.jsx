import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const navigateToStatusBuku = () => navigate("/statusBuku");
  const navigateToKategori = () => navigate("/kategori");
  const navigateToBooks = () => navigate("/buku");

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Library Management</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={navigateToBooks}
            className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            Books
          </button>
          <button
            onClick={navigateToStatusBuku}
            className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            Status Buku
          </button>
          <button
            onClick={navigateToKategori}
            className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            Kategori
          </button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar};
