import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

// Criar novo jogo (termo-definição ou item-categoria)
export const createGame = async (req, res) => {
  const { titulo, tipo, estrutura, criadorId } = req.body;

  if (!titulo || !tipo || !estrutura || !criadorId) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  const codigoAcesso = uuidv4().slice(2, 8);
  codigoAcesso; // código único de 8 caracteres

  try {
    const novoJogo = await prisma.jogo.create({
      data: {
        titulo,
        tipo,
        criadorId,
        estrutura,
        codigoAcesso: uuidv4().slice(0, 8), // código único de 8 caracteres
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
export const getRankingByJogoId = async (req, res) => {
  const { jogoId } = req.params;

  try {
    // Busca os resultados do jogo, ordenados pela pontuação decrescente
    const resultados = await prisma.resultado.findMany({
      where: { jogoId },
      orderBy: { pontuacao: "desc" },
      take: 10,
    });

    // Pega todos os userIds dos resultados para buscar usuários
    const userIds = resultados.map((r) => r.userId);

    // Busca usuários correspondentes (só id e nome)
    const usuarios = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    // Junta cada resultado com seu usuário
    const ranking = resultados.map((res) => {
      const usuario = usuarios.find((u) => u.id === res.userId);
      return {
        ...res,
        user: usuario || null,
      };
    });

    return res.json(ranking);
  } catch (error) {
    console.error("[getRankingByJogoId] Erro:", error);
    return res.status(500).json({ error: "Erro ao buscar ranking." });
  }
};
export const saveResult = async (req, res) => {
  const { userId, jogoId, acertos, erros, tempo, pontuacao } = req.body;

  if (!userId || !jogoId) {
    return res.status(400).json({ error: "Campos obrigatórios faltando." });
  }

  try {
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
