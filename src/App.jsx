import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import BukuPage from "./pages/BukuPage";
import UserPage from "./pages/UserPage";
import StatusBukuPage from "./pages/StatusBukuPage";
import KategoriPage from "./pages/KategoriPage";
import BukuKategoriPage from "./pages/BukuKategoriPage";
import LandingPageAdmin from "./pages/LandingPageAdmin";
import LandingPageUser from "./pages/LandingPageUser";
import KonfirmasiPermintaan from "./components/KonfirmasiPermintaan";
import DelUpBook from "./components/DelUpBook";
import Riwayat from "./components/Riwayat";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/kategori" element={<KategoriPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/buku" element={<BukuPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/statusBuku" element={<StatusBukuPage />} />
        <Route path="/bukuKategori" element={<BukuKategoriPage />} />
        <Route path="/admin/dashboard" element={<LandingPageAdmin />} />
        <Route path="/user/home" element={<LandingPageUser />} />
        <Route path="/konfirmasi" element={<KonfirmasiPermintaan />} />
        <Route path="/riwayat" element={<Riwayat />} />
      </Routes>
    </Router>
  );
}

export default App;
