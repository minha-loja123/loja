const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

/* PORTA */
const PORT = process.env.PORT || 3000;

/* MIDDLEWARE */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* CONEXÃO MONGODB */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🟢 MongoDB conectado");
  })
  .catch((err) => {
    console.log("❌ Erro MongoDB:", err);
  });

/* MODEL */
const Produto = mongoose.model("Produto", {
  nome: String,
  preco: Number,
  img: String
});

/* ROTAS */

// listar produtos
app.get("/produtos", async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

// criar produto
app.post("/produtos", async (req, res) => {
  try {
    const novo = new Produto(req.body);
    await novo.save();
    res.json(novo);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar produto" });
  }
});

// deletar produto
app.delete("/produtos/:id", async (req, res) => {
  try {
    await Produto.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar produto" });
  }
});

/* SERVIR SITE */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* START */
app.listen(PORT, () => {
  console.log("🚀 rodando na porta " + PORT);
});