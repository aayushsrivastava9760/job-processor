const {v4: uuidv4} = require('uuid')
const path = require('path')
const { createDB } = require("./db")
const {
    LEASE_MS,
    POLL_INTERVAL_MS,
    DB_NAME
} = require('./constants')

const db = createDB(path.join(__dirname, DB_NAME))
const WORKER_ID = `worker-${uuidv4().slice(0, 8)}`

console.log(`worker started: ${WORKER_ID}`)

function sleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Simulated job processor
 */
async function processJob(job){
    console.log(`[JOB PROCESSING] job_id = ${job.id} worker = ${WORKER_ID}`)

    // simulated job
    await sleep(1000 + Math.random()*2000)

    // Simulated random failure
    if(Math.random() < 0.3){
        throw new Error("Simulated job failure");
    }
}

async function runWorker(){
    while(true){
        const now = Date.now()
        let job = null;

        // Lease the job
        const leaseJob = db.transaction(() => {
            const candidate = db.prepare(`
                SELECT * FROM jobs
                WHERE 
                    status = 'PENDING'
                    OR ( status = 'RUNNING' AND leased_until < ? )
                ORDER BY created_at
                LIMIT 1
            `).get(now)

            if(!candidate) return null

            db.prepare(`
                UPDATE jobs
                SET
                    status = 'RUNNING',
                    leased_until = ?,
                    worker_id = ?,
                    updated_at = ?
                WHERE id = ?
            `).run(
                now + LEASE_MS,
                WORKER_ID,
                now,
                candidate.id
            );

            return candidate
        })

        job = leaseJob()

        if(!job){
            await sleep(POLL_INTERVAL_MS);
            continue;
        }

        /**
         * Job processing
         */
        try{
            await processJob(job)

            db.prepare(`
                UPDATE jobs
                SET
                    status = 'DONE',
                    leased_until = NULL,
                    worker_id = NULL,
                    updated_at = ?
                WHERE id = ?
            `).run(Date.now(), job.id)

            console.log(`[JOB_DONE] job_id=${job.id} worker=${WORKER_ID}`)
        }catch(err){
            console.error(`[JOB_FAILED] job_id=${job.id} worker=${WORKER_ID} error=${err.message}`)

            const updatedJob = db.prepare(`
                SELECT retry_count, max_retries FROM jobs
                WHERE id = ?
            `).get(job.id)

            if(updatedJob.retry_count + 1 > updatedJob.max_retries){
                db.prepare(`
                    UPDATE jobs
                    SET
                        status = 'DLQ',
                        leased_unitl = NULL,
                        worker_id = NULL,
                        updated_at = ?
                    WHERE id = ?
                `).get(Date.now(), job.id)

                console.log(`[JOB_DLQ] job_id=${job.id}`)
            } else {
                db.prepare(`
                    UPDATE jobs
                    SET
                        status = 'PENDING',
                        retry_count = retry_count + 1,
                        leased_until = NULL,
                        worker_id = NULL,
                        updated_at = ?
                    WHERE id = ?
                `).run(Date.now(), job.id)

                console.log(`[JOB_RETRY] job_id=${job.id} retry=${updatedJob.retry_count + 1}`)
            }
        }
    }
}

runWorker()