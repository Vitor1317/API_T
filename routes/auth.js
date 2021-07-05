const jwt = require("express-jwt");
const secret = require("../config").secret;

function getFromHeader(req){
    if(!req.headers.authorization) return null;
    const token = req.headers.authorization.split(" ");
    if(token[0] !== "Ecommerce") return null;
    return token[1];
};


const auth = {
    required: jwt({
        secret,
        userProperty: "payload",
        getToken: getFromHeader
    }),
    
    optional: jwt({
        secret,
        userProperty: "payload",
        credentialsRequired: false,
        getToken: getFromHeader
    })
};

module.exports = auth;
