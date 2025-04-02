const express = require('express');
const {getReview, getchat,}=require("../controllers/ai.controller")
const router = express.Router();


router.post("/get-review", getReview )
router.post("/chat",getchat)

module.exports = router;    