const likeRepository = require('../repositories/like.repository');

class LikeService {
  async getLikedIds(userId) {
    const likedStr = await likeRepository.getLikedByUserId(userId);
    return likedStr ? likedStr.split(',').filter(id => id).map(Number) : [];
  }

  async toggleLike(userId, productId) {
    const likedStr = await likeRepository.getLikedByUserId(userId);
    let likedIds = likedStr ? likedStr.split(',').filter(id => id) : [];
    
    const pidStr = productId.toString();
    const index = likedIds.indexOf(pidStr);
    
    if (index > -1) {
      // Remove if already liked
      likedIds.splice(index, 1);
    } else {
      // Add if not liked
      likedIds.push(pidStr);
    }
    
    await likeRepository.upsert(userId, likedIds.join(','));
    return likedIds.map(Number);
  }
}

module.exports = new LikeService();
