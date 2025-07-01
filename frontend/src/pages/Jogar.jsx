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

  // Estado para jogo-memoria
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]); // indices das cartas viradas
  const [matchedIndices, setMatchedIndices] = useState([]); // indices das cartas já encontradas

  // Função para tocar sons
  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch((e) => console.warn("Erro ao tocar som:", e));
  };

  // Embaralhar array
  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    const arr = [...array];
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex],
        arr[currentIndex],
      ];
    }
    return arr;
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
        } else if (data.tipo === "jogo-memoria") {
          // Criar pares (duplicar) e embaralhar
          const duplicated = [...data.estrutura, ...data.estrutura];
          setCards(shuffleArray(duplicated));
        } else if (data.tipo === "jogo-sabedoria") {
          setGameData(data.estrutura);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar jogo:", error);
        setJogo(null);
      });
    // eslint-disable-next-line
  }, [id]);

  // --- Lógica jogo-memoria ---

  const handleCardClick = (index) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      matchedIndices.includes(index)
    )
      return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].imagemUrl === cards[second].imagemUrl) {
        setMatchedIndices((prev) => [...prev, first, second]);
        setScore((prev) => prev + 10);
        playSound("/sounds/correto.wav");
        setCorrectStreak((prev) => prev + 1);
        if (correctStreak + 1 >= 3) {
          setScore((prev) => prev + 5);
          playSound("/sounds/escolha.wav");
        }
        setFeedback("Par encontrado!");
      } else {
        setErros((prev) => prev + 1);
        setCorrectStreak(0);
        playSound("/sounds/erro.wav");
        setFeedback("Errado! Tente novamente.");
      }

      // Desvirar as cartas depois de 1.5s
      setTimeout(() => {
        setFlippedIndices([]);
        setFeedback(null);
      }, 1500);
    }
  };

  useEffect(() => {
    if (
      jogo?.tipo === "jogo-memoria" &&
      matchedIndices.length === cards.length &&
      cards.length > 0
    ) {
      setEndTime(Date.now());
      setGameOver(true);
    }
  }, [matchedIndices, cards, jogo]);

  // --- Lógica jogo-sabedoria ---

  const handleAnswerSabedoria = (answer) => {
    setSelectedAnswer(answer);
    const currentQuestion = gameData[currentIndex];
    const isCorrect = answer === currentQuestion.correta;
    let points = isCorrect ? 10 : 0;

    if (isCorrect) {
      setFeedback("Correto!");
      setScore((prev) => prev + points);
      setCorrectStreak((prev) => prev + 1);
      playSound("/sounds/correto.wav");
      if (correctStreak + 1 >= 3) {
        setScore((prev) => prev + 5);
        playSound("/sounds/escolha.wav");
      }
    } else {
      setFeedback("Errado! Tente novamente.");
      setErros((prev) => prev + 1);
      setCorrectStreak(0);
      playSound("/sounds/erro.wav");
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

  // --- Renderização do conteúdo ---

  const renderGameContent = () => {
    if (jogo.tipo === "termo-definicao") {
      return (
        <>
          <p>Termo:</p>
          <h3>{gameData[currentIndex].term}</h3>
          <div>
            {gameData[currentIndex].options.map((def, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(def)}
                disabled={!!feedback}
                className={
                  feedback
                    ? def === gameData[currentIndex].definition
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
          <h3>{gameData[currentIndex].item}</h3>
          <div>
            {shuffleArray(allCategories).map((cat, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(cat)}
                disabled={!!feedback}
                className={
                  feedback
                    ? cat === gameData[currentIndex].category
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
    } else if (jogo.tipo === "jogo-memoria") {
      return (
        <>
          <p>Encontre os pares das imagens iguais:</p>
          <div className="memory-container">
            <div className="memory-grid">
              {cards.map((card, idx) => {
                const isFlipped =
                  flippedIndices.includes(idx) || matchedIndices.includes(idx);

                return (
                  <div
                    key={idx}
                    className={`memory-card ${isFlipped ? "flipped" : ""}`}
                    onClick={() => handleCardClick(idx)}
                  >
                    <div className="memory-card-inner">
                      <div className="memory-card-front" />
                      <div className="memory-card-back">
                        <img src={card.imagemUrl} alt="imagem" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {feedback && <p className="feedback-message">{feedback}</p>}
          <p>Pontuação: {score}</p>
        </>
      );
    } else if (jogo.tipo === "jogo-sabedoria") {
      const question = gameData[currentIndex];
      return (
        <>
          <p>Pergunta:</p>
          <h3>{question.pergunta}</h3>
          <div>
            {question.alternativas.map((alt, i) => (
              <button
                key={i}
                onClick={() => handleAnswerSabedoria(alt)}
                disabled={!!feedback}
                className={
                  feedback
                    ? alt === question.correta
                      ? "btn-correto"
                      : selectedAnswer === alt
                      ? "btn-errado"
                      : ""
                    : ""
                }
              >
                {alt}
              </button>
            ))}
          </div>
        </>
      );
    }

    return <p>Tipo de jogo não suportado.</p>;
  };

  // Reuso da função para termo-definição e item-categoria
  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    let isCorrect = false;
    let points = 0;

    if (jogo.tipo === "termo-definicao") {
      isCorrect = answer === gameData[currentIndex].definition;
      points = isCorrect ? 10 : 0;
    } else if (jogo.tipo === "item-categoria") {
      isCorrect = answer === gameData[currentIndex].category;
      points = isCorrect ? 10 : 0;
    }

    if (isCorrect) {
      setFeedback("Correto!");
      setScore((prev) => prev + points);
      setCorrectStreak((prev) => prev + 1);
      playSound("/sounds/correto.wav");
      if (correctStreak + 1 >= 3) {
        setScore((prev) => prev + 5);
        playSound("/sounds/escolha.wav");
      }
    } else {
      setFeedback("Errado! Tente novamente.");
      setErros((prev) => prev + 1);
      setCorrectStreak(0);
      playSound("/sounds/erro.wav");
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

  if (!jogo) return <p>Carregando jogo...</p>;

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

  return (
    <>
      <BackgroundVideo />
      <div className="conteiner">
        <h2>{jogo.titulo}</h2>
        {jogo.tipo !== "jogo-memoria" && jogo.tipo !== "jogo-sabedoria" && (
          <p>
            Pergunta {currentIndex + 1} de {gameData.length}
          </p>
        )}
        {renderGameContent()}
        {feedback && jogo.tipo !== "jogo-memoria" && (
          <p className="feedback-message">{feedback}</p>
        )}
        <p>Pontuação: {score}</p>
      </div>
    </>
  );
}
