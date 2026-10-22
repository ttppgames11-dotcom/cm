// Applies pending migrations:  npm run migrate --prefix database
// Production deploys run this explicitly (after taking a backup).
import { runMigrations, closeDatabase } from './database.js';

runMigrations()
  .then((applied) => console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database is up to date.'))
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(closeDatabase);
