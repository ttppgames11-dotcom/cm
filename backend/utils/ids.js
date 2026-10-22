import { get } from '../../database/database.js';

/**
 * A random id (e.g. "B42") that no row in `table` uses yet.
 * The old code picked one of only 90 numbers without looking, so creating a business,
 * job or event failed at random once a few existed ("duplicate key" -> 500).
 * `make` builds one candidate; after 200 tries the current time is used instead.
 */
export async function uniqueRandomId(table, make) {
  for (let i = 0; i < 200; i++) {
    const id = make();
    const taken = await get(`SELECT id FROM ${table} WHERE id = ?`, [id]);
    if (!taken) return id;
  }
  const prefix = String(make()).replace(/\d+$/, '');
  return prefix + Date.now();
}
