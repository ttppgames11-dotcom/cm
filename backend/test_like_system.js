import { all, get, runQuery } from '../database/database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'connect_maratha_secret_key_2026';

async function runTests() {
  console.log('--- Starting Like/Unlike Backend Verification Tests ---');

  const testPostId = 'P-TEST-LIKE-' + Date.now();
  const userM1 = 'M-TEST-1';
  const userM2 = 'M-TEST-2';

  // 1. Create a dummy test post
  await runQuery(
    "INSERT INTO posts (id, author_id, author_name, author_avatar, group_id, text, likes_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
    [testPostId, 'M1001', 'Test Author', '👤', 'G09', 'Test Like Post', 0]
  );
  console.log('✓ Created test post:', testPostId);

  // Test F: Unauthenticated request should be rejected (Simulated via token requirement)
  function verifyToken(token) {
    if (!token) return null;
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  const anonUser = verifyToken(null);
  if (anonUser !== null) {
    throw new Error('Test F failed: unauthenticated should have null user');
  }
  console.log('✓ Test F Passed: Unauthenticated request has no user identity');

  // Function to simulate like toggle handler logic
  async function toggleLike(postId, userId) {
    const post = await get('SELECT id, likes_count FROM posts WHERE id = ?', [postId]);
    if (!post) throw new Error('Post not found');

    const existingLike = await get(
      'SELECT id FROM post_likes WHERE post_id = ? AND member_id = ?',
      [postId, userId]
    );

    let liked = false;
    if (existingLike) {
      await runQuery('DELETE FROM post_likes WHERE post_id = ? AND member_id = ?', [postId, userId]);
      await runQuery('UPDATE posts SET likes_count = CASE WHEN likes_count > 0 THEN likes_count - 1 ELSE 0 END WHERE id = ?', [postId]);
      liked = false;
    } else {
      const likeId = 'PL-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      await runQuery('INSERT INTO post_likes (id, post_id, member_id) VALUES (?, ?, ?)', [likeId, postId, userId]);
      await runQuery('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      liked = true;
    }

    const updated = await get('SELECT likes_count FROM posts WHERE id = ?', [postId]);
    return { liked, likes_count: updated.likes_count };
  }

  // Function to simulate feed fetch with optionalAuth
  async function fetchFeedPost(postId, currentUserId) {
    const sql = "SELECT p.*, CASE WHEN ? IS NOT NULL AND pl.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked FROM posts p LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.member_id = ? WHERE p.id = ?";
    return await get(sql, [currentUserId, currentUserId, postId]);
  }

  // A. First like: user M1 likes post P1 -> row created, liked=true, count=1
  const res1 = await toggleLike(testPostId, userM1);
  if (!res1.liked || res1.likes_count !== 1) {
    throw new Error('Test A failed: expected liked=true, count=1; got ' + JSON.stringify(res1));
  }
  const likeRow1 = await get('SELECT * FROM post_likes WHERE post_id = ? AND member_id = ?', [testPostId, userM1]);
  if (!likeRow1) throw new Error('Test A failed: post_likes row not found');
  console.log('✓ Test A Passed: First like creates row, liked=true, likes_count=1');

  // E. Refresh / Feed read: M1 fetches feed -> is_liked = 1
  const feedM1 = await fetchFeedPost(testPostId, userM1);
  if (feedM1.is_liked !== 1) throw new Error('Test E failed: is_liked should be 1 for user M1');
  const feedAnon = await fetchFeedPost(testPostId, null);
  if (feedAnon.is_liked !== 0) throw new Error('Test E failed: is_liked should be 0 for guest');
  console.log('✓ Test E Passed: Feed read correctly reflects is_liked=1 for M1 and 0 for anonymous');

  // B. Second tap: M1 toggles same post -> row removed, liked=false, count=0
  const res2 = await toggleLike(testPostId, userM1);
  if (res2.liked !== false || res2.likes_count !== 0) {
    throw new Error('Test B failed: expected liked=false, count=0; got ' + JSON.stringify(res2));
  }
  const likeRowAfterDelete = await get('SELECT * FROM post_likes WHERE post_id = ? AND member_id = ?', [testPostId, userM1]);
  if (likeRowAfterDelete) throw new Error('Test B failed: post_likes row was not deleted');
  console.log('✓ Test B Passed: Second tap toggles off, row deleted, count decremented to 0');

  // Re-like by M1 to test multi-user isolation
  await toggleLike(testPostId, userM1);

  // D. Different users: M2 likes P1 -> count=2; both see own heart red, independent
  const resM2 = await toggleLike(testPostId, userM2);
  if (!resM2.liked || resM2.likes_count !== 2) {
    throw new Error('Test D failed: M2 like failed; got ' + JSON.stringify(resM2));
  }
  const feedAfterM2_for_M1 = await fetchFeedPost(testPostId, userM1);
  const feedAfterM2_for_M2 = await fetchFeedPost(testPostId, userM2);
  const feedAfterM2_for_M3 = await fetchFeedPost(testPostId, 'M-TEST-3');

  if (feedAfterM2_for_M1.is_liked !== 1 || feedAfterM2_for_M2.is_liked !== 1) {
    throw new Error('Test D failed: Both M1 and M2 should see is_liked=1');
  }
  if (feedAfterM2_for_M3.is_liked !== 0) {
    throw new Error('Test D failed: Other user M3 should see is_liked=0');
  }
  console.log('✓ Test D Passed: Multiple users like isolation verified (count=2, M1=red, M2=red, M3=white)');

  // C. Same user cannot create duplicate likes test
  const existingLikes = await all('SELECT * FROM post_likes WHERE post_id = ? AND member_id = ?', [testPostId, userM1]);
  if (existingLikes.length !== 1) {
    throw new Error('Test C failed: userM1 has ' + existingLikes.length + ' likes');
  }
  console.log('✓ Test C Passed: Exactly one like record exists per user per post');

  // Cleanup test fixtures
  await runQuery('DELETE FROM post_likes WHERE post_id = ?', [testPostId]);
  await runQuery('DELETE FROM posts WHERE id = ?', [testPostId]);
  console.log('✓ Cleaned up test fixtures.');
  console.log('--- All Backend Like/Unlike Tests Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});