export const fileBaseURL = "";

export const authConfig = {
  request: {
    authorizationHeader: "Authorization",
    authorizationScheme: "Bearer",
    tokenHeader: "token",
    sendAuthorization: true,
    sendTokenHeader: true,
  },
  response: {
    authorizationHeader: "authorization",
    tokenHeader: "token",
  },
};
