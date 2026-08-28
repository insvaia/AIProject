<template>
  <div class="consultation-container">
    <div class="sidebar">
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image
            :src="iconUrl"
            style="width: 25px; height: 25px"
            alt="ai助手"
          />
        </div>
        <h3 class="assistant-name">AI助手</h3>
        <div class="online-status">
          <div class="status-dot"></div>
          在线服务中
        </div>
      </div>
      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">情绪花园</div>
        </div>
        <div class="emotion-info">
          <div class="emotion-name">中性</div>
          <div class="emotion-score">50</div>
        </div>
        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今天感觉</span>
            <span class="status-emotion">{{
              currentEmotion.isNegative ? "需要关注" : "很不错"
            }}</span>
          </div>
          <div class="emotion-intensity">
            <span class="intensity-dots">
              <span
                v-for="dot in 3"
                :key="dot"
                class="dot"
                :class="{
                  active: getIntensityClass(currentEmotion.score) >= dot,
                }"
              ></span>
            </span>
            <span class="intensity-text">
              {{ getRiskText(currentEmotion.riskLevel) }}
            </span>
          </div>
          <!-- 温暖建议卡片 -->
          <div class="warm-suggestion" v-if="currentEmotion.suggestion">
            <div class="suggestion-icon">💝</div>
            <div class="suggestion-content">
              <div class="suggestion-title">给你的小建议</div>
              <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
            </div>
          </div>
          <!-- 治愈行动 -->
          <div
            class="healing-actions"
            v-if="
              currentEmotion.improvementSuggestions &&
              currentEmotion.improvementSuggestions.length > 0
            "
          >
            <div class="actions-title">治愈小行动</div>
            <div class="actions-list">
              <div
                v-for="action in currentEmotion.improvementSuggestions"
                :key="action"
                class="action-item"
              >
                <div class="action-icon">✨</div>
                <div class="action-text">{{ action }}</div>
              </div>
            </div>
          </div>
          <!-- 风险提示 -->
          <div
            class="risk-notice"
            v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1"
          >
            <div class="notice-icon">🤗</div>
            <div class="notice-content">
              <div class="notice-title">温馨提示</div>
              <div class="notice-text">
                {{ currentEmotion.riskDescription }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 会话列表 -->
      <div class="session-history">
        <h4 class="section-title">会话列表</h4>
        <div class="session-list">
          <div
            v-for="session in sessionList"
            :key="session.id"
            @click="handleSessionClick(session)"
            class="session-item"
          >
            <div class="session-info">
              <div class="session-title">
                <span>{{ session.sessionTitle }}</span>
                <div class="session-meta">
                  <span class="session-time">{{ session.startedAt }}</span>
                </div>
                <div class="session-preview">
                  {{ session.lastMessageContent }}
                </div>
                <div class="session-stats">
                  <span>
                    <el-icon>
                      <ChatRound />
                    </el-icon>
                    {{ session.messageCount || 0 }}
                  </span>
                  <span>
                    <el-icon>
                      <Clock />
                    </el-icon>
                    {{ session.durationMinutes || 0 }}
                  </span>
                </div>
              </div>
              <div class="session-actions">
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="handleDeleteSession(session.id)"
                >
                  <el-icon>
                    <DeleteFilled />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="iconUrl1" style="width: 30px; height: 30px" />
          </div>
          <div class="chat-info">
            <h2 class="chat-title">AI助手</h2>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>
        <el-button
          circle
          :disabled="isSending"
          @click="createNewFrontendSession"
          title="新建会话"
        >
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>
      <!-- 聊天消息区域 -->
      <div class="chat-messages">
        <!-- 欢迎用语 -->
        <div class="message-item ai-message" v-if="messages.length === 0">
          <div class="message-avatar">
            <el-image :src="iconUrl" style="width: 18px; height: 18px" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>
                您好！我是小暖，我是您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，您今天感觉怎么样？有什么想要分享的吗？
              </p>
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="msg.senderType === 1 ? 'user-message' : 'ai-message'"
        >
          <div class="message-avatar">
            <el-image
              v-if="msg.senderType === 1"
              style="width: 18px; height: 18px"
              :src="iconUrl2"
            />
            <el-image
              v-if="msg.senderType === 2"
              style="width: 18px; height: 18px"
              :src="iconUrl"
            />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <!-- ai正在思考中 -->
              <div
                class="typing-indicator"
                v-if="msg.senderType === 2 && isSending && !msg.content"
              >
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <!-- ai错误提示 -->
              <div class="error-message" v-else-if="msg.isError">
                <p>{{ msg.content }}</p>
              </div>
              <!-- ai正常回复消息 -->
              <MarkdownRenderer
                v-else-if="msg.senderType === 2 && !msg.isError && msg.content"
                :content="msg.content"
                :is-ai-message="true"
              />
              <p
                v-else-if="msg.content"
                v-html="formatMessageContent(msg.content)"
              ></p>
            </div>
            <div class="message-time">
              {{
                msg.senderType === 2 && isSending
                  ? "AI助手正在回复..."
                  : msg.createdAt
              }}
            </div>
          </div>
        </div>
      </div>
      <!-- 消息输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input
            v-model="userMessage"
            placeholder="请输入您想要分享的内容..."
            type="textarea"
            :rows="3"
            :disabled="isSending"
            @keydown.enter="handleKeyDown"
            clearable
          />
          <div class="input-footer">
            <span>按 Enter 键发送，Shift + Enter 键换行</span>
            <span>{{ userMessage.length }} / 500</span>
          </div>
        </div>
        <el-button
          :disabled="!userMessage.trim() || userMessage.length > 500"
          type="primary"
          class="send-btn"
          @click="sendMessage"
        >
          <el-icon>
            <Promotion />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Plus, Promotion } from "@element-plus/icons-vue";
