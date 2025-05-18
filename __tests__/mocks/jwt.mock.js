exports.mockedVerify = jest.fn((token, secret) => {
  if (token === "valid_token") {
    return { id: 1, email: "test@email.com" };
  } else {
    throw new Error("Invalid token");
  }
});
