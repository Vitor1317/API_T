module.exports = {
    mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
    sandbox: process.env.NODE_ENV === "production" ? false : true,
    sandbox_email: process.env.NODE_ENV === "production" ? null : "c{identificador-único}@sandbox.pagseguro.com.br ",
    email: "vitoralvesmoraes111@gmail.com",
    token: "",
    notificationURL: "https://api.loja-test.ampliee.com/v1/api/pagamentos/notificacao" 
};
