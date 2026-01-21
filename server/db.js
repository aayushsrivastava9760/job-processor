const Database = require('better-sqlite3');
const path = require('path')
const fs = require('fs')

function createDB(dbPath){
    const db = new Database(dbPath)

    const schema = fs.readFileSync(
        path.join(__dirname, "schema.sql"),
        "utf-8"
    )

    db.exec(schema)
    return db;
}

const db = new Database(path.join(__dirname, "queue.db"));

module.exports = { createDB }