const express = require('express')
const cors = require('cors')
const path = require('path')
const {v4: uuidv4} = require("uuid")

const authMiddleWare = require('./auth')
const { createDB } = require("./db")
const {
    MAX_RUNNING_JOBS,
    MAX_SUBMISSION_PER_MINUTE,
    PORT,
    DB_NAME
} = require('./constants')

const app = express()
const db = createDB(path.join(__dirname, DB_NAME))

app.use(cors())
app.use(express.json())

/*
* Health Check
*/
app.get('/health', (req, res)=>{
    res.json({status: "ok"})
})

app.use(authMiddleWare)

/**
 * Get jobs (for dashboard)
 */
app.get("/jobs", (req, res) => {
    const user = req.user
    const {status} = req.query
    let {limit} = req.query

    limit = parseInt(limit, 10);
    if(isNaN(limit) || limit <= 0){
        limit = 50
    }

    limit = Math.min(limit, 100);

    let query = `
    SELECT 
        id, 
        status, 
        retry_count,
        worker_id,
        created_at,
        updated_at
    FROM jobs
    WHERE user_id = ?
    `

    const params = [user.id]

    if(status){
        query += `AND status = ?`
        params.push(status)
    }

    query += `ORDER BY created_at DESC LIMIT ?`
    params.push(limit)

    const jobs = db.prepare(query).all(...params)

    res.json({jobs})
});

/**
 * Get job details by ID
 */
app.get("/jobs/:jobId", (req, res) => {
    const { jobId } = req.params;
    const user = req.user

    const job = db.prepare(
        `
        SELECT
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
        FROM jobs
        WHERE id = ?
        `
    ).get(jobId);

    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }

    console.log(`[JOB_FETCHED] job_id=${jobId} user=${user.id}`);

    res.json({
        id: job.id,
        status: job.status,
        retry_count: job.retry_count,
        max_retries: job.max_retries,
        worker_id: job.worker_id,
        leased_until: job.leased_until,
        idempotency_key: job.idempotency_key,
        created_at: job.created_at,
        updated_at: job.updated_at,
        payload: job.payload ? JSON.parse(job.payload) : null,
    });
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

/**
 * Get Metric data points
 */
app.get("/metrics", (req, res) => {
    const now = Date.now()

    const totalJobs = db
        .prepare(`SELECT COUNT(*) as count from jobs`)
        .get().count

    const byStatus = db
        .prepare(`
            SELECT status, COUNT(*) as count
            FROM jobs
            GROUP BY status
        `)
        .all()

    const statusCounts = {
        PENDING: 0,
        RUNNING: 0,
        DONE: 0,
        FAILED: 0,
        DLQ: 0
    }

    for (const row of byStatus) {
        statusCounts[row.status] = row.count
    }

    const totalRetries = db
        .prepare(`SELECT SUM(retry_count) as count from jobs`)
        .get().count || 0

    console.log("[METRICS_SCRAPED]")

    res.json({
        total_jobs: totalJobs,
        pending_jobs: statusCounts.PENDING,
        running_jobs: statusCounts.RUNNING,
        done_jobs: statusCounts.DONE,
        failed_jobs: statusCounts.FAILED,
        dlq_jobs: statusCounts.DLQ,
        total_retries: totalRetries,
        generated_at: now
    });
})

if(require.main === module){
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    })
}

module.exports = app