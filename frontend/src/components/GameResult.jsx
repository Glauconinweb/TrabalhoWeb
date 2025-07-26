import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import "/src/assets/pro.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://plataformagames.onrender.com";

const GameResult = ({ score, erros, time, jogoId }) => {
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState("Salvando resultado...");
  const [ranking, setRanking] = useState([]);
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => {
    const saveGameResult = async () => {
      const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
      const token = sessionStorage.getItem("token");

      if (!usuario || !usuario.id || !token) {
        setSaveStatus("Resultado não salvo (usuário não logado).");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/games/results`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: usuario.id.toString(),
            jogoId: jogoId?.toString(),
            acertos: Math.floor(score / 10),
            erros,
            tempo: Math.round(time),
            pontuacao: score,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setSaveStatus(
            `Erro ao salvar resultado: ${
              errorData.error || "Erro desconhecido"
            }`
          );
        } else {
          setSaveStatus("Resultado salvo com sucesso!");
          fetchRanking();
        }
      } catch (error) {
        setSaveStatus("Erro de conexão ao salvar resultado.");
      }
    };

    const fetchRanking = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/games/ranking/${jogoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar ranking.");
        const data = await response.json();
        setRanking(data);
      } catch {
        setRanking([]);
      }
    };

    if (jogoId) saveGameResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, erros, time, jogoId]);

  const handleRestartGame = () => {
    // Navega para a mesma rota do jogo, forçando reload para reiniciar
    navigate(`/jogar/${jogoId}`, { replace: true });
    setTimeout(() => window.location.reload(), 100);
  };

  const handleGoHome = () => navigate("/home");

  return (
    <>
      <BackgroundVideo />
      <div className="conteiner">
        <h2>Fim de Jogo!</h2>
        <p>
          Pontuação Final: <strong>{score}</strong>
        </p>
        <p>Acertos: {Math.floor(score / 10)}</p>
        <p>Erros: {erros}</p>
        <p>Tempo: {time.toFixed(2)} segundos</p>
        <p>{saveStatus}</p>

        <div>
          <button onClick={handleRestartGame}>Reiniciar Jogo</button>
          <br />
          <button onClick={handleGoHome}>Área Games</button>
          <br />
          <button onClick={() => setShowRanking((v) => !v)}>
            {showRanking ? "Esconder Ranking" : "Ver Ranking"}
          </button>
        </div>

        {showRanking && (
          <div className="ranking-list">
            <h3>Ranking do Jogo</h3>
            {ranking.length > 0 ? (
              <ol>
                {ranking.map((res, index) => (
                  <li key={res.id}>
                    <strong>
                      {index + 1}.{" "}
                      {res.user?.name || res.usuario?.nome || "Usuário"}
                    </strong>{" "}
                    - Pontuação: {res.pontuacao} (Tempo: {res.tempo}s)
                  </li>
                ))}
              </ol>
            ) : (
              <p>Nenhum resultado ainda para este jogo.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GameResult;
