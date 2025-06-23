import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();
const prisma = new PrismaClient();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Registro com verificação de email
export const register = async (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.user.create({
      data: {
        name: nome,
        email,
        password: hashedPassword,
        telephone: telefone || null,
        emailVerified: false,
      },
    });

    // Gera token JWT para verificação
    const token = jwt.sign({ userId: novoUsuario.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    // Configura transporte de email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Envia email de verificação
    await transporter.sendMail({
      from: `"Plataforma Educativa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verifique seu e-mail",
      html: `
        <p>Olá ${nome},</p>
        <p>Por favor, clique no link abaixo para verificar seu e-mail:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>O link expira em 1 hora.</p>
      `,
    });

    res.status(201).json({
      message:
        "Usuário registrado! Verifique seu e-mail para ativar sua conta.",
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Login com verificação de email
export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ error: "Verifique seu e-mail antes de fazer login." });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      usuario: {
        nome: user.name,
        email: user.email,
        telefone: user.telephone,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Verificação do email via link
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    res.send("E-mail verificado com sucesso! Você já pode fazer login.");
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    res.status(400).send("Link inválido ou expirado.");
  }
};

// Recuperação de senha - envio do link
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "E-mail não encontrado." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Suporte da Plataforma" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperação de Senha",
      html: `
        <p>Olá ${user.name},</p>
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para redefinir sua senha (válido por 1 hora):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Se você não solicitou isso, ignore este email.</p>
      `,
    });

    res.json({ message: "Email de recuperação enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    res.status(500).json({ error: "Erro ao enviar email de recuperação." });
  }
};

// Exclusão de usuário
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID inválido." });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Usuário removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
