import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import "/src/assets/pro.css";

export default function Home() {
  const [jogos, setJogos] = useState([]);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    fetch("http://localhost:5000/games/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            setErro("Você precisa estar logado para ver os jogos.");
            setJogos([]);
            return [];
          }
          setErro("Erro ao buscar jogos.");
          setJogos([]);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setJogos(data);
        } else {
          setJogos([]);
        }
      })
      .catch(() => {
        setErro("Erro de conexão com o servidor.");
        setJogos([]);
      });
  }, []);

  const handleJogar = (id) => {
    navigate(`/jogar/${id}`);
  };

  return (
    <>
      <BackgroundVideo />
      <main className="conteiner1">
        <div>
          <h1>Bem-vindo ao Jogo de Termos e Definições!</h1>
          <p>Escolha um jogo para começar:</p>
        </div>
      </main>
      <div className="conteiner1">
        <h2>Jogos Disponíveis</h2>
        {erro && <p className="mensagem-erro">{erro}</p>}
        <ul>
          {Array.isArray(jogos) && jogos.length > 0 ? (
            jogos.map((jogo) => (
              <li key={jogo.id}>
                <strong>{jogo.titulo}</strong> ({jogo.tipo}){" "}
                <button onClick={() => handleJogar(jogo.id)}>Jogar</button>
              </li>
            ))
          ) : (
            <li>Nenhum jogo disponível.</li>
          )}
        </ul>
      </div>
    </>
  );
}
