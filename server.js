const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* =========================
   CONEXÃO MONGODB
========================= */
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("🟢 MongoDB conectado"))
.catch(err => console.log("🔴 erro MongoDB", err));

/* =========================
   MODEL
========================= */
const Produto = mongoose.model("Produto", {
  nome: String,
  preco: Number,
  img: String
});

/* =========================
   ROTAS
========================= */

/* LISTAR */
app.get("/produtos", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

/* CRIAR */
app.post("/produtos", async (req, res) => {
  try {
    const novo = await Produto.create(req.body);
    res.json(novo);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar" });
  }
});

/* 🔥 DELETAR (AGORA FUNCIONA) */
app.delete("/produtos/:id", async (req, res) => {
  console.log("🔥 DELETE CHAMADO:", req.params.id);

  try {
    const deletado = await Produto.findByIdAndDelete(req.params.id);

    if (!deletado) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json({ mensagem: "Produto removido com sucesso" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "Erro ao deletar" });
  }
});

/* PEDIDO */
app.post("/pedido", (req, res) => {
  console.log("🧾 Pedido:", req.body);
  res.json({ mensagem: "Pedido recebido" });
});

/* =========================
   START
========================= */
app.listen(3000, () => {
  console.log("🚀 servidor rodando em http://localhost:3000");
});