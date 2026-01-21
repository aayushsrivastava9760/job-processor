const {USERS} = require('./constants')

module.exports = function authMiddleWare(req, res, next){
    const authHeader = req.headers["authorization"]

    if(!authHeader){
        return res.status(401).json({error: "Missing Authorization Header"})
    }

    const token = authHeader.replace("Bearer ", "")
    const user = USERS[token]

    if(!user){
        return res.status(403).json({error: "Invalid API Key"})
    }

    req.user = user
    next()
}