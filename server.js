const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 SERVIR ARQUIVOS HTML
app.use(express.static(__dirname + "/public"));

// 🔥 ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// 🔥 TESTE
app.get("/teste", (req, res) => {
  res.send("Servidor OK");
});

// 🔥 PRODUTOS FAKE (TEMPORÁRIO PRA TESTE)
let produtos = [
  { id: 1, nome: "Produto Teste", preco: 50, img: "https://via.placeholder.com/150" }
];

// LISTAR PRODUTOS
app.get("/produtos", (req, res) => {
  res.json(produtos);
});

// CRIAR PRODUTO
app.post("/admin/produto", (req, res) => {
  const novo = {
    id: Date.now(),
    nome: req.body.nome,
    preco: req.body.preco,
    img: req.body.img
  };

  produtos.push(novo);
  res.json(novo);
});

// PEDIDO
app.post("/pedido", (req, res) => {
  console.log("PEDIDO:", req.body);
  res.json({ mensagem: "Pedido recebido!" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Servidor rodando");
});