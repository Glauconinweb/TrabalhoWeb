// src/controllers/authController.js

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();
const prisma = new PrismaClient();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

// Registro - cria token e envia email para backend validar
export const register = async (req, res) => {
  const { role, nome, email, senha, telefone } = req.body;

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

    // Gerar token com dados do usuário (não salva ainda no banco)
    const token = jwt.sign(
      { nome, email, senha: hashedPassword, telefone, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Link aponta para backend para validação do token e criação do usuário
    const verificationLink = `${process.env.BACKEND_URL}/auth/verify-email/${token}`;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Plataforma Educativa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verifique seu e-mail",
      html: `
        <p>Olá ${nome},</p>
        <p>Por favor, clique no link abaixo para verificar seu e-mail e concluir seu cadastro:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>O link expira em 1 hora.</p>
      `,
    });

    return res.status(201).json({
      message:
        "Verifique seu e-mail para concluir o cadastro. O link expira em 1 hora.",
    });
  } catch (error) {
    console.error("[register] Erro:", error.message || error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Verificação do email via link (backend recebe token, valida e cria usuário)
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { nome, email, senha, telefone, role } = decoded;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res
        .status(400)
        .send("Este e-mail já foi verificado anteriormente.");
    }

    await prisma.user.create({
      data: {
        name: nome,
        email: email,
        password: senha,
        telephone: telefone || null,
        emailVerified: true,
        role: role || "jogador",
      },
    });

    // Redireciona para frontend com sucesso (você pode criar uma página legal lá)
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error("[verifyEmail] Erro:", error.message || error);
    return res.status(400).send("Link inválido ou expirado.");
  }
};

// Login com validação do email verificado
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
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
        telefone: user.telephone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[login] Erro:", error.message || error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Recuperação de senha - envio do link por email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "E-mail não encontrado." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = createTransporter();

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

    return res.json({ message: "Email de recuperação enviado com sucesso!" });
  } catch (error) {
    console.error("[forgotPassword] Erro:", error.message || error);
    return res
      .status(500)
      .json({ error: "Erro ao enviar email de recuperação." });
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

    return res.json({ message: "Usuário removido com sucesso!" });
  } catch (error) {
    console.error("[deleteUser] Erro:", error.message || error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
