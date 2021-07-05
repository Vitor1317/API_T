const router = require("express").Router();

router.use("/lojas", require("./lojas"));

router.use("/usuarios", require("./usuario"));
router.use("/clientes", require("./clientes"));

router.use("/categorias", require("./categoria"));
router.use("/produtos", require("./produtos"));
router.use("/avaliacoes", require("./avaliacao"));
router.use("/variacoes", require("./variacoes"));

router.use("/pedidos", require("./pedidos"));
router.use("/entregas", require("./entrega"));
router.use("/pagamentos", require("./pagamentos"));


module.exports = router;