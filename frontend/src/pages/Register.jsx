import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import "/src/assets/style.css";
import "/src/assets/pro.css";

export default function Register() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [role, setRole] = useState("jogador");
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
        body: JSON.stringify({
          role,
          nome,
          email,
          senha,
          telefone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          data.message ||
            "Cadastro realizado com sucesso! Verifique seu e-mail."
        );
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
          <div className="role-selector">
            <label className={role === "jogador" ? "selected" : ""}>
              <input
                type="radio"
                name="role"
                value="jogador"
                checked={role === "jogador"}
                onChange={() => setRole("jogador")}
              />
              Jogador
            </label>
            <label className={role === "criador" ? "selected" : ""}>
              <input
                type="radio"
                name="role"
                value="criador"
                checked={role === "criador"}
                onChange={() => setRole("criador")}
              />
              Criador
            </label>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <i className="bx bx-user"></i>
            </div>
            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <i className="bx bx-envelope"></i>
            </div>
            <div className="input-box">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                autoComplete="new-password"
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
                autoComplete="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              <i className="bx bx-phone"></i>
            </div>
            <button id="a" type="submit" className="login">
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
