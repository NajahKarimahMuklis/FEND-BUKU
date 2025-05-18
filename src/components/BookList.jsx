import React, { useState } from "react";
import { deleteBook } from "../services/api";
import BookCard from "./BookCard";

// Define the Role enum to match Prisma schema
const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
};

const BookList = ({
  books,
  statusOptions,
  onEditBook,
  onDeleteBook,
  onError,
  userRole,
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteBook = async (bukuId) => {
    // Only allow admins to delete books
    if (userRole !== Role.ADMIN) {
      onError("Unauthorized: Only admins can delete books");
      return;
    }

    setDeletingId(bukuId);
    try {
      await deleteBook(bukuId);
      onDeleteBook(bukuId);
      onError("");
    } catch (err) {
      onError("Gagal menghapus buku: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-600">No books found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          statusOptions={statusOptions}
          onEdit={() => (userRole === Role.ADMIN ? onEditBook(book) : null)}
          onDelete={() => handleDeleteBook(book.id)}
          isDeleting={deletingId === book.id}
          userRole={userRole}
        />
      ))}
    </div>
  );
};

export default BookList;
