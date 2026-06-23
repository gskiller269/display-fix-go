const { db } = require('../config');

class LikeRepository {
  async getLikedByUserId(userId) {
    const [rows] = await db.execute('SELECT liked FROM likes WHERE user_id = ?', [userId]);
    return rows[0] ? rows[0].liked : '';
  }

  async upsert(userId, likedIds) {
    const [rows] = await db.execute('SELECT user_id FROM likes WHERE user_id = ?', [userId]);
    if (rows.length > 0) {
      await db.execute('UPDATE likes SET liked = ? WHERE user_id = ?', [likedIds, userId]);
    } else {
      await db.execute('INSERT INTO likes (user_id, liked) VALUES (?, ?)', [userId, likedIds]);
    }
  }
}

module.exports = new LikeRepository();
