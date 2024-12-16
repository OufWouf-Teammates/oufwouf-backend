const request = require("supertest")
const app = require("./app")

it("GET /bookmarks sur la map", async () => {
  const res = await request(app).get("/map/bookmarkLocate")

  expect(res.statusCode).toBe(200 || 304)
  expect(res.body.result).toBe(true)
  expect(Array.isArray(res.body.locate)).toBe(true)
})
