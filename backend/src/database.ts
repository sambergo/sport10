// src/database.ts
import { Database as SqliteDatabase } from 'sqlite3';
import { open } from 'sqlite';
import { dummyQuestions } from './data/questions';
import { QuestionTemplate } from '@/common/types/game';
import { dbPath } from './config';

// Type for the SQLite database connection (using promise-based sqlite)
let db: Awaited<ReturnType<typeof open>>;

// Initialize the database
export async function initDatabase() {
  db = await open({
    filename: dbPath,
    driver: SqliteDatabase,
  });

  // Create schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `);

  // Seed if empty
  const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
  if (categoryCount.count === 0) {
    // await seedDatabase();
  }

  console.log('Database initialized');
}

// Seed the database with dummy questions
async function seedDatabase() {
  for (const q of dummyQuestions) {
    // Insert or get category
    await db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', q.category);
    const category = await db.get('SELECT id FROM categories WHERE name = ?', q.category);

    // Insert question
    const questionResult = await db.run(
      'INSERT INTO questions (text, category_id, difficulty) VALUES (?, ?, ?)',
      q.question,
      category.id,
      q.difficulty
    );

    // Insert answers
    for (const opt of q.options) {
      await db.run(
        'INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)',
        questionResult.lastID,
        opt.text,
        opt.isCorrect  // Already boolean, SQLite will convert to 0/1
      );
    }
  }
  console.log('Database seeded with dummy questions');
}

// Fetch a random question from the DB
export async function getRandomQuestion(): Promise<QuestionTemplate | null> {
  const questionRow = await db.get(`
    SELECT q.id, q.text, q.difficulty, c.name as category
    FROM questions q
    JOIN categories c ON q.category_id = c.id
    ORDER BY RANDOM() LIMIT 1
  `);

  if (!questionRow) return null;

  const answerRows = await db.all(`
    SELECT text, is_correct as isCorrect
    FROM answers
    WHERE question_id = ?
  `, questionRow.id);

  // Explicitly convert isCorrect from number (0/1) to boolean
  const options = answerRows.map(row => ({
    text: row.text,
    isCorrect: !!row.isCorrect,  // !! converts 1 to true, 0 to false
  }));

  return {
    id: questionRow.id,
    question: questionRow.text,
    options,
    category: questionRow.category,
    difficulty: questionRow.difficulty,
  };
}
