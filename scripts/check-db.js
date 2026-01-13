const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB = path.join(__dirname, '..', 'data.sqlite');
const db = new sqlite3.Database(DB, (err) => {
  if (err) {
    console.error('Cannot open database:', err.message);
    process.exit(1);
  }
});

function q(sql) {
  return new Promise((resolve, reject) => db.all(sql, (err, rows) => err ? reject(err) : resolve(rows)));
}

(async () => {
  try {
    console.log('Database file:', DB);
    const users = await q('SELECT id, username FROM users');
    console.log('\nUsers:');
    users.forEach(u => console.log(`${u.id}	${u.username}`));

    const invoices = await q('SELECT id, user_id, item_name, secret_note FROM invoices');
    console.log('\nInvoices:');
    invoices.forEach(i => console.log(`${i.id}	user:${i.user_id}	${i.item_name}	${i.secret_note}`));

    process.exit(0);
  } catch (err) {
    console.error('Query error:', err.message);
    process.exit(2);
  } finally {
    db.close();
  }
})();
