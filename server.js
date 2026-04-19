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
   MONGODB
======================== */
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("🟢 MongoDB conectado"))
.catch(err => console.log("🔴 erro MongoDB", err));

/* ========================
   MODELOS
======================== */
const Produto = mongoose.model("Produto", {
  nome: String,
  preco: Number,
  img: String,
  categoria: String
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
  const existe = await User.findOne({ username: "admin" });

  if (existe) return res.send("admin já existe");

  const hash = await bcrypt.hash("123456", 10);

  await User.create({
    username: "admin",
    password: hash,
    role: "admin"
  });

  res.send("admin criado");
});

/* ========================
   LOGIN
======================== */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ erro: "não existe" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ erro: "senha errada" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ erro: "erro login" });
  }
});

/* ========================
   AUTH
======================== */
function auth(req, res, next){
  const token = req.headers.authorization;
  if(!token) return res.status(401).json({erro:"sem token"});

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({erro:"token inválido"});
  }
}

/* ========================
   PRODUTOS
======================== */
app.get("/produtos", async (req,res)=>{
  const produtos = await Produto.find();
  res.json(produtos);
});

app.post("/admin/produto", auth, async (req,res)=>{
  const p = await Produto.create(req.body);
  res.json(p);
});

app.put("/admin/produto/:id", auth, async (req,res)=>{
  const p = await Produto.findByIdAndUpdate(req.params.id, req.body, {new:true});
  res.json(p);
});

app.delete("/admin/produto/:id", auth, async (req,res)=>{
  await Produto.findByIdAndDelete(req.params.id);
  res.json({ok:true});
});

/* ========================
   START
======================== */
app.listen(process.env.PORT || 3000, ()=>{
  console.log("🚀 servidor rodando");
});