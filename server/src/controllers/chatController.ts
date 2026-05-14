import { Context, Next } from "koa";
import ChatSession from "../models/ChatSession";
import ChatMessage from "../models/ChatMessage";
import { AuthContext } from "../middleware/auth";
import sequelize from "sequelize";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const emotionSuggestions: Record<
  string,
  {
    suggestion: string;
    improvements: string[];
    riskLevel: number;
    isNegative: boolean;
  }
> = {
  开心: {
    suggestion:
      "您的积极情绪是宝贵的资源，建议记录下让您开心的事情，在低落时回顾。",
    improvements: ["继续保持积极心态", "与朋友分享快乐", "记录美好时刻"],
    riskLevel: 0,
    isNegative: false,
  },
  平静: {
    suggestion:
      "保持内心的平静是很珍贵的状态，可以趁此机会进行自我反思和规划。",
    improvements: ["练习正念冥想", "阅读一本好书", "享受当下宁静"],
    riskLevel: 0,
    isNegative: false,
  },
  兴奋: {
    suggestion: "兴奋是积极的能量！可以尝试将这股能量转化为创造力和行动力。",
    improvements: ["制定目标和计划", "尝试新事物", "适度运动释放能量"],
    riskLevel: 0,
    isNegative: false,
  },
  焦虑: {
    suggestion:
      "焦虑常常源于对未来的不确定。试着将注意力拉回当下，专注于此刻能做的事情。",
    improvements: ["进行深呼吸练习", "把担忧写在纸上", "尝试渐进式肌肉放松法"],
    riskLevel: 1,
    isNegative: true,
  },
  悲伤: {
    suggestion:
      "悲伤是自然的情感反应，不需要急于摆脱。给自己时间去感受和接纳这份情绪。",
    improvements: ["允许自己哭泣", "找信任的人倾诉", "听舒缓的音乐"],
    riskLevel: 1,
    isNegative: true,
  },
  疲惫: {
    suggestion:
      "身心疲惫时，休息不是奢侈而是必需。适当放慢节奏，给自己充电的机会。",
    improvements: ["保证充足睡眠", "减少不必要的社交", "做一些简单的放松活动"],
    riskLevel: 1,
    isNegative: true,
  },
  困惑: {
    suggestion:
      "困惑是成长的前奏。当我们愿意面对困惑时，往往能获得更深刻的自我认知。",
    improvements: ["写下困惑的具体问题", "寻求他人建议", "一次解决一个问题"],
    riskLevel: 0,
    isNegative: false,
  },
  惊讶: {
    suggestion:
      "惊喜或惊讶让生活多了变化。尝试接纳这份意外，它可能带来新的视角。",
    improvements: ["记录下你的感受", "分析情绪来源", "与他人分享你的感受"],
    riskLevel: 0,
    isNegative: false,
  },
};

const defaultEmotion = {
  primaryEmotion: "中性",
  score: 50,
  isNegative: false,
  riskLevel: 0,
  riskDescription: "当前情绪状态稳定，无明显风险。",
  suggestion: "今天的你状态不错哦，继续保持积极的心态吧！",
  improvementSuggestions: ["保持规律作息", "适度运动锻炼", "培养积极兴趣爱好"],
};

