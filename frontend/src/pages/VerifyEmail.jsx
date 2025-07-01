import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState("Verificando...");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const verificarEmail = async () => {
      try {
        const resposta = await fetch(
          `http://locahost:5000/auth/verify-email/${token}`
        );
        const texto = await resposta.text();

        if (resposta.ok) {
          setMensagem(texto);
          setTimeout(() => navigate("/login"), 4000); // redireciona em 4s
        } else {
          setErro(texto);
        }
      } catch (e) {
        setErro("Erro ao verificar o e-mail.");
        console.error(e);
      }
    };

    verificarEmail();
  }, [token, navigate]);

  return (
    <>
      <BackgroundVideo />
      <main className="conteiner">
        <div className="form-container">
          <h1>Verificação de E-mail</h1>
          {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
          {erro && <p className="mensagem-erro">{erro}</p>}
        </div>
      </main>
    </>
  );
}
