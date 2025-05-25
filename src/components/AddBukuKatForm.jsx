import { useEffect, useState } from "react";

function AddBukuKatForm() {
  const [idBuku, setIdBuku] = useState("");
  const [idKategori, setIdKategori] = useState("");
  const [sukses, setSukses] = useState(false);

  useEffect(() => {
    const fetchBukuKategori = async () => {
      try {
        const res = await fetch("http://localhost:3000/buku", {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        if (res.ok) {
          console.log("Buku Kategori:", data);
        } else {
          console.error("Gagal mengambil buku kategori:", data.message);
        }
      } catch (error) {
        console.error("Error fetching buku kategori:", error);
      }
    };
    fetchBukuKategori();
  }, []);

  return <div></div>;
}

export default AddBukuKatForm;
