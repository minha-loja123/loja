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
   CONEXÃO MONGODB (MELHORADA)
======================== */
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("🟢 MongoDB conectado"))
.catch(err => {
  console.log("🔴 erro MongoDB");
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
   SETUP ADMIN (RODAR 1X)
======================== */
app.get("/setup", async (req, res) => {
  try {
    const existe = await User.findOne({ username: "admin" });

    if (existe) {
      return res.send("admin já existe");
    }

    const hash = await bcrypt.hash("123456", 10);

    await User.create({
      username: "admin",
      password: hash,
      role: "admin"
    });

    res.send("admin criado com sucesso");
  } catch (err) {
    console.log(err);
    res.status(500).send("erro no setup");
  }
});

/* ========================
   LOGIN
======================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ erro: "Usuário não existe" });

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.status(400).json({ erro: "Senha incorreta" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

/* ========================
   AUTH ADMIN
======================== */
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("Sem token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Token inválido");
  }
}

/* ========================
   PRODUTOS
======================== */

// listar
app.get("/produtos", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

// criar (admin)
app.post("/admin/produto", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).send("Sem permissão");

  const novo = await Produto.create(req.body);
  res.json(novo);
});

/* ========================
   PEDIDOS
======================== */
app.post("/pedido", async (req, res) => {
  const pedido = await Pedido.create(req.body);
  res.json({ mensagem: "Pedido salvo!", pedido });
});

/* ========================
   START SERVER
======================== */
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 servidor rodando");
});