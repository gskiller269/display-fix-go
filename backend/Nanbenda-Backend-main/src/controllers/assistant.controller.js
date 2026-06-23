const AssistantService = require('../services/assistant.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const chat = asyncHandler(async (req, res) => {
  const { query, device_ids } = req.body;
  const resultText = await AssistantService.chat(req.user.id, query, device_ids);
  return res.status(200).json(new ApiResponse(200, { result: resultText }, 'AI response fetched successfully'));
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await AssistantService.getHistory(req.user.id);
  return res.status(200).json(new ApiResponse(200, history, 'History fetched successfully'));
});

const clearHistory = asyncHandler(async (req, res) => {
  await AssistantService.clearHistory(req.user.id);
  return res.status(200).json(new ApiResponse(200, null, 'History cleared successfully'));
});

module.exports = {
  chat,
  getHistory,
  clearHistory
};
