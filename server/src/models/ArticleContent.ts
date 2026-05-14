import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

export interface ArticleContentAttributes {
  id: number;
  articleId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ArticleContentCreationAttributes
  extends Optional<ArticleContentAttributes, "id"> {}

class ArticleContent
  extends Model<ArticleContentAttributes, ArticleContentCreationAttributes>
  implements ArticleContentAttributes
{
  public id!: number;
  public articleId!: number;
  public content!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ArticleContent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: "关联文章ID",
      references: {
        model: "knowledge_articles",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
      comment: "文章内容（富文本HTML）",
    },
  },
  {
    sequelize,
    tableName: "article_contents",
    timestamps: true,
    underscored: true,
  }
);

export default ArticleContent;
