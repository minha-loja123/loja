const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL);

/* ================= MODELOS ================= */
const Produto = mongoose.model("Produto", {
  nome:String,
  preco:Number,
  img:String,
  categoria:String
});

const User = mongoose.model("User", {
  username:String,
  password:String,
  role:String
});

const Pedido = mongoose.model("Pedido", {
  carrinho:Array,
  total:Number,
  status:{type:String, default:"pendente"},
  createdAt:{type:Date, default:Date.now}
});

/* ================= SETUP ================= */
app.get("/setup", async (req,res)=>{
  const exists = await User.findOne({username:"admin"});
  if(exists) return res.send("admin já existe");

  const hash = await bcrypt.hash("123456",10);

  await User.create({
    username:"admin",
    password:hash,
    role:"admin"
  });

  res.send("admin criado");
});

/* ================= LOGIN ================= */
app.post("/login", async (req,res)=>{
  const {username,password} = req.body;

  const user = await User.findOne({username});
  if(!user) return res.status(400).json({error:"user não existe"});

  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.status(400).json({error:"senha errada"});

  const token = jwt.sign(
    {id:user._id,role:user.role},
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
  );

  res.json({token});
});

/* ================= PRODUTOS ================= */
app.get("/produtos", async (req,res)=>{
  res.json(await Produto.find());
});

app.post("/admin/produto", async (req,res)=>{
  res.json(await Produto.create(req.body));
});

app.delete("/admin/produto/:id", async (req,res)=>{
  await Produto.findByIdAndDelete(req.params.id);
  res.json({ok:true});
});

/* ================= PEDIDOS ================= */
app.post("/pedido", async (req,res)=>{
  res.json(await Pedido.create(req.body));
});

app.get("/admin/pedidos", async (req,res)=>{
  res.json(await Pedido.find());
});

app.put("/admin/pedido/:id", async (req,res)=>{
  res.json(await Pedido.findByIdAndUpdate(
    req.params.id,
    {status:req.body.status},
    {new:true}
  ));
});

app.listen(3000,()=>{
  console.log("🚀 SHOPEE MAX RODANDO");
});