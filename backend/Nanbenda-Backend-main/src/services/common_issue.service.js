const commonIssueRepository = require('../repositories/common_issue.repository');

class CommonIssueService {
  async getAllCommonIssues() {
    return await commonIssueRepository.getAll();
  }

  async getCommonIssueById(id) {
    return await commonIssueRepository.getById(id);
  }

  async createCommonIssue(issueData) {
    return await commonIssueRepository.create(issueData);
  }

  async updateCommonIssue(id, issueData) {
    return await commonIssueRepository.update(id, issueData);
  }

  async deleteCommonIssue(id) {
    return await commonIssueRepository.delete(id);
  }
}

module.exports = new CommonIssueService();
