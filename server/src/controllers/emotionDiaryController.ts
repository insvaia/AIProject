import { Context } from "koa";
import { Op } from "sequelize";
import EmotionDiary from "../models/EmotionDiary";
import { AuthContext } from "../middleware/auth";

// 用户新增情绪日记
export const addEmotionDiary = async (ctx: AuthContext) => {
  try {
    const {
      diaryDate,
      moodScore,
      dominantEmotion,
      emotionTriggers,
      diaryContent,
      sleepQuality,
      stressLevel,
    } = ctx.request.body as any;

    const userId = ctx.currentUser?.id;
    if (!userId) {
      ctx.status = 200;
      ctx.body = { code: "401", message: "请先登录" };
      return;
    }

    if (!diaryDate || moodScore === undefined || moodScore === null) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "请填写必填字段（日期、情绪评分）",
      };
      return;
    }

    // 生成模拟 AI 分析结果
    const aiAnalysis = {
      primaryEmotion: dominantEmotion || "未指定",
      score: moodScore * 10,
      isNegative: moodScore <= 5,
      riskLevel: moodScore <= 3 ? 2 : moodScore <= 5 ? 1 : 0,
      riskDescription:
        moodScore <= 3
          ? "情绪评分较低，建议持续关注并寻求支持。"
          : moodScore <= 5
          ? "情绪状态一般，建议保持积极的生活方式。"
          : "情绪状态良好，保持现状。",
      suggestion:
        moodScore <= 3
          ? "您今天的情绪状态需要关注，建议与信任的朋友或专业人士交流。"
          : moodScore <= 5
          ? "情绪有波动是正常的，试着做一些让自己放松的事情。"
          : "继续保持积极心态！记录下让您开心的事情。",
      improvementSuggestions:
        moodScore <= 3
          ? ["与亲友交流感受", "进行轻度运动", "保证充足睡眠", "尝试正念冥想", "记录情绪变化"]
          : moodScore <= 5
          ? ["规律作息", "适度户外活动", "培养兴趣爱好", "与朋友小聚"]
          : ["记录感恩日记", "帮助他人", "学习新技能", "享受当下"],
    };

    const diary = await EmotionDiary.create({
      userId,
      username: ctx.currentUser?.username || "",
      nickname: ctx.currentUser?.username || "",
      diaryDate,
      moodScore,
      dominantEmotion: dominantEmotion || "",
      emotionTriggers: emotionTriggers || "",
      diaryContent: diaryContent || "",
      sleepQuality: sleepQuality || 3,
      stressLevel: stressLevel || 3,
      aiEmotionAnalysis: JSON.stringify(aiAnalysis),
    });

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "情绪日记记录成功",
      data: diary,
    };
  } catch (error) {
    console.error("保存情绪日记失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "保存情绪日记失败，服务器内部错误" };
  }
};

// 管理端 - 分页查询情绪日记
export const getEmotionalPage = async (ctx: Context) => {
  try {
    const {
      currentPage = 1,
      size = 10,
      userId,
      moodScoreRange,
    } = ctx.query as any;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }
    if (moodScoreRange) {
      const [min, max] = moodScoreRange.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        where.moodScore = { [Op.between]: [min, max] };
      }
    }

    const page = parseInt(currentPage);
    const pageSize = parseInt(size);

    const { count, rows } = await EmotionDiary.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "查询成功",
      data: {
        records: rows,
        total: count,
        currentPage: page,
        size: pageSize,
      },
    };
  } catch (error) {
    console.error("查询情绪日记列表失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "查询情绪日记列表失败，服务器内部错误" };
  }
};

// 管理端 - 删除情绪日记
export const deleteEmotional = async (ctx: Context) => {
  try {
    const { id } = ctx.params;

    const diary = await EmotionDiary.findByPk(parseInt(id));
    if (!diary) {
      ctx.status = 200;
      ctx.body = { code: "404", message: "情绪日记不存在" };
      return;
    }

    await diary.destroy();

    ctx.status = 200;
    ctx.body = { code: "200", message: "删除成功" };
  } catch (error) {
    console.error("删除情绪日记失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "删除情绪日记失败，服务器内部错误" };
  }
};