import {
  startSession,
  getSessionPageList,
  deleteSessionPageList,
  getSessionDetail,
  getSessionEmotion,
} from "@/api/frontend.js";
import { ChatRound, Clock, DeleteFilled } from "@element-plus/icons-vue";
import MarkdownRenderer from "@/components/MarkdownRenderer/index.vue";
import { ElMessage } from "element-plus";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const iconUrl = new URL("@/assets/images/robot-fill.png", import.meta.url).href;
const iconUrl1 = new URL("@/assets/images/like.png", import.meta.url).href;
const iconUrl2 = new URL("@/assets/images/users.png", import.meta.url).href;

const DEFAULT_EMOTION = {
  primaryEmotion: "中性",
  score: 50,
  isNegative: false,
  riskLevel: 0,
  riskDescription: "",
  suggestion: "今天的你状态不错哦，继续保持积极的心态吧！",
  improvementSuggestions: [],
};

const resetEmotion = () => {
  currentEmotion.value = {
    ...DEFAULT_EMOTION,
    improvementSuggestions: [...DEFAULT_EMOTION.improvementSuggestions],
  };
};

const normalizeEmotion = (raw) => {
  const safe = raw && typeof raw === "object" ? raw : {};
  return {
    ...DEFAULT_EMOTION,
    ...safe,
    improvementSuggestions: Array.isArray(safe.improvementSuggestions)
      ? safe.improvementSuggestions
      : [],
  };
};

// 新建会话
const createNewFrontendSession = () => {
  if (isSending.value) {
    ElMessage.warning("AI助手正在回复中，请稍候再新建会话...");
    return;
  }

  stopActiveStream();
  sessionDetailRequestVersion += 1;
  emotionRequestVersion += 1;

  const newSession = {
    sessionId: `temp_${Date.now()}`,
    status: "TEMP",
    sessionTitle: "新会话",
  };
  currentSession.value = newSession;

  userMessage.value = "";
  messages.value = [];
  resetEmotion();
};

const userMessage = ref("");

// 定义当前会话对象
const currentSession = ref(null);
const sessionList = ref([]);

const messages = ref([]);

// 定义ai助手是否正在回复
const isSending = ref(false);

// 当前活动的数据流。控制器和会话 ID 一起保存，避免旧数据流写入新会话。
let activeStreamController = null;
let activeStreamSessionId = null;
// 版本号用于处理异步请求乱序：只有最后一次请求的结果可以更新页面。
let sessionDetailRequestVersion = 0;
let emotionRequestVersion = 0;
// 组件卸载后即使异步回调晚到，也不再修改响应式状态。
let isComponentActive = true;

