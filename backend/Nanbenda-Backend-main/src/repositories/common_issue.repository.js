const { db } = require('../config');

class CommonIssueRepository {
  async getAll() {
    const [rows] = await db.execute('SELECT * FROM common_issues ORDER BY name ASC');
    return rows;
  }

  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM common_issues WHERE id = ?', [id]);
    return rows[0];
  }

  async create(issueData) {
    const { name, description, image_url } = issueData;
    const [result] = await db.execute('INSERT INTO common_issues (name, description, image_url) VALUES (?, ?, ?)', [name, description, image_url]);
    return { id: result.insertId, ...issueData };
  }

  async update(id, issueData) {
    const { name, description, image_url } = issueData;
    const [result] = await db.execute('UPDATE common_issues SET name = ?, description = ?, image_url = ? WHERE id = ?', [name, description, image_url, id]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM common_issues WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CommonIssueRepository();
