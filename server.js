const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

console.log("MONGO:", process.env.MONGO_URL);

const app = express();
const PORT = process.env.PORT || 3000;

/* MIDDLEWARE */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* MONGODB */
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("🟢 MongoDB conectado"))
.catch(err=>console.log(err));

/* MODELS */
const Produto = mongoose.model("Produto", {
  nome: String,
  preco: Number,
  img: String
});

const Pedido = mongoose.model("Pedido", {
  produtos: Array,
  total: Number,
  status: { type: String, default: "novo" },
  data: { type: Date, default: Date.now }
});

/* ROTAS PRODUTOS */
app.get("/produtos", async (req,res)=>{
  res.json(await Produto.find());
});

app.post("/produtos", async (req,res)=>{
  const novo = new Produto(req.body);
  await novo.save();
  res.json(novo);
});

app.delete("/produtos/:id", async (req,res)=>{
  await Produto.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

/* ROTAS PEDIDOS */

/* CRIAR PEDIDO */
app.post("/pedido", async (req,res)=>{
  const pedido = new Pedido(req.body);
  await pedido.save();
  res.json(pedido);
});

/* LISTAR PEDIDOS */
app.get("/pedidos", async (req,res)=>{
  const pedidos = await Pedido.find().sort({data:-1});
  res.json(pedidos);
});

/* ATUALIZAR STATUS */
app.put("/pedido/:id", async (req,res)=>{
  await Pedido.findByIdAndUpdate(req.params.id, {status:req.body.status});
  res.sendStatus(200);
});

/* SERVIR SITE */
app.use((req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT, ()=>{
  console.log("🚀 rodando na porta " + PORT);
});