import { Context } from "koa";
import { fn, col, literal } from "sequelize";
import User from "../models/User";
import EmotionDiary from "../models/EmotionDiary";
import ChatSession from "../models/ChatSession";

export const getAnalyticsOverview = async (ctx: Context) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // 系统概览统计
    const totalUsers = await User.count();
    const totalDiaries = await EmotionDiary.count();
    const todayNewDiaries = await EmotionDiary.count({
      where: literal(`DATE(created_at) = '${todayStr}'`),
    });
    const totalSessions = await ChatSession.count();
    const todayNewSessions = await ChatSession.count({
      where: literal(`DATE(created_at) = '${todayStr}'`),
    });

    // 活跃用户（近7天有日记或会话的用户）
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const activeDiaryUsers = await EmotionDiary.findAll({
      attributes: [[fn("DISTINCT", col("user_id")), "userId"]],
      where: literal(`DATE(created_at) >= '${sevenDaysAgo}'`),
      raw: true,
    });
    const activeChatUsers = await ChatSession.findAll({
      attributes: [[fn("DISTINCT", col("user_id")), "userId"]],
      where: literal(`DATE(created_at) >= '${sevenDaysAgo}'`),
      raw: true,
    });
    const activeUserIds = new Set([
      ...activeDiaryUsers.map((u: any) => u.userId),
      ...activeChatUsers.map((u: any) => u.userId),
    ]);
    const activeUsers = activeUserIds.size;

    // 平均情绪评分
    const avgResult = await EmotionDiary.findOne({
      attributes: [[fn("AVG", col("mood_score")), "avgScore"]],
      raw: true,
    });
    const rawScore = Number((avgResult as any).avgScore) || 0;
    const avgMoodScore = Math.round(rawScore * 10) / 10;

    const systemOverview = {
      totalUsers,
      activeUsers,
      totalDiaries,
      todayNewDiaries,
      totalSessions,
      todayNewSessions,
      avgMoodScore,
    };

    // 情绪趋势（近7天）
    const emotionTrend: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const dayResult = await EmotionDiary.findOne({
        attributes: [
          [fn("AVG", col("mood_score")), "avgMoodScore"],
          [fn("COUNT", col("id")), "recordCount"],
        ],
        where: literal(`DATE(created_at) = '${dateStr}'`),
        raw: true,
      });
      const trendRawScore = dayResult ? Number((dayResult as any).avgMoodScore) || 0 : 0;
      emotionTrend.push({
        date: dateStr,
        avgMoodScore: Math.round(trendRawScore * 10) / 10,
        recordCount: dayResult ? (dayResult as any).recordCount : 0,
      });
    }

    // 咨询统计
    const avgDurationResult = await ChatSession.findOne({
      attributes: [[fn("AVG", col("duration_minutes")), "avgDuration"]],
      raw: true,
    });
    const avgDurationMinutes = avgDurationResult
      ? Math.round((avgDurationResult as any).avgDuration || 0)
      : 0;

    const dailyTrend: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const dayResult = await ChatSession.findOne({
        attributes: [
          [fn("COUNT", col("id")), "sessionCount"],
          [fn("COUNT", fn("DISTINCT", col("user_id"))), "userCount"],
        ],
        where: literal(`DATE(created_at) = '${dateStr}'`),
        raw: true,
      });
      dailyTrend.push({
        date: dateStr,
        sessionCount: dayResult ? (dayResult as any).sessionCount : 0,
        userCount: dayResult ? (dayResult as any).userCount : 0,
      });
    }

    const consultationStats = {
      totalSessions,
      avgDurationMinutes,
      dailyTrend,
    };

    // 用户活跃度趋势（近7天）
    const userActivity: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];

      const newUserCount = await User.count({
        where: literal(`DATE(created_at) = '${dateStr}'`),
      });

      const diaryUsersResult = await EmotionDiary.findAll({
        attributes: [[fn("DISTINCT", col("user_id")), "userId"]],
        where: literal(`DATE(created_at) = '${dateStr}'`),
        raw: true,
      });

      const chatUsersResult = await ChatSession.findAll({
        attributes: [[fn("DISTINCT", col("user_id")), "userId"]],
        where: literal(`DATE(created_at) = '${dateStr}'`),
        raw: true,
      });

      const allActiveIds = new Set([
        ...diaryUsersResult.map((u: any) => u.userId),
        ...chatUsersResult.map((u: any) => u.userId),
      ]);

      userActivity.push({
        date: dateStr,
        activeUsers: allActiveIds.size,
        newUsers: newUserCount,
        diaryUsers: diaryUsersResult.length,
        consultationUsers: chatUsersResult.length,
      });
    }

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "查询成功",
      data: {
        systemOverview,
        emotionTrend,
        consultationStats,
        userActivity,
      },
    };
  } catch (error) {
    console.error("获取数据概览失败:", error);
    ctx.status = 200;
    ctx.body = { code: "500", message: "获取数据概览失败，服务器内部错误" };
  }
};
