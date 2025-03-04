const express = require('express');
const {execute}=require("../controllers/codecontroller")
const executerouter = express.Router();

executerouter.post("/execute",execute)


module.exports = executerouter;