// 统一会话 ID 格式，保证列表中的数字 ID 和接口返回的 session_x 可以正确比较。
const normalizeSessionId = (sessionId) => {
  const id = String(sessionId ?? "");
  if (id.startsWith("session_") || id.startsWith("temp_")) return id;
  return `session_${id}`;
};

const isCurrentSession = (sessionId) => {
  return (
    currentSession.value?.sessionId === normalizeSessionId(sessionId)
  );
};

// 第一层校验：数据流必须仍是组件当前登记的活动流，且没有被中止。
const isActiveStream = (controller, sessionId) => {
  return (
    isComponentActive &&
    !controller.signal.aborted &&
    activeStreamController === controller &&
    activeStreamSessionId === normalizeSessionId(sessionId)
  );
};

// 正常结束活动流。实例校验可防止旧流的 finally 清掉新流状态。
const finishActiveStream = (controller) => {
  if (activeStreamController !== controller) return;
  activeStreamController = null;
  activeStreamSessionId = null;
  isSending.value = false;
};

// 主动结束旧流：切换会话或组件卸载时调用，不把主动中止当作请求错误。
const stopActiveStream = () => {
  const controller = activeStreamController;
  activeStreamController = null;
  activeStreamSessionId = null;
  isSending.value = false;

  if (controller && !controller.signal.aborted) {
    controller.abort();
  }
};

// 情绪花园
const currentEmotion = ref({
  ...DEFAULT_EMOTION,
});

const loadSessionEmotion = async (sessionId) => {
  const normalizedSessionId = normalizeSessionId(sessionId);
  // 记录本次请求版本；切换会话会产生新版本，使旧响应自动失效。
  const requestVersion = ++emotionRequestVersion;

  try {
    const res = await getSessionEmotion(normalizedSessionId);
    if (
      !isComponentActive ||
      requestVersion !== emotionRequestVersion ||
      !isCurrentSession(normalizedSessionId)
    ) {
      return;
    }

    const data = res?.data ?? res;
    currentEmotion.value = normalizeEmotion(data);
  } catch (error) {
    if (isCurrentSession(normalizedSessionId)) {
      console.error("加载会话情绪分析失败:", error);
    }
  }
};

const getRiskText = (level) => {
  switch (level) {
    case 0:
      return "正常";
    case 1:
      return "关注";
    case 2:
      return "预警";
    case 3:
      return "危机";
    default:
      return "正常";
  }
};

const getIntensityClass = (score) => {
  if (score >= 61) {
    return 3;
  } else if (score >= 31) {
    return 2;
  }
  return 1;
};

const handleKeyDown = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

// 用户发送信息
const sendMessage = async () => {
  if (!userMessage.value.trim()) return;
  if (isSending.value) {
    ElMessage.warning("AI助手正在发送中，请稍候...");
    return;
  }
  if (!currentSession.value) {
    createNewFrontendSession();
  }

  const message = userMessage.value.trim();
  userMessage.value = "";
  // 如果当前会话是临时的，先创建正式会话
  if (currentSession.value.status === "TEMP") {
    startNewSession(message);
  } else {
    // 继续现有会话
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: new Date().toISOString(),
    });
    startAIResponse(currentSession.value.sessionId, message);
  }
};

const startNewSession = (message) => {
  // 捕获创建请求所属的临时会话，防止请求返回前用户已切换到其他会话。
  const pendingSessionId = currentSession.value?.sessionId;

  // 构建会话参数
  const sessionParams = {
    initialMessage: message,
  };
  if (currentSession.value.sessionTitle === "新会话") {
    sessionParams.sessionTitle = `AI助手 - ${new Date().toLocaleDateString()}`;
  } else {
    // 如果有历史会话记录
    sessionParams.sessionTitle = currentSession.value.sessionTitle;
  }
  // 调用后端接口创建新会话
  startSession(sessionParams).then((res) => {
    if (
      !isComponentActive ||
      currentSession.value?.sessionId !== pendingSessionId
    ) {
      return;
    }

    // 将后端返回的数据转为前端会话的格式
    const sessionData = {
      sessionId: res.sessionId,
      status: res.status,
      sessionTitle: sessionParams.sessionTitle,
    };
    // 如果当前是临时会话，更新数据
    if (currentSession.value && currentSession.value.status === "TEMP") {
      // 更新为正式会话
      Object.assign(currentSession.value, sessionData);
    } else {
      // 否则直接设置当前会话
      currentSession.value = sessionData;
    }
    // 更新会话列表
    getSessionPage();

    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: new Date().toISOString(),
    });

    // 开始流式对话
    startAIResponse(sessionData.sessionId, message);
  });
};

