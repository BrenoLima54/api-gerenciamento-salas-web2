const request = require("supertest");
const app = require("../app");
const labsMock = require("./mocks/labs.mock");

const mockedVerify = require("./mocks/jwt.mock").mockedVerify;
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: (...args) => mockedVerify(...args),
}));

const mockedLabsSave = jest.fn();
const mockedLabsFind = jest.fn();
const mockedLabsFindOne = jest.fn();
jest.mock("../models/Labs", () => {
  return jest.fn().mockImplementation(() => {
    return {
      save: (...args) => mockedLabsSave(...args),
    };
  });
});

const Lab = require("../models/Labs");
Lab.find = mockedLabsFind;
Lab.findOne = mockedLabsFindOne;

const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6lZr8AAAAASUVORK5CYII=";
const mockedFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
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

jest.mock("../config/multer", () => ({
  single: () => {
    return (req, res, next) => {
      req.file = {
        originalname: "sample.name",
        mimetype: "sample.type",
        path: "sample.url",
      };
      req.body = req.body || {};

      return next();
    };
  },
}));

describe("/laboratorio route", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-05-16"));
    jest.clearAllMocks();
  });

  const requestWithAuth = (method, url, data) => {
    if (!data)
      return request(app)
        [method](`/laboratorio${url}`)
        .set("Authorization", "Bearer valid_token");
    return request(app)
      [method](`/laboratorio${url}`)
      .set("Authorization", "Bearer valid_token")
      .send(data);
  };

  describe("POST /novo", () => {
    it("should return status 500 if database returns error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockedLabsFindOne.mockRejectedValueOnce(new Error("Database error"));

      const response = await requestWithAuth(
        "post",
        "/novo",
        labsMock.labsWithoutImages[0]
      );

      expect(response.status).toBe(500);
      expect(response.error).toEqual(
        expect.objectContaining({
          message: "cannot POST /laboratorio/novo (500)",
        })
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return status 400 if no parameter is sent", async () => {
      const response = await requestWithAuth("post", "/novo", {});

      expect(response.status).toBe(400);
      expect(response.error).toEqual(
        expect.objectContaining({
          message: "cannot POST /laboratorio/novo (400)",
        })
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          message:
            "Campos inválidos: nome, desc e capacidade numérica são obrigatórios.",
        })
      );
    });

    it("should return status 400 if lab already exists", async () => {
      mockedLabsFindOne.mockResolvedValue(true);

      const response = await requestWithAuth(
        "post",
        "/novo",
        labsMock.labsWithoutImages[0]
      );

      expect(response.status).toBe(400);
      expect(response.error).toEqual(
        expect.objectContaining({
          message: "cannot POST /laboratorio/novo (400)",
        })
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Nome já cadastrado",
        })
      );
    });

    it("should save lab with status 201", async () => {
      mockedLabsFindOne.mockResolvedValue(false);

      const response = await requestWithAuth(
        "post",
        "/novo",
        labsMock.labsWithoutImages[0]
      );

      expect(response.status).toBe(201);
      expect(mockedLabsSave).toHaveBeenCalled();
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Laboratório salvo com sucesso!",
        })
      );
    });
  });
  describe("GET /relatorio", () => {
    it("should return status 401 if no jwt is passed", async () => {
      const response = await request(app).get("/laboratorio/relatorio");

      expect(response.status).toBe(401);
    });

    it("should return error if database returns error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockedLabsFind.mockRejectedValueOnce(new Error("Database error"));

      const response = await requestWithAuth("get", "/relatorio");

      expect(response.status).toBe(500);
      expect(response.error).toEqual(
        expect.objectContaining({
          message: "cannot GET /laboratorio/relatorio (500)",
        })
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return buffer if valid jwt is passed", async () => {
      mockedLabsFind.mockResolvedValue(labsMock.labsWithImages);

      const response = await requestWithAuth("get", "/relatorio");

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
