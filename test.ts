const { app } = require("./app");
const request = require("supertest");
describe("Web api - auth tests", () => {
    it("Before Login - GET /auth/login", async () => {
        const { body } = await request(app).get("/auth/login"); //uses the request function that calls on express app instance
        expect(body).toEqual({});
    });
    it("After Logined - POST /auth/login", async () => {
        const stateObj = { email: "kevin_lin@mirai-network.com", pass: "pso2020" };
        let res = await request(app).post("/auth/login").send(stateObj);
        expect(res.body).toEqual({ status: "ok" });
        const cookie = res.headers["set-cookie"];
        res = await request(app).get("/auth/login").set("cookie", cookie); //uses the request function that calls on express app instance
        console.log(res.body);
        // expect(body2).not.toEqual({});
    });
});