const startAIResponse = (sessionId, userMessage) => {
  if (isSending.value) {
    ElMessage.warning("AI助手正在发送中，请稍候...");
    return;
  }

  // 任意时刻只允许存在一条活动流，启动前先清理可能残留的旧连接。
  stopActiveStream();
  isSending.value = true;

  const streamSessionId = normalizeSessionId(sessionId);
  const controller = new AbortController();
  // 保存到组件作用域，切换会话和组件卸载时才能访问并中止该请求。
  activeStreamController = controller;
  activeStreamSessionId = streamSessionId;

  // 固定保存本次流对应的消息对象，不能再通过 messages 最后一项定位。
  const aiMessage = {
    id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId: streamSessionId,
    senderType: 2,
    content: "",
    createdAt: new Date().toISOString(),
  };
  messages.value.push(aiMessage);

  let streamFinished = false;

  // 第二层校验：活动流归属正确，并且用户当前仍停留在该会话。
  // 即使 abort 与网络数据到达存在时间差，晚到的数据也会在这里被丢弃。
  const canWriteToCurrentSession = () => {
    return (
      isActiveStream(controller, streamSessionId) &&
      isCurrentSession(streamSessionId)
    );
  };

  // done 和 onclose 都可能触发结束逻辑，streamFinished 保证只执行一次。
  const completeStream = () => {
    if (streamFinished) return;
    streamFinished = true;

    const shouldLoadEmotion = canWriteToCurrentSession();
    finishActiveStream(controller);
    if (!controller.signal.aborted) controller.abort();

    if (shouldLoadEmotion) {
      loadSessionEmotion(streamSessionId);
    }
  };

  const failStream = (message) => {
    if (!canWriteToCurrentSession()) return;
    streamFinished = true;
    aiMessage.isError = true;
    aiMessage.content = message;
    finishActiveStream(controller);
    if (!controller.signal.aborted) controller.abort();
    ElMessage.error(message);
  };

  // 调用流式接口
  void fetchEventSource("/api/psychological-chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: localStorage.getItem("token") || "",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      sessionId: streamSessionId,
      userMessage,
    }),
    // 将控制器与本次 SSE 请求关联，调用 abort() 后底层连接会被终止。
    signal: controller.signal,
    onopen: (response) => {
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("text/event-stream")) {
        throw new Error("服务器返回数据格式异常");
      }
    },
    onmessage: (event) => {
      // 每个数据片段写入前都校验归属，旧会话的数据不能进入新会话。
      if (!canWriteToCurrentSession()) return;

      const raw = event.data.trim();
      if (!raw) return;

      if (event.event === "done") {
        completeStream();
        return;
      }

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        failStream("AI助手返回的数据格式异常，请稍后再试~");
        return;
      }

      const ok = String(payload.code) === "200";
      if (ok && payload.data && payload.data.content) {
        aiMessage.content += payload.data.content;
      } else if (!ok) {
        failStream(payload.message || "AI助手回复失败了，请稍后再试~");
      }
    },
    onerror: (err) => {
      throw err;
    },
    onclose: () => {
      completeStream();
    },
  })
    .catch((error) => {
      // 用户切换会话造成的主动中止属于正常流程，不显示错误提示。
      if (
        controller.signal.aborted ||
        !isActiveStream(controller, streamSessionId)
      ) {
        return;
      }
      failStream(error?.message || "AI助手回复失败了，请稍后再试~");
    })
    .finally(() => {
      finishActiveStream(controller);
    });
};

const getSessionPage = () => {
  getSessionPageList({
    pageNum: 1,
    pageSize: 10,
  }).then((res) => {
    if (!isComponentActive) return;
    sessionList.value = res?.records || res?.data?.records || [];
  });
};

