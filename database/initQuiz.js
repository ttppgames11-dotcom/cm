import { getDatabase, runQuery, saveDatabase } from './database.js';

export async function initQuizSchema() {
  await getDatabase();
  await runQuery(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      question_id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      question_type TEXT DEFAULT 'mcq',
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      historical_period TEXT,
      person TEXT,
      fort TEXT,
      source TEXT,
      year INTEGER
    )
  `);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_quiz_category ON quiz_questions(category)`);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_quiz_difficulty ON quiz_questions(difficulty)`);
  await saveDatabase();
  console.log('✅ quiz_questions table initialized successfully.');
}
