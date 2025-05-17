export const checkServerConnection = async () => {
  try {
    const response = await fetch("http://localhost:3000/", {
      method: "GET",
      credentials: "include",
      signal: AbortSignal.timeout(5000)
    });
    console.log("Server connection test:", response.status);
    return response.ok;
  } catch (error) {
    console.error("Server connection error:", error);
    return false;
  }
};

export const fetchBooks = async () => {
  try {
    const response = await fetch("http://localhost:3000/buku", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("Fetch books response status:", response.status);

    const data = await response.json();
    console.log("Fetch books response data:", data);

    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message || "Gagal mendapatkan data buku");
    }
  } catch (err) {
    console.error("Error fetching books:", err);
    throw err;
  }
};

export const fetchStatusOptions = async () => {
  try {
    const response = await fetch("http://localhost:3000/statusBuku", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("Fetch status options response status:", response.status);

    const data = await response.json();
    console.log("Fetch status options response data:", data);

    if (response.ok) {
      // Store in sessionStorage for later use
      sessionStorage.setItem("statusOptions", JSON.stringify(data.data));
      return data.data;
    } else {
      throw new Error(data.message || "Failed to fetch status options");
    }
  } catch (err) {
    console.error("Error fetching status options:", err);

    // Try to get from sessionStorage if API fails
    const storedStatusOptions = sessionStorage.getItem("statusOptions");
    if (storedStatusOptions) {
      return JSON.parse(storedStatusOptions);
    }
    throw err;
  }
};

export const addBook = async (bookData) => {
  try {
    const response = await fetch("http://localhost:3000/buku", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookData)
    });

    console.log("Add book response status:", response.status);

    const data = await response.json();
    console.log("Add book response data:", data);

    if (response.ok) {
      return data.data;
    } else {
      throw new Error(
        data.message || "Terjadi kesalahan saat menambahkan buku"
      );
    }
  } catch (err) {
    console.error("Error adding book:", err);
    throw err;
  }
};

export const updateBook = async (bookId, bookData) => {
  try {
    const response = await fetch(`http://localhost:3000/buku/${bookId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookData)
    });

    console.log("Update book response status:", response.status);

    const data = await response.json();
    console.log("Update book response data:", data);

    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message || "Terjadi kesalahan saat mengupdate buku");
    }
  } catch (err) {
    console.error("Error updating book:", err);
    throw err;
  }
};

export const deleteBook = async (bukuId) => {
  try {
    const response = await fetch(`http://localhost:3000/buku/${bukuId}`, {
      method: "DELETE",
      credentials: "include"
    });

    console.log("Delete book response status:", response.status);

    const data = await response.json();
    console.log("Delete book response data:", data);

    if (response.ok) {
      return true;
    } else {
      throw new Error(data.message || "Terjadi kesalahan saat menghapus buku");
    }
  } catch (err) {
    console.error("Error deleting book:", err);
    throw err;
  }
};