// 获取会话数据
const handleSessionClick = async (session) => {
  // 切换前先中止旧 SSE，阻断旧会话继续产生前端数据。
  stopActiveStream();

  const targetSessionId = normalizeSessionId(session.id);
  // 快速连续点击多个会话时，只接受最后一次详情请求的响应。
  const requestVersion = ++sessionDetailRequestVersion;
  currentSession.value = {
    sessionId: targetSessionId,
    status: "ACTIVE",
    sessionTitle: session.sessionTitle,
  };
  messages.value = [];
  resetEmotion();
  loadSessionEmotion(targetSessionId);

  try {
    const res = await getSessionDetail(session.id);
    if (
      !isComponentActive ||
      requestVersion !== sessionDetailRequestVersion ||
      !isCurrentSession(targetSessionId)
    ) {
      return;
    }
    messages.value = res?.data ?? res;
  } catch (error) {
    if (
      isComponentActive &&
      requestVersion === sessionDetailRequestVersion &&
      isCurrentSession(targetSessionId)
    ) {
      ElMessage.error("会话记录加载失败，请稍后重试");
    }
  }
};

const handleDeleteSession = (sessionId) => {
  deleteSessionPageList(sessionId).then(() => {
    ElMessage.success("会话已删除");
    getSessionPage();
  });
};

// 处理一下换行的逻辑
const formatMessageContent = (content) => {
  return content.replace(/\n/g, "<br>");
};

onMounted(() => {
  createNewFrontendSession();
  getSessionPage();
});

onBeforeUnmount(() => {
  // 页面离开后统一释放连接，并让尚未完成的详情/情绪请求全部失效。
  isComponentActive = false;
  sessionDetailRequestVersion += 1;
  emotionRequestVersion += 1;
  stopActiveStream();
});
</script>

<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;
  .sidebar {
    width: 320px;
    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 252, 248, 0.95) 100%
      );
      border-radius: 16px;
      padding: 16px;
      box-shadow:
        0 8px 32px rgba(251, 146, 60, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }
      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }
      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;
        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }
    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .session-list {
        overflow-y: auto;
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;
        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }
          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }
          .session-info {
            flex: 1;
            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }
              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;
                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }
            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }
        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }
    .emotion-garden {
      background: linear-gradient(
        135deg,
        #fef9e7 0%,
        #fcf4e6 50%,
        #f6f0e8 100%
      );
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;
        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }
      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(
          135deg,
          #ff9a9e 0%,
          #fecfef 50%,
          #fecfef 100%
        );
        color: #fff;
        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }
        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }
      .warm-tips {
        text-align: center;
        margin-bottom: 16px;
        .emotion-status-text {
          margin-bottom: 12px;
          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }
          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }
        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          .intensity-dots {
            display: flex;
            gap: 4px;
            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;
              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }
          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }
        .warm-suggestion {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95),
            rgba(255, 255, 255, 0.8)
          );
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .suggestion-content {
            text-align: left;
            flex: 1;
            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }
            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }
        .healing-actions {
          margin-bottom: 16px;
          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }
          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            .action-item {
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.9),
                rgba(255, 255, 255, 0.7)
              );
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
              text-align: left;
              .action-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }
              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }
        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);
          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .notice-content {
            flex: 1;
            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }
            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
  .chat-main {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 252, 250, 0.98) 100%
    );
    border-radius: 20px;
    box-shadow:
      0 12px 40px rgba(251, 146, 60, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;
      .header-left {
        display: flex;
        align-items: center;
        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }
        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          p {
            font-size: 14px;
          }
        }
      }
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.02) 0%,
        rgba(255, 252, 248, 0.05) 100%
      );
      min-height: 0;
      max-height: calc(100vh - 200px);
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }
        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
          }
        }
        &.user-message {
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }
        .message-content {
          max-width: 70%;
          .message-bubble {
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 252, 248, 0.95) 100%
            );
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);
            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;
              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;
                &:nth-child(2) {
                  animation-delay: 0.2s;
                }
                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }
            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
              border: 1px solid #f87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991b1b;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }
          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }
    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 252, 248, 0.7) 100%
      );
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      .input-container {
        flex: 1;
      }
      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
      }
      .send-btn {
        height: 60px;
        width: 60px;
        border-radius: 16px;
        background: linear-gradient(
          135deg,
          #fb923c 0%,
          #f59e0b 100%
        ) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s ease;
      }
    }
  }
}
</style>
