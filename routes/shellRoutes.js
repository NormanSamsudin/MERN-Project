const express = require('express');

const shellController = require('../controllers/shellController');

const shellRouter = express.Router();

shellRouter.route('/exec').post(shellController.shellPrompt);

module.exports = shellRouter;
