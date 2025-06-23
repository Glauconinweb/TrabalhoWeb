import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";

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
      const resposta = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.error || "Erro ao fazer login.");
        return;
      }

      sessionStorage.setItem("token", dados.token);
      sessionStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

      navigate("/home"); // redireciona para página principal
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

          <button type="submit" className="login">
            Entrar
          </button>
        </form>
        <p className="register-link">
          <a href="/register">Não tem uma conta ? Cadastre-se aqui!</a>
        </p>
        <button onClick={irparaforgot} className="login">
          Esqueceu a senha ? Clique aqui !
        </button>
      </main>
    </>
  );
}
