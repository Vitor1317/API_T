
const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuario");
const enviarEmailRecovery = require("../helpers/email-recovery");

class UsuarioController{

//Get /    
    index(req, res, next){
        Usuario.findById(req.payload.id).then(usuario=>{
            if(!usuario) return res.status(401).json({errors: "Usuário não Registrado"});
            return res.json({usuario: usuario.enviarAuthJSON()});
        }).catch(next);

    }

//Get /:id
    show(req, res, next){
        Usuario.findById(req.params.id).populate({path: "loja"})
        .then(usuario =>{
            if(!usuario) return res.status(401).json({errors: "Usuário não Registrado"});
            return res.json({
                usuario:{
                    nome: usuario.nome,
                    email: usuario.email,
                    permissao: usuario.permissao,
                    loja: usuario.loja
                }
            });
        }).catch(next);
    }    

//Post /registrar
    store(req, res, next){
        const {nome, email, password, loja} = req.body;

        if(!nome ||!email ||!password ||!loja) return res.status(422).json({errors: "Preencha todos os campos de cadastro"});

        const usuario = new Usuario({nome, email, loja});
        usuario.setSenha(password);

        usuario.save()
        .then(() => res.json({usuario: usuario.enviarAuthJSON()}))
        .catch(next);
    };

//Put
    update(req, res, next){
        const {nome, email, password} = req.body;
        Usuario.findById(req.payload.id).then((usuario) =>{
            if(!usuario) return res.status(401).json({errors: "Usuário não Registrado"});
            if(typeof nome !== "undefined") usuario.nome = nome;
            if(typeof email !== "undefined") usuario.email = email;
            if(typeof password !== "undefined") usuario.setSenha(password);

            return usuario.save().then(() =>{
                return res.json({usuario: usuario.enviarAuthJSON()});
            });
        }).catch(next) 
    };  

//Delete
    remove(req, res, next){
        Usuario.findById(req.payload.id).then(usuario =>{
            if(!usuario) return res.status(401).json({errors: "Usuário não Registrado"});
            return usuario.remove().then(()=>{
                return usuario.json({deletado: true});
            }).catch(next);
        }).catch(next);
    }  
    
//Post /login
    login(req, res, next){
        const {email, password} = req.body;
       
        Usuario.findOne({email}).then(usuario =>{
            if(!usuario) return res.status(401).json({errors: "Usuário não Registrado"});
            if(!usuario.validarSenha(password)) return res.status(401).json({errors: "Senha Inválida"});
            return res.json({usuario: usuario.enviarAuthJSON()});
        }).catch(next);

    }

//Recovery

//GET / recuperar-senha
    showRecovery(req, res, next){
        res.render("recovery", {error: null, sucess: null });
    }

//Post / recuperar-senha
    createRecovery(req, res, next){
        const {email} = req.body;
        if(!email) return res.render("recovery", {error: "Preencha com o seu email", sucess: null});

        Usuario.findOne({email}).then(usuario =>{
            if(!usuario) return res.render("recovery", {error:"Não existe usuário com este email", sucess:null});
            const recoveryData = usuario.criarTokenRecuperacaoSenha();
            return usuario.save().then(()=>{
                enviarEmailRecovery({usuario, recovery: recoveryData}, (error= null, sucess = null)=>{
                    return res.render("recovery", {error, sucess});
                });
            }).catch(next)
        }).catch(next);
    }    

//Get /senha-recuperada
    showCompleteRecovery(req, res, next){
        if(!req.query.token) return res.render("recovery", {error:"Token não identificado", sucess: null});
        Usuario.findOne({"recovery.token": req.query.token}).then(usuario =>{
            if(!usuario) return res.render("recovery", {error:"Não existe usuário com este token", sucess:null});
            if(new Date(usuario.recovery.date) < new Date()) return res.render("recovery", {error: "Token inspirado. Tente novamente", sucess:null});
            res.render("recovery/store", {error: null, sucess:null, token: req.query.token});
        }).catch(next);

    }

//Post /senha-recuperada
    completeRecovery(req, res, next){
        const {token, password} = req.body;
        if(!token || !password) return res.render("recovery/store", {error: "Preencha novamente com sua nova senha", sucess:null, token:token});
        Usuario.findOne({"recovery.token": token}).then(usuario=>{
            if(!usuario) return res.render("recovery", {error: "Usuário Não identificado", sucess: null});

            usuario.finalizarTokenRecuperacaoSenha();
            usuario.setSenha(password);
            return usuario.save().then(()=>{
                return res.render("recovery/store", {error: null, sucess: "Senha alterada com sucesso, faça login novamente", token: null});
            }).catch(next);

        }).catch(next);
    }    

};

module.exports = UsuarioController;
