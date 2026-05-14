import service from "../utils/request";

export function register(data) {
  return service.post("/user/add", data);
}

export function startSession(data) {
  return service.post("/psychological-chat/session/start", data);
}

export function getSessionPageList(params) {
  return service.get("/psychological-chat/sessions", { params });
}

export function deleteSessionPageList(sessionId) {
  return service.delete(`/psychological-chat/sessions/${sessionId}`);
}

export function getSessionDetail(sessionId) {
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`);
}

export function getSessionEmotion(sessionId) {
  return service.get(`/psychological-chat/session/${sessionId}/emotion`);
}

export function addEmotionDiary(data) {
  return service.post("/emotion-diary", data);
}

export function getKnowledgeList(params) {
  return service.get("/knowledge/article/page", { params });
}

export function getKnowledgeDetail(articleId) {
  return service.get(`/knowledge/article/${articleId}`);
}
