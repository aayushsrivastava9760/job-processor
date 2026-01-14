const express = require('express')
const cors = require('cors')

const authMiddleWare = require('./auth')

const {v4: uuidv4} = require("uuid")
const db = require("./db")
const {
    MAX_RUNNING_JOBS,
    MAX_SUBMISSION_PER_MINUTE
} = require('./constants')

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

/*
* Health Check
*/
app.get('/health', (req, res)=>{
    res.json({status: "ok"})
})

app.get("/debug/db", (req, res) => {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
  res.json(tables);
});

app.use(authMiddleWare)

/**
 * Get jobs (for dashboard)
 */
app.get("/jobs", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

/**
 * Creating a new job
 */
app.post("/jobs", (req, res) => {
    const user = req.user;
    const payload = req.body.payload;
    const idempotencyKey = req.headers["idempotency-key"] || null;
    const now = Date.now();

    if (!payload) {
        return res.status(400).json({ error: "Missing payload" });
    }

    /**
     * Idempotency check
     */
    if(idempotencyKey){
        const existingJob = db.prepare(
            `SELECT id, status FROM jobs
            WHERE user_id = ? AND idempotency_key = ?`
        ).get(user.id, idempotencyKey)

        if(existingJob){
            return res.json({
                job_id: existingJob.id,
                status: existingJob.status,
                idempotent: true
            })
        }
    }

    /**
     * Concurrent running jobs check
     */
    const runningJobsCount = db.prepare(
        `SELECT COUNT(*) as count FROM jobs
        WHERE user_id = ? AND status = 'RUNNING'`
    ).get(user.id).count 

    if(runningJobsCount >= MAX_RUNNING_JOBS){
        return res.status(429).json({
            error: "Max concurrent running jobs exceeded"
        })
    }


    /**
     * Submission Rate Check for last 1 minute ( 60 seconds )
     */
    const oneMinuteAgo = now - 60*1000;

    const recentJobsSubmissionCount = db.prepare(
        `SELECT COUNT(*) as count from jobs
        WHERE user_id = ? AND created_at >= ?`
    ).get(user.id, oneMinuteAgo).count

    if(recentJobsSubmissionCount >= MAX_SUBMISSION_PER_MINUTE){
        return res.status(429).json({
            error: "Job submission rate limit exceeded"
        })
    }

    /**
     * Inserting new job
     */
    const jobId = uuidv4()

    db.prepare(
        `INSERT INTO jobs (
            id,
            user_id,
            payload,
            status,
            retry_count,
            max_retries,
            leased_until,
            worker_id,
            idempotency_key,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, 'PENDING', 0, 3, NULL, NULL, ?, ?, ?)`
    ).run(
        jobId,
        user.id,
        JSON.stringify(payload),
        idempotencyKey,
        now,
        now
    )

    console.log(`[JOB_SUBMITTED] job_id=${jobId} user=${user.id}`)

    res.status(201).json({
        job_id: jobId,
        status: 'PENDING'
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})