// src/components/ManageUser.jsx
import React, { useEffect, useState, useMemo } from "react";
import { FaUsers, FaEdit, FaTimes } from "react-icons/fa";

function ManageUser({ globalApiConfig }) {
  const { fetchDataWithAuth } = globalApiConfig;

  const [users, setUsers] = useState([]);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("");

  // Fungsi untuk memuat data user
  const loadUsers = async () => {
    try {
      const res = await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/user`
      );
      const result = await res.json();
      setUsers(result.data || []);
    } catch (error) {
      console.error("Gagal memuat data user:", error);
      // alert(`Gagal memuat data user: ${error.message}`); // Opsional: tampilkan alert
    }
  };

  useEffect(() => {
    loadUsers(); // Muat user saat komponen dimuat
  }, []);

  // Fungsi untuk fitur EDIT User
  const handleEditUserClick = (userItem) => {
    setCurrentUserToEdit(userItem);
    setEditUserName(userItem.name);
    setEditUserEmail(userItem.email);
    setEditUserRole(userItem.role);
    setShowEditUserModal(true);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserToEdit) return;

    try {
      await fetchDataWithAuth(
        `https://be-appbuku-production-6cfd.up.railway.app/user/${currentUserToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editUserName,
            email: editUserEmail,
            role: editUserRole,
          }),
        }
      );

      alert("User berhasil diupdate!");
      setShowEditUserModal(false);
      setCurrentUserToEdit(null);
      setEditUserName("");
      setEditUserEmail("");
      setEditUserRole("");
      loadUsers(); // Refresh daftar user setelah update
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Terjadi kesalahan saat mengupdate user: ${error.message}`);
    }
  };

  return (
    <>
      <section className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-semibold">
          <FaUsers className="inline mr-3 text-purple-600" />
          Daftar User
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
              <tr>
                {["Nama", "Email", "Role", "Tanggal Daftar"].map((h) => (
                  <th
                    key={h}
                    className="p-4 text-left text-lg font-bold uppercase tracking-wider text-slate-600 border-r border-slate-200 last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors duration-200"
                  >
                    <td className="p-4 font-medium text-slate-800 border-r border-slate-100">
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-600 border-r border-slate-100">
                      {user.email}
                    </td>
                    <td className="p-4 text-slate-600 border-r border-slate-100 capitalize">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 border-r border-slate-100">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-slate-500 italic"
                  >
                    Belum ada user terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default ManageUser;
