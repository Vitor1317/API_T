const pagseguroConfig = require("../../config/pagseguro");
const Pagseguro = require("../../helpers/pagseguro");

const _criarPagamentoBoleto = (senderHash, {cliente, carrinho, entrega, pagamento}) =>{
    return new Promise((resolver, rejeitar) =>{
        const pag = new Pagseguro(pagseguroConfig);

        pag.setSender({
            name: cliente.nome,
            email: cliente.usuario.email,
            cpf_cnpj: cliente.cpf.replace(/[-\.]/g, ""),
            area_code: cliente.telefones[0].slice(0,2),
            phone: cliente.telefones[0].slice(2).trim().split(" ").join(""),
            birth_date: cliente.dataDeNascimento // formato DD/MM/YYYY
        });

        pag.setShipping({
            street: entrega.endereco.local,
            number: entrega.endereco.numero,
            district: entrega.endereco.bairro,
            city: entrega.endereco.cidade,
            state: entrega.endereco.estado,
            postal_code: entrega.endereco.CEP.replace(/-/g,""),
            same_for_billing: pagamento.enderecoEntregaIgualCobranca // true ou false
        });

        pag.setBilling({
            street: pagamento.endereco.local,
            number: pagamento.endereco.numero,
            district: pagamento.endereco.bairro,
            city: pagamento.endereco.cidade,
            state: pagamento.endereco.estado,
            postal_code: pagamento.endereco.CEP.replace(/-/g,"")
        });

        carrinho.forEach(item => {
            pag.addItem({
                qtde: item.quantidade,
                value: item.precoUnitario,
                description: `${item.produto.titulo} - ${item.variacao.nome}`
            });
        });
        pag.addItem({
            qtde: 1,
            value: entrega.custo,
            description: `Custo de Entrega - Correios`
        });

        pag.sendTransaction({
            method: "boleto",
            value: pagamento.valor,
            installments: 1,
            hash: senderHash
        }, (err, data) => (err) ? rejeitar(err) : resolver(data) );
    });
};

const _criarPagamentoCartao = (senderHash, {cliente, carrinho, entrega, pagamento}) =>{
    return new Promise((resolver, rejeitar) => {

        const pag = new PagSeguro(pagSeguroConfig);

        pag.setSender({
            name: cliente.nome,
            email: cliente.usuario.email,
            cpf_cnpj: cliente.cpf.replace(/[-\.]/g, ""),
            area_code: cliente.telefones[0].slice(0,2),
            phone: cliente.telefones[0].slice(2).trim().split(" ").join(""),
            birth_date: cliente.dataDeNascimento // formato DD/MM/YYYY
        });

        pag.setShipping({
            street: entrega.endereco.local,
            number: entrega.endereco.numero,
            district: entrega.endereco.bairro,
            city: entrega.endereco.cidade,
            state: entrega.endereco.estado,
            postal_code: entrega.endereco.CEP.replace(/-/g,""),
            same_for_billing: pagamento.enderecoEntregaIgualCobranca // true ou false
        });

        pag.setBilling({
            street: pagamento.endereco.local,
            number: pagamento.endereco.numero,
            district: pagamento.endereco.bairro,
            city: pagamento.endereco.cidade,
            state: pagamento.endereco.estado,
            postal_code: pagamento.endereco.CEP.replace(/-/g,"")
        });

        carrinho.forEach(item => {
            pag.addItem({
                qtde: item.quantidade,
                value: item.precoUnitario,
                description: `${item.produto.titulo} - ${item.variacao.nome}`
            });
        });
        pag.addItem({
            qtde: 1,
            value: entrega.custo,
            description: `Custo de Entrega - Correios`
        });

        pag.setCreditCardHolder({
            name: pagamento.cartao.nomeCompleto || cliente.nome,
            area_code: pagamento.cartao.codigoArea.trim() || cliente.telefones[0].slice(0,2),
            phone: (pagamento.cartao.telefone.trim() || cliente.telefones[0].slice(2)).split(" ").join(""),
            birth_date: pagamento.cartao.dataDeNascimento || cliente.dataDeNascimento,
            cpf_cnpj: ( pagamento.cartao.cpf || cliente.cpf ).replace(/[-\.]/g, "")
        });

        pag.sendTransaction({
            method: "creditCard",
            value: pagamento.valor % 2 !== 0 && pagamento.parcelas !== 1 ? pagamento.valor + 0.01 : pagamento.valor,
            installments: pagamento.parcelas,
            hash: senderHash,
            credit_card_token: pagamento.cartao.credit_card_token
        }, (err, data) => (err) ? rejeitar(err) : resolver(data) );

    });
};

const criarPagamento = async (senderHash, data) =>{
    try {
        if(data.pagamento.forma === "boleto") return await _criarPagamentoBoleto(senderHash, data);
        else if(data.pagamento.forma === "creditCard") return await _criarPagamentoCartao(senderHash, data);
        else return {errorMesage: "Forma de pagamento não encontrada."};
    } catch (e){
        console.log(e);
        return {errorMesage: "Ocorreu um erro", errors: e};
    }
};

const getSessionId = () =>{
    return new Promise((resolve, reject) =>{
        const pag = new Pagseguro(pagseguroConfig);
        pag.sessionId((err, session_id) => (err) ? reject(err) : resolve(session_id));
    });
};

const getTransectionStatus = (codigo) =>{
    return new Promise((resolve, reject) =>{
        const pag = new Pagseguro(pagseguroConfig);
        pag.transactionStatus(codigo, (err, result) => (err) ? reject(err) : resolve(result));
    });
};

const getNotification = (codigo) =>{
    return new Promise((resolve, reject) =>{
        const pag = new Pagseguro(pagseguroConfig);
        pag.getNotification(codigo, (err, result) => (err) ? reject(err) : resolve(result));
    });
};

module.exports = {
    criarPagamento,
    getSessionId,
    getTransectionStatus,
    getNotification
};