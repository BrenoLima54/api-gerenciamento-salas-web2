const request = require('supertest');
const app = require('../app');
const userMock = require('./mocks/user.mock');

const mockedSave = jest.fn();
const mockedFind = jest.fn();
const mockedFindOne = jest.fn();
jest.mock('../models/User', () => {
  return jest.fn().mockImplementation(() => {
    return {
      save: (...args) => mockedSave(...args),
    };
  });
});

const User = require('../models/User');
User.find = mockedFind;
User.findOne = mockedFindOne;

describe('/user route', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-05-16'));
    jest.clearAllMocks();
  });

  const requestWithApp = (url, data) => {
    if (!data) return request(app).post(`/user${url}`);
    return request(app).post(`/user${url}`).send(data);
  };

  describe('POST /registrar', () => {
    it('should return 400 if access api on weekends', async () => {
      jest.setSystemTime(new Date('2025-05-18')); // Domingo

      const response = await requestWithApp(
        '/registrar',
        userMock.userWithoutId
      );

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Acesso não permitido aos finais de semana',
        })
      );
    });

    it('should return 400 when no email and password is passed', async () => {
      const response = await requestWithApp('/registrar', {});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          erro: 'Email e senha são obrigatórios',
        })
      );
    });

    it('should return 500 when database rejects', async () => {
      mockedFindOne.mockRejectedValueOnce(new Error());
      const response = await requestWithApp(
        '/registrar',
        userMock.userWithoutId
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual(
        expect.objectContaining({
          erro: 'Erro ao registrar usuário',
        })
      );
    });

    it('should return 400 when email is already registered', async () => {
      mockedFindOne.mockResolvedValueOnce(userMock.userWithoutPassword);
      const response = await requestWithApp(
        '/registrar',
        userMock.userWithoutId
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          erro: 'Usuário já existe',
        })
      );
    });

    it('should return 201 when user is created', async () => {
      const response = await requestWithApp(
        '/registrar',
        userMock.userWithoutId
      );

      expect(mockedSave).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe('POST /logar', () => {
    const bcrypt = require('bcrypt');
    const bycriptCompareSpy = jest.spyOn(bcrypt, 'compare');
    const jwtSignSpy = jest.spyOn(require('jsonwebtoken'), 'sign');

    it('should return 400 when no email and password is passed', async () => {
      const response = await requestWithApp('/logar', {});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          erro: 'E-mail e senha são obrigatórios!',
        })
      );
    });

    it('should return 401 when user is not found', async () => {
      mockedFindOne.mockResolvedValueOnce(null);
      const response = await requestWithApp('/logar', userMock.userWithoutId);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          erro: 'Credenciais inválidas',
        })
      );
    });

    it('should return 401 when password is invalid', async () => {
      mockedFindOne.mockResolvedValueOnce(userMock.user);
      bycriptCompareSpy.mockResolvedValueOnce(false);
      const response = await requestWithApp('/logar', userMock.userWithoutId);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          erro: 'Credenciais inválidas',
        })
      );
    });

    it('should return 500 when database rejects', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedFindOne.mockRejectedValueOnce(new Error());
      const response = await requestWithApp('/logar', userMock.userWithoutId);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(
        expect.objectContaining({
          erro: 'Erro interno no servidor',
        })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return JWT when user is loged', async () => {
      mockedFindOne.mockResolvedValueOnce(userMock.user);
      bycriptCompareSpy.mockResolvedValueOnce(true);
      jwtSignSpy.mockReturnValueOnce('token');

      const response = await requestWithApp('/logar', userMock.userWithoutId);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: 'token' });
      expect(jwtSignSpy).toHaveBeenCalledWith(
        { id: userMock.user._id, email: userMock.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });
  });
});
