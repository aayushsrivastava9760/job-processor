-- Jobs Table Creation
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    payload TEXT NOT NULL,

    status TEXT NOT NULL CHECK(
        status IN ('PENDING', 'RUNNING', 'DONE', 'FAILED', 'DLQ')
    ),

    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 5,

    leased_until INTEGER,
    worker_id TEXT,

    idempotency_key TEXT,

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Prevent duplicate job submissions per user
CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_idempotency
ON jobs(user_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_jobs_status
ON jobs(status);

CREATE INDEX IF NOT EXISTS idx_jobs_lease
ON jobs(leased_until);

CREATE INDEX IF NOT EXISTS idx_jobs_user
ON jobs(user_id);