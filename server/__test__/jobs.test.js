const request = require("supertest");
const app = require("../index");

const AUTH_HEADER = {
    Authorization: "Bearer user-1-key"
}

describe("Jobs API", ()=>{
    it("should reject unauthenticated requests", async () => {
        const res = await request(app).get("/jobs");
        expect(res.statusCode).toBe(401);
    })

    it("should list jobs for a user", async () => {
        const res = await request(app)
        .get("/jobs")
        .set(AUTH_HEADER);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.jobs)).toBe(true);
    });
})