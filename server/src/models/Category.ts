import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

export interface CategoryAttributes {
  id: number;
  categoryName: string;
  parentId: number;
  sort: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryCreationAttributes
  extends Optional<CategoryAttributes, "id" | "parentId" | "sort"> {}

class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public categoryName!: string;
  public parentId!: number;
  public sort!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "分类名称",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "父级分类ID（0 表示顶级分类）",
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "排序",
    },
  },
  {
    sequelize,
    tableName: "knowledge_categories",
    timestamps: true,
    underscored: true,
  }
);

export default Category;
