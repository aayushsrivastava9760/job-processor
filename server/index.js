const express = require('express')
const cors = require('cors')
const authMiddleWare = require('./auth')

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

app.use(authMiddleWare)

/**
 * Get jobs (for dashboard)
 */
app.get("/jobs", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})