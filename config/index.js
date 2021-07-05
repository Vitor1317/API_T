module.exports = {
    secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "DFN4UI3TH04859789F8902H4GUHUIERHGJKWERNBUG432H09GHRU",
    api: process.env.NODE_ENV === "production" ? "https://api.loja-test.ampliee.com" : "http://localhost:3000",
    loja: process.env.NODE_ENV === "production" ? "https://loja-test.ampliee.com" : "http://localhost:8000",
};