const generateEmotionAnalysis = (userMessage: string) => {
  const normalized = userMessage.toLowerCase();

  if (
    normalized.includes("焦虑") ||
    normalized.includes("担心") ||
    normalized.includes("紧张")
  ) {
    const info = emotionSuggestions["焦虑"];
    return {
      primaryEmotion: "焦虑",
      score: 65,
      ...info,
      riskDescription: "用户表达了焦虑情绪，需要适当关注情绪管理。",
    };
  }
  if (
    normalized.includes("悲伤") ||
    normalized.includes("难过") ||
    normalized.includes("哭")
  ) {
    const info = emotionSuggestions["悲伤"];
    return {
      primaryEmotion: "悲伤",
      score: 70,
      ...info,
      riskDescription: "用户表达了悲伤情绪，建议持续关注并提供情感支持。",
    };
  }
  if (
    normalized.includes("累") ||
    normalized.includes("疲惫") ||
    normalized.includes("困")
  ) {
    const info = emotionSuggestions["疲惫"];
    return {
      primaryEmotion: "疲惫",
      score: 55,
      ...info,
      riskDescription: "用户表达了疲惫感，建议关注睡眠和生活作息。",
    };
  }
  if (
    normalized.includes("开心") ||
    normalized.includes("高兴") ||
    normalized.includes("幸福")
  ) {
    const info = emotionSuggestions["开心"];
    return {
      primaryEmotion: "开心",
      score: 30,
      ...info,
      riskDescription: "用户情绪积极正向。",
    };
  }
  if (
    normalized.includes("困惑") ||
    normalized.includes("迷茫") ||
    normalized.includes("不知道")
  ) {
    const info = emotionSuggestions["困惑"];
    return {
      primaryEmotion: "困惑",
      score: 45,
      ...info,
      riskDescription: "用户表达了困惑感，可能需要引导和支持。",
    };
  }
  if (normalized.includes("平静") || normalized.includes("放松")) {
    const info = emotionSuggestions["平静"];
    return {
      primaryEmotion: "平静",
      score: 25,
      ...info,
      riskDescription: "用户情绪平稳。",
    };
  }
  if (normalized.includes("兴奋") || normalized.includes("激动")) {
    const info = emotionSuggestions["兴奋"];
    return {
      primaryEmotion: "兴奋",
      score: 35,
      ...info,
      riskDescription: "用户表达兴奋积极的情绪。",
    };
  }
  if (normalized.includes("惊讶") || normalized.includes("意外")) {
    const info = emotionSuggestions["惊讶"];
    return {
      primaryEmotion: "惊讶",
      score: 40,
      ...info,
      riskDescription: "用户表达了惊讶的情绪反应。",
    };
  }

  return { ...defaultEmotion, primaryEmotion: "中性", score: 50 };
};

// 启动新会话
export const startSession = async (ctx: AuthContext) => {
  try {
    const { initialMessage, sessionTitle } = ctx.request.body as any;
    const userId = ctx.currentUser?.id;

    if (!userId) {
      ctx.status = 200;
      ctx.body = { code: "401", message: "请先登录" };
      return;
    }

    const session = await ChatSession.create({
      userId,
      sessionTitle: sessionTitle || "AI助手会话",
      status: "ACTIVE",
      lastMessageContent: initialMessage?.slice(0, 200) || "",
      messageCount: 0,
      durationMinutes: 0,
      startedAt: new Date(),
      lastMessageTime: new Date(),
      userNickname: ctx.currentUser?.username || "",
    });

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "会话创建成功",
      data: {
        sessionId: `session_${session.id}`,
        status: session.status,
        sessionTitle: session.sessionTitle,
      },
    };
  } catch (error) {
    console.error("创建会话失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "创建会话失败，服务器内部错误" };
  }
};

// 获取会话分页列表
export const getSessionPageList = async (ctx: AuthContext) => {
  try {
    const userId = ctx.currentUser?.id;
    if (!userId) {
      ctx.status = 200;
      ctx.body = { code: "401", message: "请先登录" };
      return;
    }

    const { pageNum = 1, pageSize = 10, ...rest } = ctx.query as any;
    const page = parseInt(pageNum);
    const size = parseInt(pageSize);

    const isAdmin = ctx.currentUser?.userType === 0;
    const where: any = isAdmin ? {} : { userId };

    // 管理员端的搜索参数可以更多
    if (rest.userId) where.userId = rest.userId;

    const { count, rows } = await ChatSession.findAndCountAll({
      where,
      order: [["last_message_time", "DESC"]],
      limit: size,
      offset: (page - 1) * size,
    });

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "查询成功",
      data: {
        records: rows,
        total: count,
        currentPage: page,
        size,
      },
    };
  } catch (error) {
    console.error("获取会话列表失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "获取会话列表失败，服务器内部错误" };
  }
};

// 获取会话消息
export const getSessionMessages = async (ctx: Context) => {
  try {
    const { sessionId } = ctx.params;
    const id = sessionId.replace(/^session_/, "");

    const messages = await ChatMessage.findAll({
      where: { sessionId: parseInt(id) },
      order: [["created_at", "ASC"]],
    });

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "查询成功",
      data: messages,
    };
  } catch (error) {
    console.error("获取消息失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "获取消息失败，服务器内部错误" };
  }
};

