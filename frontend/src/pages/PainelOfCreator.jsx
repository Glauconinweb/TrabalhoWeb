import React, { useState, useEffect } from "react";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import { useNavigate } from "react-router-dom";
import "/src/assets/pro.css";
import { playSound } from "../utils/audio";

export default function PainelOfCreator() {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("termo-definicao");
  const [estrutura, setEstrutura] = useState([]);
  const [currentInput1, setCurrentInput1] = useState("");
  const [currentInput2, setCurrentInput2] = useState("");
  const [alternativas, setAlternativas] = useState([]);
  const [respostaCorreta, setRespostaCorreta] = useState(null);
  const [criadorId, setCriadorId] = useState("");
  const [meusJogos, setMeusJogos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
    if (!usuario) {
      alert("Faça login para continuar.");
      return navigate("/login");
    }
    if (usuario.role !== "criador") {
      alert("Acesso restrito a criadores de jogos.");
      return navigate("/home");
    }
    setCriadorId(usuario.id);
    buscarMeusJogos(usuario.id);
  }, []);

  const buscarMeusJogos = async (criadorId) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        "https://plataformagames.onrender.com/games/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMeusJogos(data.filter((jogo) => jogo.criadorId === criadorId));
      }
    } catch {
      setMeusJogos([]);
    }
  };

  const deletarJogo = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este jogo?")) return;
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `https://plataformagames.onrender.com/games/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setMeusJogos((prev) => prev.filter((j) => j.id !== id));
        alert("Jogo excluído com sucesso!");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir jogo.");
      }
    } catch {
      alert("Erro de conexão ao excluir jogo.");
    }
  };

  const adicionarPar = () => {
    if (tipo === "termo-definicao" || tipo === "item-categoria") {
      if (!currentInput1.trim() || !currentInput2.trim()) {
        return alert("Preencha ambos os campos!");
      }
      if (tipo === "termo-definicao") {
        setEstrutura([
          ...estrutura,
          { term: currentInput1, definition: currentInput2 },
        ]);
      } else {
        setEstrutura([
          ...estrutura,
          { item: currentInput1, category: currentInput2 },
        ]);
      }
      setCurrentInput1("");
      setCurrentInput2("");
    } else if (tipo === "jogo-memoria") {
      if (!currentInput1.trim()) return alert("URL inválida.");
      if (estrutura.length >= 10) return alert("Máximo de 10 imagens.");
      setEstrutura([...estrutura, { imagemUrl: currentInput1.trim() }]);
      setCurrentInput1("");
    } else if (tipo === "jogo-sabedoria") {
      if (
        !currentInput1.trim() ||
        alternativas.length < 2 ||
        respostaCorreta === null
      ) {
        return alert(
          "Preencha pergunta, ao menos 2 alternativas e selecione a correta."
        );
      }
      setEstrutura([
        ...estrutura,
        {
          pergunta: currentInput1.trim(),
          alternativas,
          correta: alternativas[respostaCorreta],
        },
      ]);
      setCurrentInput1("");
      setAlternativas([]);
      setRespostaCorreta(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (estrutura.length === 0) return alert("Adicione ao menos um item.");
    const novoJogo = { titulo, tipo, estrutura, criadorId };
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        "https://plataformagames.onrender.com/games/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(novoJogo),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Jogo criado com sucesso! Código: " + data.codigoAcesso);
        setTitulo("");
        setEstrutura([]);
        setCurrentInput1("");
        setCurrentInput2("");
        setAlternativas([]);
        setRespostaCorreta(null);
        buscarMeusJogos(criadorId);
      } else {
        alert(data.error || "Erro ao criar jogo.");
      }
    } catch {
      alert("Erro de conexão com o servidor.");
    }
  };

  return (
    <>
      <BackgroundVideo />
      <main className="conteiner">
        <h2>Criar Novo Jogo</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="text"
              placeholder="Título do Jogo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setEstrutura([]);
                setCurrentInput1("");
                setCurrentInput2("");
                setAlternativas([]);
                setRespostaCorreta(null);
              }}
            >
              <option value="termo-definicao">Termo e Definição</option>
              <option value="item-categoria">Item e Categoria</option>
              <option value="jogo-memoria">Jogo da Memória</option>
              <option value="jogo-sabedoria">Jogo da Sabedoria</option>
            </select>
          </div>

          <div className="estrutura">
            {tipo === "termo-definicao" || tipo === "item-categoria" ? (
              <>
                <input
                  type="text"
                  placeholder={tipo === "termo-definicao" ? "Termo" : "Item"}
                  value={currentInput1}
                  onChange={(e) => setCurrentInput1(e.target.value)}
                />
                <input
                  type="text"
                  placeholder={
                    tipo === "termo-definicao" ? "Definição" : "Categoria"
                  }
                  value={currentInput2}
                  onChange={(e) => setCurrentInput2(e.target.value)}
                />
                <button type="button" onClick={adicionarPar}>
                  Adicionar
                </button>
              </>
            ) : tipo === "jogo-memoria" ? (
              <>
                <input
                  type="text"
                  placeholder="URL da Imagem"
                  value={currentInput1}
                  onChange={(e) => setCurrentInput1(e.target.value)}
                />
                <button type="button" onClick={adicionarPar}>
                  Adicionar Imagem
                </button>
              </>
            ) : tipo === "jogo-sabedoria" ? (
              <>
                <input
                  type="text"
                  placeholder="Pergunta"
                  value={currentInput1}
                  onChange={(e) => setCurrentInput1(e.target.value)}
                />
                {alternativas.map((alt, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", gap: "8px", marginBottom: "4px" }}
                  >
                    <input
                      type="radio"
                      name="respostaCorreta"
                      checked={respostaCorreta === i}
                      onChange={() => setRespostaCorreta(i)}
                    />
                    <input
                      type="text"
                      value={alt}
                      onChange={(e) => {
                        const novas = [...alternativas];
                        novas[i] = e.target.value;
                        setAlternativas(novas);
                      }}
                      placeholder={`Alternativa ${i + 1}`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (alternativas.length >= 5) return;
                    setAlternativas([...alternativas, ""]);
                  }}
                >
                  Adicionar Alternativa
                </button>
                <br />
                <button type="button" onClick={adicionarPar}>
                  Adicionar Pergunta
                </button>
              </>
            ) : null}
          </div>

          <h3>Estrutura do Jogo:</h3>
          <ul>
            {estrutura.map((item, index) => (
              <li key={index}>
                {tipo === "termo-definicao" &&
                  `${item.term} - ${item.definition}`}
                {tipo === "item-categoria" && `${item.item} - ${item.category}`}
                {tipo === "jogo-memoria" && (
                  <img src={item.imagemUrl} width={80} />
                )}
                {tipo === "jogo-sabedoria" && (
                  <>
                    <strong>{item.pergunta}</strong>
                    <ul>
                      {item.alternativas.map((alt, i) => (
                        <li
                          key={i}
                          style={{
                            color: alt === item.correta ? "green" : "black",
                          }}
                        >
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>

          <button
            className="as"
            onClick={playSound("/sounds/escolha.wav")}
            type="submit"
          >
            Criar Jogo
          </button>
          <button
            className="as"
            type="button"
            onClick={() => navigate("/home")}
          >
            Ir para Área de Jogador
          </button>
        </form>

        <hr style={{ margin: "2rem 0" }} />
        <h2>Meus Jogos Criados</h2>
        {meusJogos.length === 0 ? (
          <p>Você ainda não criou jogos.</p>
        ) : (
          <ul>
            {meusJogos.map((jogo) => (
              <li key={jogo.id}>
                <strong>{jogo.titulo}</strong> ({jogo.tipo}){" "}
                <button id="e" onClick={() => deletarJogo(jogo.id)}>
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
