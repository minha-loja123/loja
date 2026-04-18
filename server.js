const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

/* ========================
   CONEXÃO MONGODB
======================== */
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("🟢 MongoDB conectado"))
.catch(err => {
  console.log("🔴 ERRO MONGODB:");
  console.log(err);
});

/* ========================
   MODELOS
======================== */

const Produto = mongoose.model("Produto", {
  nome: String,
  preco: Number,
  img: String
});

const Pedido = mongoose.model("Pedido", {
  carrinho: Array,
  total: Number,
  data: { type: Date, default: Date.now }
});

const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String
});

/* ========================
   SETUP ADMIN
======================== */
app.get("/setup", async (req, res) => {
  try {

    console.log("🔥 SETUP RODANDO...");

    const existe = await User.findOne({ username: "admin" });

    if (existe) {
      return res.send("admin já existe");
    }

    const hash = await bcrypt.hash("123456", 10);

    const novo = await User.create({
      username: "admin",
      password: hash,
      role: "admin"
    });

    console.log("✅ ADMIN CRIADO:", novo);

    res.send("admin criado com sucesso");

  } catch (err) {
    console.log("🔥 ERRO SETUP REAL:");
    console.log(err);
    res.status(500).send("erro setup: " + err.message);
  }
});

/* ========================
   LOGIN
======================== */
app.post("/login", async (req, res) => {
  try {

    console.log("🔥 LOGIN:", req.body);

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ erro: "usuário não existe" });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(400).json({ erro: "senha incorreta" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ erro: "JWT_SECRET não configurado" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.log("🔥 ERRO LOGIN:");
    console.log(err);
    res.status(500).json({ erro: "erro interno login" });
  }
});

/* ========================
   AUTH
======================== */
function auth(req, res, next) {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ erro: "sem token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "token inválido" });
  }
}

/* ========================
   PRODUTOS
======================== */

app.get("/produtos", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

app.post("/admin/produto", auth, async (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ erro: "sem permissão" });
  }

  const novo = await Produto.create(req.body);
  res.json(novo);
});

/* ========================
   PEDIDOS
======================== */
app.post("/pedido", async (req, res) => {
  try {
    const pedido = await Pedido.create(req.body);
    res.json({ mensagem: "Pedido salvo!", pedido });
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "erro ao salvar pedido" });
  }
});

/* ========================
   START SERVER
======================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 servidor rodando na porta " + PORT);
});