import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import PainelOfCreator from "./pages/PainelOfCreator";
import Jogar from "./pages/Jogar";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/home" element={<Home />} />
        <Route path="/painelOfCreator" element={<PainelOfCreator />} />
        <Route path="/jogar/:id" element={<Jogar />} />
        {/* Adicione outras rotas conforme necessário */}
      </Routes>
    </Router>
  );
}
