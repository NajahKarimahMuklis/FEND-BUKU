import { useEffect, useState } from "react";

function Riwayat() {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => async () => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      const res = await fetch(`http://localhost:3000/peminjaman/riwayat`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const body = await res.json();

      if (res.ok) {
        setRiwayat(body.data);
        console.log(body.data);
      }
    } catch (error) {
      console.error("Error saat menghapus buku:", error);
    }
  };

  return (
    <div>
      {riwayat.map((riwayat) => (
        <div key={riwayat.id}>
          <p>Status {riwayat.status}</p>
          <p>Name {riwayat.user?.name}</p>
        </div>
      ))}
    </div>
  );
}

export default Riwayat;
