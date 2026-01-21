module.exports = {
    PORT: 4000,

    USERS: {
        "user-1-key" : {id: "user-1"},
        "user-2-key" : {id: "user-2"}
    },
    MAX_RUNNING_JOBS: 5,
    MAX_SUBMISSION_PER_MINUTE: 10,

    DB_NAME: "queue.db",
    SCHEMA_NAME: "schema.sql",
    
    LEASE_MS: 30000,
    POLL_INTERVAL_MS: 2000
}