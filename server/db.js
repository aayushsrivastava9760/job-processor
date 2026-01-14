const Database = require('better-sqlite3');
const path = require('path')
const fs = require('fs')

const db = new Database(path.join(__dirname, "queue.db"));

const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf-8"
)

db.exec(schema)

module.exports = db