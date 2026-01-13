const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'data.sqlite');

const db = new sqlite3.Database(DB_PATH);

function init() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        item_name TEXT,
        price INTEGER,
        secret_note TEXT
      )
    `);

    // Seed users
    db.get(`SELECT COUNT(*) as cnt FROM users`, (err, row) => {
      if (err) return console.error(err);
      if (row.cnt === 0) {
        const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        insertUser.run('admin', 'adminpass'); // admin user
        insertUser.run('user', 'password'); // normal player
        insertUser.finalize();
      }
    });

    // Seed invoices
    db.get(`SELECT COUNT(*) as cnt FROM invoices`, (err, row) => {
      if (err) return console.error(err);
      if (row.cnt === 0) {
        const insertInv = db.prepare('INSERT INTO invoices (id, user_id, item_name, price, secret_note) VALUES (?, ?, ?, ?, ?)');
        insertInv.run(1, 1, 'Platinum Subscription', 999, 'FLAG{hidden_invoice_admin_only}'); // admin's flag
        insertInv.run(15, 2, 'USB Cable', 5, 'Thanks for buying!'); // player's invoice
        insertInv.run(16, 2, 'FreshStore Shirt', 20, 'Enjoy your new shirt!');
        insertInv.finalize();
      }
    });
  });
}

function getUserByUsername(username, cb) {
  db.get('SELECT * FROM users WHERE username = ?', [username], cb);
}

function getInvoicesByUserId(userId, cb) {
  db.all('SELECT id, item_name, price FROM invoices WHERE user_id = ?', [userId], cb);
}

function getInvoiceById(id, cb) {
  db.get('SELECT * FROM invoices WHERE id = ?', [id], cb);
}

init();

module.exports = {
  getUserByUsername,
  getInvoicesByUserId,
  getInvoiceById,
  db,
};