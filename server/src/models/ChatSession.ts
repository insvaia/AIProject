import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

export interface ChatSessionAttributes {
  id: number;
  userId: number;
  sessionTitle: string;
  status: string;
  lastMessageContent: string;
  messageCount: number;
  durationMinutes: number;
  startedAt: Date;
  lastMessageTime: Date;
  userNickname: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatSessionCreationAttributes
  extends Optional<
    ChatSessionAttributes,
    "id" | "lastMessageContent" | "messageCount" | "durationMinutes" | "lastMessageTime" | "userNickname"
  > {}

class ChatSession
  extends Model<ChatSessionAttributes, ChatSessionCreationAttributes>
  implements ChatSessionAttributes
{
  public id!: number;
  public userId!: number;
  public sessionTitle!: string;
  public status!: string;
  public lastMessageContent!: string;
  public messageCount!: number;
  public durationMinutes!: number;
  public startedAt!: Date;
  public lastMessageTime!: Date;
  public userNickname!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatSession.init(
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
    sessionTitle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "会话标题",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "ACTIVE",
      comment: "会话状态（ACTIVE/CLOSED）",
    },
    lastMessageContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "最后一条消息内容",
    },
    messageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "消息数量",
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "会话时长（分钟）",
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "会话开始时间",
    },
    lastMessageTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "最后消息时间",
    },
    userNickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "用户昵称（冗余）",
    },
  },
  {
    sequelize,
    tableName: "chat_sessions",
    timestamps: true,
    underscored: true,
  }
);

export default ChatSession;
