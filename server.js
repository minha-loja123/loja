require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// =====================
// CONEXÃO MONGODB (CLOUD)
// =====================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.log("Erro MongoDB:", err));

// =====================
// PRODUTO
// =====================
const Produto = mongoose.model("Produto", {
  nome: String,
  preco: Number,
  img: String
});

// =====================
// PEDIDO
// =====================
const Pedido = mongoose.model("Pedido", {
  usuario: String,
  carrinho: Array,
  total: Number,
  status: { type: String, default: "Processando" },
  data: { type: Date, default: Date.now }
});

// =====================
// PRODUTOS
// =====================
app.get("/produtos", async (req, res) => {
  res.json(await Produto.find());
});

app.post("/admin/produto", async (req, res) => {
  await new Produto(req.body).save();
  res.json({ mensagem: "Produto criado!" });
});

app.put("/admin/produto/:id", async (req, res) => {
  await Produto.findByIdAndUpdate(req.params.id, req.body);
  res.json({ mensagem: "Produto atualizado!" });
});

app.delete("/admin/produto/:id", async (req, res) => {
  await Produto.findByIdAndDelete(req.params.id);
  res.json({ mensagem: "Produto deletado!" });
});

// =====================
// LOGIN SIMPLES
// =====================
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (email === "admin" && senha === "123") {
    return res.json({
      ok: true,
      usuario: "admin"
    });
  }

  return res.json({ ok: false });
});

// =====================
// PEDIDO
// =====================
app.post("/pedido", async (req, res) => {
  const pedido = new Pedido(req.body);
  await pedido.save();

  console.log("🔥 Pedido recebido:", pedido);

  res.json({ mensagem: "Compra finalizada!" });
});

// =====================
// ADMIN PEDIDOS
// =====================
app.get("/admin/pedidos", async (req, res) => {
  const pedidos = await Pedido.find().sort({ data: -1 });
  res.json(pedidos);
});

app.put("/admin/pedido/:id", async (req, res) => {
  await Pedido.findByIdAndUpdate(req.params.id, {
    status: req.body.status
  });

  res.json({ mensagem: "Status atualizado!" });
});

// =====================
// SERVER
// =====================
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Servidor rodando");
});