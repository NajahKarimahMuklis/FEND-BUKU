import React, { useState } from "react";

// Define the Role enum to match Prisma schema
const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
};

const BookCard = ({
  book,
  statusOptions,
  onEdit,
  onDelete,
  isDeleting,
  userRole,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const statusName =
    book.statusBuku?.nama ||
    statusOptions.find((s) => s.id === book.statusBukuId)?.nama ||
    "Unknown";

  const handleEdit = () => {
    setIsDropdownOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete();
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-xl p-6 relative">
      <h3 className="font-semibold text-lg mb-3">{book.judul}</h3>
      <div className="space-y-2">
        <p className="text-gray-700">
          <span className="font-medium">Pengarang:</span> {book.pengarang}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Penerbit:</span> {book.penerbit}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Tahun Terbit:</span> {book.tahunTerbit}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Status:</span> {statusName}
        </p>
      </div>

      {userRole === Role.ADMIN && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
            disabled={isDeleting}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-20 border">
              <div className="py-1">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit (PUT)
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default BookCard;
