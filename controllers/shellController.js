const { exec } = require('child_process');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError');

//const allowedCommands = ['ls', 'pwd', 'whoami'];
exports.shellPrompt = catchAsync(async (req, res, next) => {
  const { command } = req.body;

  if (!command) {
    return next(new AppError('Prompt is required', 400));
  }

  //   const cmd = command.split(' ');

  //   if (!allowedCommands.includes(cmd)) {
  //     return next(new AppError('Prompt not alowed', 400));
  //   }

  // Execute the shell command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return next(new AppError('Error: Wrong command', 400));
    }

    if (stderr) {
      return next(new AppError('Error: stderr', 400));
    }

    res.json({ output: stdout });
  });
});
