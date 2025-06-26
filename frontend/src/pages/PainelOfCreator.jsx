import React, { useState, useEffect } from "react";
import BackgroundVideo from "/src/components/BackgroundVideo.jsx";
import { useNavigate } from "react-router-dom";
import "/src/assets/pro.css";

export default function PainelOfCreator() {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("termo-definicao");
  const [estrutura, setEstrutura] = useState([]);
  const [currentInput1, setCurrentInput1] = useState("");
  const [currentInput2, setCurrentInput2] = useState("");
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
    // eslint-disable-next-line
  }, []);

  const buscarMeusJogos = async (criadorId) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/games/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMeusJogos(data.filter((jogo) => jogo.criadorId === criadorId));
      }
    } catch (err) {
      setMeusJogos([]);
    }
  };

  const deletarJogo = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este jogo?")) return;
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/games/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMeusJogos((prev) => prev.filter((j) => j.id !== id));
        alert("Jogo excluído com sucesso!");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir jogo.");
      }
    } catch (err) {
      alert("Erro de conexão ao excluir jogo.");
    }
  };

  const adicionarPar = () => {
    if (!currentInput1.trim() || !currentInput2.trim()) {
      return alert("Preencha ambos os campos!");
    }
    if (tipo === "termo-definicao") {
      setEstrutura([
        ...estrutura,
        { term: currentInput1, definition: currentInput2 },
      ]);
    } else if (tipo === "item-categoria") {
      setEstrutura([
        ...estrutura,
        { item: currentInput1, category: currentInput2 },
      ]);
    }
    setCurrentInput1("");
    setCurrentInput2("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (estrutura.length === 0) {
      return alert("Adicione ao menos um par.");
    }
    const novoJogo = { titulo, tipo, estrutura, criadorId };
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5000/games/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoJogo),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Jogo criado com sucesso! Código: " + data.codigoAcesso);
        setTitulo("");
        setEstrutura([]);
        setCurrentInput1("");
        setCurrentInput2("");
        buscarMeusJogos(criadorId);
      } else {
        alert(data.error || "Erro ao criar jogo.");
      }
    } catch (err) {
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
              id="titulo"
              name="titulo"
              type="text"
              placeholder="Título do Jogo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <select
              id="tipo"
              name="tipo"
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setEstrutura([]);
                setCurrentInput1("");
                setCurrentInput2("");
              }}
            >
              <option value="termo-definicao">Termo e Definição</option>
              <option value="item-categoria">Item e Categoria</option>
            </select>
          </div>
          <div className="estrutura">
            <input
              id="input1"
              name="input1"
              type="text"
              placeholder={tipo === "termo-definicao" ? "Termo" : "Item"}
              value={currentInput1}
              onChange={(e) => setCurrentInput1(e.target.value)}
            />
            <input
              id="input2"
              name="input2"
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
          </div>
          <h3>Estrutura do Jogo:</h3>
          <ul>
            {estrutura.map((item, index) => (
              <li key={index}>
                {tipo === "termo-definicao"
                  ? `${item.term} - ${item.definition}`
                  : `${item.item} - ${item.category}`}
              </li>
            ))}
          </ul>
          <button type="submit">Criar Jogo</button>
          <button onClick={() => navigate("/home")}>
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
                <button onClick={() => deletarJogo(jogo.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
