import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import "/src/assets/style.css"; // vamos criar esse arquivo para o estilo

export default function Register() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, telefone }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Cadastro realizado com sucesso!");
        navigate("/login");
      } else {
        alert(data.error || "Erro ao cadastrar.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
      console.error("Erro:", error);
    }
  };

  return (
    <>
      <BackgroundVideo />
      <main className="conteiner">
        <div className="form-container">
          <h1>Criar Conta</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <i class="bx bx-user"></i>
            </div>
            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <i class="bx bx-envelope"></i>
            </div>
            <div className="input-box">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <i
                className={`bx ${mostrarSenha ? "bx-lock-open" : "bx-lock"}`}
                onClick={() => setMostrarSenha((prev) => !prev)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
            <div className="input-box">
              <input
                type="tel"
                name="telefone"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              <i class="bx bx-phone"></i>
            </div>
            <button type="submit" className="login">
              Criar Conta
            </button>
          </form>

          <p className="register-link">
            Já tem uma conta? <a href="/login">Faça login aqui!</a>
          </p>
        </div>
      </main>
    </>
  );
}
