import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

// Criar novo jogo
export const createGame = async (req, res) => {
  const { titulo, tipo, estrutura, criadorId } = req.body;

  if (!titulo || !tipo || !estrutura || !criadorId) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  if (tipo === "jogo-memoria") {
    if (
      !Array.isArray(estrutura) ||
      estrutura.length === 0 ||
      estrutura.length > 10
    ) {
      return res.status(400).json({ error: "Adicione entre 1 e 10 imagens." });
    }

    const todasValidas = estrutura.every(
      (img) => typeof img.imagemUrl === "string" && img.imagemUrl.trim() !== ""
    );

    if (!todasValidas) {
      return res.status(400).json({
        error: "Todas as imagens devem ter um campo 'imagemUrl' válido.",
      });
    }
  }

  if (tipo === "jogo-sabedoria") {
    if (!Array.isArray(estrutura) || estrutura.length === 0) {
      return res.status(400).json({ error: "Adicione ao menos uma pergunta." });
    }

    const todasValidas = estrutura.every((pergunta) => {
      return (
        typeof pergunta.pergunta === "string" &&
        Array.isArray(pergunta.alternativas) &&
        pergunta.alternativas.length >= 2 &&
        typeof pergunta.correta === "string" &&
        pergunta.alternativas.includes(pergunta.correta)
      );
    });

    if (!todasValidas) {
      return res.status(400).json({
        error:
          "Verifique se todas as perguntas possuem: texto, pelo menos 2 alternativas e uma resposta correta válida.",
      });
    }
  }

  const codigoAcesso = uuidv4().slice(0, 8);

  try {
    const novoJogo = await prisma.jogo.create({
      data: {
        titulo,
        tipo,
        criadorId,
        estrutura,
        codigoAcesso,
      },
    });

    return res.status(201).json(novoJogo);
  } catch (error) {
    console.error("[criarJogo] Erro:", error);
    return res.status(500).json({ error: "Erro ao criar jogo." });
  }
};

// Listar todos os jogos visíveis
export const getAllgames = async (req, res) => {
  try {
    const jogos = await prisma.jogo.findMany({
      where: { visivel: true },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(jogos);
  } catch (error) {
    console.error("[getAllgames] Erro:", error.message);
    return res.status(500).json({ error: "Erro ao buscar os jogos." });
  }
};

// Obter jogo por ID ou código de acesso
export const getGameById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }
    const jogo = await prisma.jogo.findUnique({
      where: { id },
    });

    if (!jogo) {
      return res.status(404).json({ error: "Jogo não encontrado." });
    }

    return res.json(jogo);
  } catch (error) {
    console.error("[getGameById] Erro:", error.message);
    return res.status(500).json({ error: "Erro ao buscar jogo." });
  }
};

// Excluir jogo
export const deleteGame = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.jogo.delete({ where: { id } });
    return res.json({ message: "Jogo excluído com sucesso!" });
  } catch (error) {
    console.error("[deleteGame] Erro:", error);
    return res.status(500).json({ error: "Erro ao excluir jogo." });
  }
};

// Salvar resultado do jogo
export const saveResult = async (req, res) => {
  const { userId, jogoId, acertos, erros, tempo, pontuacao } = req.body;

  if (!userId || !jogoId) {
    return res.status(400).json({ error: "Campos obrigatórios faltando." });
  }

  try {
    // Verificar se já existe um resultado igual
    const resultadoDuplicado = await prisma.resultado.findFirst({
      where: {
        userId,
        jogoId,
        pontuacao,
        tempo,
      },
    });

    if (resultadoDuplicado) {
      return res.status(200).json({ mensagem: "Resultado já registrado." });
    }

    const novoResultado = await prisma.resultado.create({
      data: {
        userId,
        jogoId,
        acertos,
        erros,
        tempo,
        pontuacao,
      },
    });
    res.status(201).json(novoResultado);
  } catch (error) {
    console.error("Erro ao salvar resultado:", error);
    res.status(500).json({ error: "Erro ao salvar resultado." });
  }
};

// Ranking por jogo (melhor resultado por usuário)
export const getRankingByJogoId = async (req, res) => {
  const { jogoId } = req.params;

  try {
    const todosResultados = await prisma.resultado.findMany({
      where: { jogoId },
      orderBy: [{ userId: "asc" }, { pontuacao: "desc" }, { tempo: "asc" }],
    });

    const melhoresPorUsuario = new Map();
    for (const r of todosResultados) {
      if (!melhoresPorUsuario.has(r.userId)) {
        melhoresPorUsuario.set(r.userId, r);
      }
    }

    const rankingFinal = Array.from(melhoresPorUsuario.values());

    const userIds = rankingFinal.map((r) => r.userId);
    const usuarios = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const rankingComUsuario = rankingFinal
      .map((res) => ({
        ...res,
        user: usuarios.find((u) => u.id === res.userId) || null,
      }))
      .sort((a, b) => {
        if (b.pontuacao !== a.pontuacao) return b.pontuacao - a.pontuacao;
        return a.tempo - b.tempo;
      })
      .slice(0, 10);

    return res.json(rankingComUsuario);
  } catch (error) {
    console.error("[getRankingByJogoId] Erro:", error);
    return res.status(500).json({ error: "Erro ao buscar ranking." });
  }
};
