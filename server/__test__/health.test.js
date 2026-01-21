const request = require('supertest')
const app = require('../index')

describe("Health Check of the server", () => {
    it("should return ok", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200)
        expect(res._body.status).toBe("ok")
    })
})