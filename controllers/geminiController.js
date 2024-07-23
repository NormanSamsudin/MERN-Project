const { GoogleGenerativeAI } = require('@google/generative-ai');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

exports.geminiPrompt = catchAsync(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return next(new AppError('Prompt is required', 400));
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  res.json({ text });
});

exports.geminiUpload = catchAsync(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return next(new AppError('Prompt is required', 400));
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  res.json({ text });
});
