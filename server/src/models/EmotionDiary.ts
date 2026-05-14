import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

export interface EmotionDiaryAttributes {
  id: number;
  userId: number;
  username: string;
  nickname: string;
  diaryDate: string;
  moodScore: number;
  dominantEmotion: string;
  emotionTriggers: string;
  diaryContent: string;
  sleepQuality: number;
  stressLevel: number;
  aiEmotionAnalysis: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmotionDiaryCreationAttributes
  extends Optional<
    EmotionDiaryAttributes,
    "id" | "aiEmotionAnalysis" | "username" | "nickname"
  > {}

class EmotionDiary
  extends Model<EmotionDiaryAttributes, EmotionDiaryCreationAttributes>
  implements EmotionDiaryAttributes
{
  public id!: number;
  public userId!: number;
  public username!: string;
  public nickname!: string;
  public diaryDate!: string;
  public moodScore!: number;
  public dominantEmotion!: string;
  public emotionTriggers!: string;
  public diaryContent!: string;
  public sleepQuality!: number;
  public stressLevel!: number;
  public aiEmotionAnalysis!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmotionDiary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "用户ID",
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "用户名（冗余）",
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "用户昵称（冗余）",
    },
    diaryDate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "日记日期（YYYY-MM-DD）",
    },
    moodScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "情绪评分（1-10）",
    },
    dominantEmotion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "主要情绪",
    },
    emotionTriggers: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "情绪触发因素",
    },
    diaryContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "日记内容",
    },
    sleepQuality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "睡眠质量（1-5）",
    },
    stressLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "压力水平（1-5）",
    },
    aiEmotionAnalysis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AI情绪分析结果（JSON字符串）",
    },
  },
  {
    sequelize,
    tableName: "emotion_diaries",
    timestamps: true,
    underscored: true,
  }
);

export default EmotionDiary;
