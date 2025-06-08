import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";

import LandingPageAdmin from "./pages/LandingPageAdmin";
import LandingPageUser from "./pages/LandingPageUser";
import KonfirmasiPermintaan from "./components/KonfirmasiPermintaan";
import Riwayat from "./components/Riwayat";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<LandingPageAdmin />} />
        <Route path="/user/home" element={<LandingPageUser />} />
        <Route path="/konfirmasi" element={<KonfirmasiPermintaan />} />
        <Route path="/riwayat" element={<Riwayat />} />
      </Routes>
    </Router>
  );
}

export default App;
