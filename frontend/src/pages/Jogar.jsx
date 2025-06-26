import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import GameResult from "/src/components/GameResult.jsx";
import "/src/assets/pro.css";

export default function Jogar() {
  const { id } = useParams();
  const [jogo, setJogo] = useState(null);
  const [gameData, setGameData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [erros, setErros] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Função auxiliar para tocar sons (RF07)
  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch((e) => console.warn("Erro ao tocar som:", e));
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    fetch(`http://localhost:5000/games/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Não autorizado ou erro ao buscar jogo.");
        return res.json();
      })
      .then((data) => {
        setJogo(data);
        setStartTime(Date.now());
        if (data.tipo === "termo-definicao") {
          setGameData(
            data.estrutura.map((pair) => ({
              ...pair,
              options: shuffleArray(data.estrutura.map((p) => p.definition)),
            }))
          );
        } else if (data.tipo === "item-categoria") {
          setGameData(shuffleArray(data.estrutura));
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar jogo:", error);
        setJogo(null);
      });
    // eslint-disable-next-line
  }, [id]);

  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  if (!jogo || gameData.length === 0) return <p>Carregando jogo...</p>;

  if (gameOver) {
    return (
      <GameResult
        score={score}
        erros={erros}
        time={(endTime - startTime) / 1000}
        jogoId={jogo.id}
      />
    );
  }

  const currentItem = gameData[currentIndex];

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    let isCorrect = false;
    let points = 0;

    if (jogo.tipo === "termo-definicao") {
      isCorrect = answer === currentItem.definition;
      points = isCorrect ? 10 : 0;
    } else if (jogo.tipo === "item-categoria") {
      isCorrect = answer === currentItem.category;
      points = isCorrect ? 10 : 0;
    }

    if (isCorrect) {
      setFeedback("Correto!");
      setScore((prev) => prev + points);
      setCorrectStreak((prev) => prev + 1);
      playSound("/sounds/correct.mp3");
      if (correctStreak + 1 >= 3) {
        setScore((prev) => prev + 5);
        playSound("/sounds/bonus.mp3");
      }
    } else {
      setFeedback("Errado! Tente novamente.");
      setErros((prev) => prev + 1);
      setCorrectStreak(0);
      playSound("/sounds/wrong.mp3");
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      if (currentIndex < gameData.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setEndTime(Date.now());
        setGameOver(true);
      }
    }, 1500);
  };

  const renderGameContent = () => {
    if (jogo.tipo === "termo-definicao") {
      return (
        <>
          <p>Termo:</p>
          <h3>{currentItem.term}</h3>
          <div>
            {currentItem.options.map((def, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(def)}
                disabled={!!feedback}
                className={
                  feedback
                    ? def === currentItem.definition
                      ? "btn-correto"
                      : selectedAnswer === def
                      ? "btn-errado"
                      : ""
                    : ""
                }
              >
                {def}
              </button>
            ))}
          </div>
        </>
      );
    } else if (jogo.tipo === "item-categoria") {
      const allCategories = [...new Set(jogo.estrutura.map((p) => p.category))];
      return (
        <>
          <p>Item:</p>
          <h3>{currentItem.item}</h3>
          <div>
            {shuffleArray(allCategories).map((cat, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(cat)}
                disabled={!!feedback}
                className={
                  feedback
                    ? cat === currentItem.category
                      ? "btn-correto"
                      : selectedAnswer === cat
                      ? "btn-errado"
                      : ""
                    : ""
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </>
      );
    }
    return <p>Tipo de jogo não suportado.</p>;
  };

  return (
    <>
      <BackgroundVideo />
      <div className="conteiner">
        <h2>{jogo.titulo}</h2>
        <p>
          Pergunta {currentIndex + 1} de {gameData.length}
        </p>
        {renderGameContent()}
        {feedback && <p className="feedback-message">{feedback}</p>}
        <p>Pontuação: {score}</p>
      </div>
    </>
  );
}
