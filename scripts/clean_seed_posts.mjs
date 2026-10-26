import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

async function clean() {
  const SQL = await initSqlJs();

  const seedIds = [
    'POST-001', 'POST-002', 'POST-003', 'POST-004', 'POST-005', 'POST-006', 'POST-007',
    'P01', 'P02', 'P03', 'P-01', 'P-02', 'P-03',
    'POST-101', 'POST-102', 'POST-103', 'POST-313380', 'POST-752272', 'POST-076816'
  ];

  const dbPaths = [
    path.resolve('database/connect_maratha.db'),
    path.resolve('server/db/connect_maratha.db')
  ];

  for (const dbPath of dbPaths) {
    if (fs.existsSync(dbPath)) {
      console.log('Cleaning SQLite DB:', dbPath);
      const buf = fs.readFileSync(dbPath);
      const db = new SQL.Database(buf);

      for (const id of seedIds) {
        db.run('DELETE FROM post_comments WHERE post_id = ?', [id]);
        db.run('DELETE FROM post_likes WHERE post_id = ?', [id]);
        db.run('DELETE FROM posts WHERE id = ?', [id]);
      }

      db.run("DELETE FROM post_comments WHERE post_id LIKE 'POST-00%'");
      db.run("DELETE FROM post_likes WHERE post_id LIKE 'POST-00%'");
      db.run("DELETE FROM posts WHERE id LIKE 'POST-00%'");

      const remainingPosts = db.exec('SELECT id, author_name, text FROM posts');
      console.log('Remaining posts in', path.basename(dbPath), ':', remainingPosts[0]?.values?.length || 0);

      const data = db.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
      console.log('Saved SQLite DB:', dbPath);
    }
  }

  // Clean backend/db.json
  const dbJsonPath = path.resolve('backend/db.json');
  if (fs.existsSync(dbJsonPath)) {
    const raw = fs.readFileSync(dbJsonPath, 'utf8');
    const jsonDb = JSON.parse(raw);
    if (Array.isArray(jsonDb.posts)) {
      jsonDb.posts = jsonDb.posts.filter(p => !seedIds.includes(p.id) && !p.id.startsWith('POST-00'));
    }
    if (Array.isArray(jsonDb.postComments)) {
      jsonDb.postComments = jsonDb.postComments.filter(c => !seedIds.includes(c.post_id) && !seedIds.includes(c.postId));
    }
    fs.writeFileSync(dbJsonPath, JSON.stringify(jsonDb, null, 2), 'utf8');
    console.log('Cleaned backend/db.json, remaining posts:', jsonDb.posts.length);
  }
}

clean().catch(console.error);
