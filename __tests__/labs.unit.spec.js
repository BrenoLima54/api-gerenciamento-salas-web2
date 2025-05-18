const request = require("supertest");
const app = require("../app");

const mockedVerify = require("./mocks/jwt.mock").mockedVerify;
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: (...args) => mockedVerify(...args),
}));

const labsMock = require("./mocks/labs.mock");
const mockedLabsFind = jest.fn();
const mockedLabsFindOne = jest.fn();
jest.mock("../models/Labs", () => ({
  ...jest.requireActual("../models/Labs"),
  find: (...args) => mockedLabsFind(...args),
  findOne: (...args) => mockedLabsFindOne(...args),
}));

const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6lZr8AAAAASUVORK5CYII=";
const mockedFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    // buffer de image
    buffer: jest.fn(() =>
      Promise.resolve(Buffer.from(tinyPngBase64, "base64"))
    ),
  })
);
jest.mock(
  "node-fetch",
  () =>
    (...args) =>
      mockedFetch(...args)
);

describe("/laboratorio route", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-05-16"));
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /relatorio", () => {
    it("should return status 401 if no jwt is passed", async () => {
      const response = await request(app).get("/laboratorio/relatorio");

      expect(response.status).toBe(401);
    });

    it("should return error if database returns error", async () => {
      mockedLabsFind.mockRejectedValueOnce(new Error("Database error"));

      const response = await request(app)
        .get("/laboratorio/relatorio")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(500);
      expect(response.error).toEqual(
        expect.objectContaining({
          message: "cannot GET /laboratorio/relatorio (500)",
        })
      );
    });

    it("should return buffer if valid jwt is passed", async () => {
      mockedLabsFind.mockResolvedValue(labsMock.labsWithImages);

      const response = await request(app)
        .get("/laboratorio/relatorio")
        .set("Authorization", "Bearer valid_token");

      expect(mockedVerify).toHaveBeenCalledWith(
        "valid_token",
        process.env.JWT_SECRET
      );
      expect(response.status).toBe(200);
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining("http"),
        {
          headers: { "User-Agent": "Node.js PDF Generator" },
          timeout: 5000,
        }
      );
      expect(response.body).toEqual(expect.any(Buffer));
    });
  });
});
