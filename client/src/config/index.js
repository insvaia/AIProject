export const fileBaseURL = import.meta.env.VITE_FILE_BASE_URL || "";

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
