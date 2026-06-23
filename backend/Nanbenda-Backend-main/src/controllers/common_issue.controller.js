const commonIssueService = require('../services/common_issue.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllCommonIssues = asyncHandler(async (req, res) => {
  const commonIssues = await commonIssueService.getAllCommonIssues();
  res.json(new ApiResponse(200, commonIssues, "Common issues fetched successfully"));
});

const getCommonIssueById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const commonIssue = await commonIssueService.getCommonIssueById(id);
  if (!commonIssue) {
    return res.status(404).json(new ApiResponse(404, null, "Common issue not found"));
  }
  res.json(new ApiResponse(200, commonIssue, "Common issue fetched successfully"));
});

const createCommonIssue = asyncHandler(async (req, res) => {
  const issueData = { ...req.body };
  if (req.file) {
    issueData.image_url = `/uploads/common_issues/${req.file.filename}`;
  }
  const commonIssue = await commonIssueService.createCommonIssue(issueData);
  res.status(201).json(new ApiResponse(201, commonIssue, "Common issue created successfully"));
});

const updateCommonIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const issueData = { ...req.body };
  if (req.file) {
    issueData.image_url = `/uploads/common_issues/${req.file.filename}`;
  }
  const success = await commonIssueService.updateCommonIssue(id, issueData);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Common issue not found"));
  }
  res.json(new ApiResponse(200, { id, ...issueData }, "Common issue updated successfully"));
});

const deleteCommonIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await commonIssueService.deleteCommonIssue(id);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Common issue not found"));
  }
  res.json(new ApiResponse(200, null, "Common issue deleted successfully"));
});

module.exports = {
  getAllCommonIssues,
  getCommonIssueById,
  createCommonIssue,
  updateCommonIssue,
  deleteCommonIssue
};
