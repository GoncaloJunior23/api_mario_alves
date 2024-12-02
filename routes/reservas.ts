import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import express from 'express';

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany();
    res.status(200).json(reservas);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", async (req, res) => {
  const { livroId, clienteId, datadaReserva, titulo } = req.body;

  if (!livroId || !clienteId || !datadaReserva || !titulo) {
    return res.status(400).json({
      erro: "Informe livroId, clienteId, datadaReserva e titulo"
    });
  }

  try {
    console.log("Dados recebidos:", { livroId, clienteId, datadaReserva });

    // Verificar se o livro existe
    const livroExistente = await prisma.livro.findUnique({
      where: { id: Number(livroId) },
    });
    if (!livroExistente) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }

    const dataReserva = new Date(datadaReserva);
    const dataEntrega = new Date(dataReserva);
    dataEntrega.setDate(dataReserva.getDate() + 5);

    // Criar nova reserva
    const reserva = await prisma.reserva.create({
      data: {
        livroId: Number(livroId),
        clienteId: Number(clienteId),
        datadaReserva: dataReserva,
      },
    });

    // Criar histórico automaticamente
    await prisma.historico.create({
      data: {
        livroId: Number(livroId),
        clienteId: Number(clienteId),
        titulo: titulo,
        datadaReserva: dataReserva,
        status: "Locado",
        datadaEntrega: dataEntrega

      },
    });

    res.status(201).json({
      mensagem: "Reserva feita com sucesso", reserva
    });
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    res.status(400).json({ erro: "Erro ao criar reserva" });
  }
});

export default router;

