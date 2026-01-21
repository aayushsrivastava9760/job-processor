const request = require("supertest");
const app = require("../index");

const AUTH_HEADER = {
    Authorization: "Bearer user-1-key"
}

describe("Metrics API", () => {
    it("should return job metrics data", async () => {
        const res = await request(app)
        .get("/metrics")
        .set(AUTH_HEADER);

        expect(res.statusCode).toBe(200);
        expect(res.body.total_jobs).toBeDefined();
        expect(res.body.generated_at).toBeDefined();
    })
})