import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import { playSound } from "../utils/audio";

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const irparaforgot = () => {
    navigate("/forgotpassword");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.error || "Erro ao fazer login.");
        return;
      }

      // Tocar som só após sucesso
      playSound("/sounds/escolha.wav");

      sessionStorage.setItem("token", dados.token);
      sessionStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

      if (dados.usuario.role === "criador") {
        navigate("/painelOfCreator");
      } else {
        navigate("/home");
      }
    } catch (erro) {
      alert("Erro de conexão com o servidor.");
      console.error("Erro:", erro);
    }
  };

  return (
    <>
      <BackgroundVideo />
      <main className="conteiner">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
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
              autoComplete="current-password"
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

          <button type="submit" className="login">
            Entrar
          </button>
        </form>

        <p className="register-link">
          Não tem uma conta? <Link to="/register">Cadastre-se aqui!</Link>
        </p>

        <button onClick={irparaforgot} className="login">
          Esqueceu a senha? Clique aqui!
        </button>
      </main>
    </>
  );
}
