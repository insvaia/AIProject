import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

export interface ChatMessageAttributes {
  id: number;
  sessionId: number;
  senderType: number; // 1 用户 2 AI
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessageCreationAttributes
  extends Optional<ChatMessageAttributes, "id"> {}

class ChatMessage
  extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>
  implements ChatMessageAttributes
{
  public id!: number;
  public sessionId!: number;
  public senderType!: number;
  public content!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "会话ID",
    },
    senderType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "发送者类型（1 用户 2 AI）",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "消息内容",
    },
  },
  {
    sequelize,
    tableName: "chat_messages",
    timestamps: true,
    underscored: true,
  }
);

export default ChatMessage;
