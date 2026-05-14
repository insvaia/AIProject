import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

// 定义 User 接口属性
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  nickname: string;
  phone: string;
  password: string;
  gender: number; // 1 男 2 女
  userType: number; // 权限，默认 1
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时可选的字段（id 自增，不需要传）
export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id"
> {}

// 定义 User 模型类
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  public nickname!: string;
  public phone!: string;
  public password!: string;
  public gender!: number;
  public userType!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "用户名",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "邮箱",
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "昵称",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: "手机号",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "密码（加密存储）",
    },
    gender: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "性别（1 男 2 女）",
    },
    userType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "用户类型（1 普通用户）",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    underscored: true, // 使用下划线命名（created_at, updated_at）
  },
);

export default User;
