import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import "/src/assets/style.css"; // ajuste conforme sua estrutura

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMensagem(
          data.message || "Email de recuperação enviado com sucesso!"
        );
        setEmail("");
      } else {
        setErro(data.error || "Erro ao enviar recuperação.");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor.");
      console.error("Erro:", err);
    }
  };

  return (
    <>
      <BackgroundVideo />
      <main className="conteiner">
        <div className="form-container">
          <h1>Recuperar Senha</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <i className="bx bx-envelope"></i>
            </div>

            <button type="submit" className="login">
              Enviar recuperação
            </button>
          </form>

          {/* Mensagens de feedback */}
          {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
          {erro && <p className="mensagem-erro">{erro}</p>}

          <p className="register-link">
            Lembrou a senha? <a href="/login">Voltar para o login</a>
          </p>
        </div>
      </main>
    </>
  );
}
