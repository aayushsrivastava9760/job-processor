const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')
const { SCHEMA_NAME } = require('./constants')

function createDB(dbPath){
    const db = new Database(dbPath)

    const schema = fs.readFileSync(
        path.join(__dirname, SCHEMA_NAME),
        "utf-8"
    )

    db.exec(schema)
    return db;
}

module.exports = { createDB }