// 删除会话
export const deleteSession = async (ctx: AuthContext) => {
  try {
    const { sessionId } = ctx.params;
    const id = sessionId.replace(/^session_/, "");

    const session = await ChatSession.findByPk(parseInt(id));
    if (!session) {
      ctx.status = 200;
      ctx.body = { code: "404", message: "会话不存在" };
      return;
    }

    await ChatMessage.destroy({ where: { sessionId: parseInt(id) } });
    await session.destroy();

    ctx.status = 200;
    ctx.body = { code: "200", message: "会话删除成功" };
  } catch (error) {
    console.error("删除会话失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "删除会话失败，服务器内部错误" };
  }
};

// 获取会话情绪分析
export const getSessionEmotion = async (ctx: Context) => {
  try {
    const { sessionId } = ctx.params;
    const id = sessionId.replace(/^session_/, "");

    const messages = await ChatMessage.findAll({
      where: { sessionId: parseInt(id), senderType: 1 },
      order: [["created_at", "DESC"]],
      limit: 5,
    });

    const allUserMessages = messages.map((m) => m.content).join(" ");
    const emotion = generateEmotionAnalysis(allUserMessages || "");

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "情绪分析完成",
      data: emotion,
    };
  } catch (error) {
    console.error("获取情绪分析失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "获取情绪分析失败，服务器内部错误" };
  }
};

const SYSTEM_PROMPT = `你是一位专业、温暖且富有同理心的AI心理咨询师。你的职责是：
1. 以温暖、接纳的态度倾听来访者的困扰
2. 运用心理学专业知识（CBT、正念、人本主义等）帮助来访者
3. 通过提问引导来访者深入探索自己的情绪和想法
4. 提供具体的、可操作的情绪调节建议
5. 在必要时建议寻求专业心理咨询师的线下帮助

请用温和、自然的语气交流，像一位真正的咨询师一样对话。回复控制在200字以内。`;

// SSE 流式对话
export const streamChat = async (ctx: AuthContext, _next: Next) => {
  const body = ctx.request.body as Record<string, any> | undefined;
  const userMessage: string | undefined = body?.userMessage;
  const rawSessionId: string = String(body?.sessionId || "");

  if (!userMessage || !rawSessionId) {
    ctx.status = 400;
    ctx.body = { code: "400", message: "缺少 userMessage 或 sessionId 参数" };
    return;
  }

  // 去掉前端统一的 session_ 前缀，转为数据库整数 ID
  const sessionId = parseInt(
    rawSessionId.startsWith("session_")
      ? rawSessionId.slice(8)
      : rawSessionId,
  );

  if (isNaN(sessionId)) {
    ctx.status = 400;
    ctx.body = { code: "400", message: "sessionId 格式错误" };
    return;
  }

  // 设置 SSE 响应头
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  ctx.status = 200;
  ctx.respond = false;

  const res = ctx.res;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  let fullContent = "";

  try {
    // 1. 保存用户消息
    await ChatMessage.create({
      sessionId,
      senderType: 1,
      content: userMessage,
    });

    // 2. 加载历史消息
    const historyMessages = await ChatMessage.findAll({
      where: { sessionId },
      order: [["createdAt", "ASC"]],
      limit: 30,
    });

    // 3. 构建 DeepSeek messages 数组
    const deepseekMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];
    for (const msg of historyMessages) {
      const role = msg.senderType === 1 ? "user" : "assistant";
      deepseekMessages.push({ role, content: msg.content });
    }

    // 4. 调用 DeepSeek 流式 API
    const stream = await (openai.chat.completions.create as any)({
      model: "deepseek-v4-pro",
      messages: deepseekMessages,
      stream: true,
      thinking: { type: "enabled" },
      reasoning_effort: "high",
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullContent += content;
        res.write(
          `data: ${JSON.stringify({ code: "200", data: { content } })}\n\n`,
        );
      }
    }
    res.write(`event: done\ndata: done\n\n`);

    // 5. 保存 AI 回复
    if (fullContent) {
      await ChatMessage.create({
        sessionId,
        senderType: 2,
        content: fullContent,
      });
      await ChatSession.update(
        {
          lastMessageTime: new Date(),
          lastMessageContent: fullContent.slice(0, 200),
          messageCount: sequelize.literal("message_count + 1"),
        },
        { where: { id: sessionId } },
      );
    }
  } catch (error: any) {
    console.error("DeepSeek 流式错误:", error);
    res.write(
      `event: error\ndata: ${JSON.stringify({ code: "500", message: error.message })}\n\n`,
    );
  } finally {
    res.end();
  }
};
