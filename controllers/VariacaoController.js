const mongoose = require("mongoose");

const Variacao = mongoose.model("Variacao");
const Produto = mongoose.model("Produto");

class VariacaoController{
//GET / INDEX
    async index(req, res, next){
        const {loja, produto} = req.query;

        try {
          const variacoes = await Variacao.find({loja, produto});
          return res.send({variacoes});  
        } catch (e) {
            next(e);
        };
    };

//GET /:ID SHOW
    async show(req, res, next){
        const {loja, produto} = req.query;
        const {id: _id} = req.params;

        try {
          const variacao = await Variacao.findOne({loja, produto, _id});
          return res.send({variacao});  
        } catch (e) {
            next(e);
        };
    };

//POST / STORE
    async store(req, res, next){
        const {codigo, nome, preco, promocao, entrega, quantidade} = req.body;
        const {loja, produto} = req.query;

        try {
          const variacao = new Variacao({
            codigo, nome, preco, promocao, entrega, quantidade, loja, produto
          });
          
          const _produto = await Produto.findById(produto);
          if(!_produto) return res.status(400).send({error: "Produto não encontrado."});

          _produto.variacoes.push(variacao._id);
          await _produto.save();
          await variacao.save();

          return res.send({variacao});
        } catch (e) {
            next(e);
        };
    };

//PUT /:ID UPDATE
    async update(req, res, next){
        const {codigo, fotos, nome, preco, promocao, entrega, quantidade} = req.body;
        const {loja, produto} = req.query;
        const {id: _id} = req.params;

        try {
          const variacao = await Variacao.findOne({loja, produto, _id});
          if(!variacao) return res.status(400).send({error: "Variacao Não encontrada."});
          
          if(codigo) variacao.codigo = codigo;
          if(nome) variacao.nome = nome;
          if(preco) variacao.preco = preco;
          if(promocao) variacao.promocao = promocao;
          if(entrega) variacao.entrega = entrega;
          if(quantidade) variacao.quantidade = quantidade;
          if(fotos) variacao.fotos = fotos;
          await variacao.save();
          return res.send({variacao});
        } catch (e) {
            next(e);
        };
    };

//PUT /IMAGES/:ID UPDATEIMAGES
    async updateImages(req, res, next){
        const {loja, produto} = req.query;
        const {id: _id} = req.params;

        try {
            const variacao = await Variacao.findOne({loja, produto, _id});
            if(!variacao) return res.status(400).send({error: "Variacao Não encontrada."});

            const novasImagens = req.files.map((item) => item.filename);
            variacao.fotos = variacao.fotos.filter(item => item).concat(novasImagens);

            await variacao.save();
            return res.send({variacao});

        } catch (e) {
            next(e);
        };
    };

//DELETE /:ID   REMOVE
    async remove(req, res, next){
        const {loja, produto} = req.query;
        const {id: _id} = req.params;

        try {
            const variacao = await Variacao.findOne({loja, produto, _id});
            if(!variacao) return res.status(400).send({error: "Variacao Não encontrada."});

            const _produto = await Produto.findById(variacao.produto);
            _produto.variacoes = _produto.variacoes.filter(item=>item.toString() !==variacao._id.toString());

            await _produto.save();

            await variacao.remove();
            return res.send({deletado: true});

        } catch (e) {
            next(e);
        };
    };


};

module.exports = VariacaoController;
