const express = require('express');

const geminiController = require('../controllers/geminiController');

const geminiRouter = express.Router();

geminiRouter.route('/gemini').post(geminiController.geminiPrompt);

module.exports = geminiRouter;
