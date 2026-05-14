import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";
import ArticleContent from "./ArticleContent";

export interface KnowledgeAttributes {
  id: number;
  title: string;
  coverImage: string;
  categoryId: number;
  summary: string;
  tags: string;
  authorName: string;
  readCount: number;
  status: number; // 0 草稿 1 已发布 2 未发布
  publishedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KnowledgeCreationAttributes
  extends Optional<KnowledgeAttributes, "id" | "readCount" | "publishedAt"> {}

class Knowledge
  extends Model<KnowledgeAttributes, KnowledgeCreationAttributes>
  implements KnowledgeAttributes
{
  public id!: number;
  public title!: string;
  public coverImage!: string;
  public categoryId!: number;
  public summary!: string;
  public tags!: string;
  public authorName!: string;
  public readCount!: number;
  public status!: number;
  public publishedAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联 ArticleContent
  public articleContent?: ArticleContent;
}

Knowledge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "文章标题",
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "封面图片路径",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "分类ID",
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "文章摘要",
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "标签（逗号分隔）",
    },
    authorName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "管理员",
      comment: "作者名称",
    },
    readCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "阅读量",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "状态（0 草稿 1 已发布 2 未发布）",
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "发布时间",
    },
  },
  {
    sequelize,
    tableName: "knowledge_articles",
    timestamps: true,
    underscored: true,
  }
);

// 建立关联：Knowledge 1:1 ArticleContent
Knowledge.hasOne(ArticleContent, {
  sourceKey: "id",
  foreignKey: "articleId",
  as: "articleContent",
  onDelete: "CASCADE",
});

ArticleContent.belongsTo(Knowledge, {
  foreignKey: "articleId",
  targetKey: "id",
});

export default Knowledge;
