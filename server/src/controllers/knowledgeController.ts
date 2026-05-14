import { Context } from "koa";
import { Op } from "sequelize";
import Knowledge from "../models/Knowledge";
import ArticleContent from "../models/ArticleContent";
import Category from "../models/Category";

// ==================== 分类接口 ====================

export const categoryTree = async (ctx: Context) => {
  try {
    const categories = await Category.findAll({
      order: [["sort", "ASC"]],
    });

    const buildTree = (parentId: number): any[] => {
      return categories
        .filter((c) => c.parentId === parentId)
        .map((c) => ({
          id: c.id,
          categoryName: c.categoryName,
          parentId: c.parentId,
          sort: c.sort,
          children: buildTree(c.id),
        }));
    };

    const tree = buildTree(0);

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "获取分类树成功",
      data: tree.length > 0 ? tree : categories.map((c) => ({
        id: c.id,
        categoryName: c.categoryName,
        parentId: c.parentId,
        sort: c.sort,
        children: [],
      })),
    };
  } catch (error) {
    console.error("获取分类树失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "获取分类树失败，服务器内部错误",
    };
  }
};

// ==================== 文章接口 ====================

// 分页查询文章列表（不加载 content，性能更优）
export const articlePage = async (ctx: Context) => {
  try {
    const {
      currentPage = 1,
      size = 10,
      title,
      category,
      status,
      sortField,
      sortDirection,
    } = ctx.query as any;

    const where: any = {};

    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }
    if (category) {
      where.categoryId = category;
    }
    if (status !== undefined && status !== "" && status !== null) {
      where.status = status;
    }

    const order: any[] = [];
    if (sortField) {
      order.push([
        sortField === "publishedAt" ? "published_at" : sortField,
        sortDirection === "asc" ? "ASC" : "DESC",
      ]);
    } else {
      order.push(["updated_at", "DESC"]);
    }

    const page = parseInt(currentPage);
    const pageSize = parseInt(size);

    const { count, rows } = await Knowledge.findAndCountAll({
      where,
      order,
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
    console.error("查询文章列表失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "查询文章列表失败，服务器内部错误",
    };
  }
};

// 创建文章
export const createArticle = async (ctx: Context) => {
  try {
    const {
      title,
      content,
      coverImage,
      categoryId,
      summary,
      tags,
      authorName,
      status = 0,
    } = ctx.request.body as any;

    if (!title || !content) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "文章标题和内容不能为空",
      };
      return;
    }

    const article = await Knowledge.create({
      title,
      coverImage: coverImage || "",
      categoryId: categoryId || 1,
      summary: summary || "",
      tags: tags || "",
      authorName: authorName || "管理员",
      status,
      publishedAt: status === 1 ? new Date() : null,
    });

    // 内容存入独立表
    await ArticleContent.create({
      articleId: article.id,
      content,
    });

    ctx.status = 201;
    ctx.body = {
      code: "200",
      message: "文章创建成功",
      data: { ...article.toJSON(), content },
    };
  } catch (error) {
    console.error("创建文章失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "创建文章失败，服务器内部错误",
    };
  }
};

// 获取文章详情（加载 content）
export const getArticleDetail = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const article = await Knowledge.findByPk(id, {
      include: [{ model: ArticleContent, as: "articleContent" }],
    });

    if (!article) {
      ctx.status = 200;
      ctx.body = {
        code: "404",
        message: "文章不存在",
      };
      return;
    }

    // 阅读量 +1
    await article.increment("readCount");

    // 扁平化返回，content 提到顶层
    const result = article.toJSON() as any;
    result.content = result.articleContent?.content || "";
    delete result.articleContent;

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "获取文章详情成功",
      data: result,
    };
  } catch (error) {
    console.error("获取文章详情失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "获取文章详情失败，服务器内部错误",
    };
  }
};

// 更新文章
export const updateArticle = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const {
      title,
      content,
      coverImage,
      categoryId,
      summary,
      tags,
      authorName,
      status,
    } = ctx.request.body as any;

    const article = await Knowledge.findByPk(id);
    if (!article) {
      ctx.status = 200;
      ctx.body = {
        code: "404",
        message: "文章不存在",
      };
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (summary !== undefined) updateData.summary = summary;
    if (tags !== undefined) updateData.tags = tags;
    if (authorName !== undefined) updateData.authorName = authorName;
    if (status !== undefined) updateData.status = status;

    if (status === 1 && article.status !== 1) {
      updateData.publishedAt = new Date();
    }

    await article.update(updateData);

    // 更新文章内容
    if (content !== undefined) {
      await ArticleContent.upsert({ articleId: parseInt(id), content });
    }

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "文章更新成功",
      data: { ...article.toJSON(), content },
    };
  } catch (error) {
    console.error("更新文章失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "更新文章失败，服务器内部错误",
    };
  }
};

// 修改文章状态（发布/下线）
export const changeArticleStatus = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const { status } = ctx.request.body as any;

    if (![0, 1, 2].includes(status)) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "状态值无效（0 草稿 1 已发布 2 未发布）",
      };
      return;
    }

    const article = await Knowledge.findByPk(id);
    if (!article) {
      ctx.status = 200;
      ctx.body = {
        code: "404",
        message: "文章不存在",
      };
      return;
    }

    const updateData: any = { status };
    if (status === 1) {
      updateData.publishedAt = new Date();
    }

    await article.update(updateData);

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: status === 1 ? "文章发布成功" : "文章已下线",
      data: article,
    };
  } catch (error) {
    console.error("修改文章状态失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "修改文章状态失败，服务器内部错误",
    };
  }
};

// 删除文章
export const deleteArticle = async (ctx: Context) => {
  try {
    const { id } = ctx.params;

    const article = await Knowledge.findByPk(id);
    if (!article) {
      ctx.status = 200;
      ctx.body = {
        code: "404",
        message: "文章不存在",
      };
      return;
    }

    // 先删内容再删文章
    await ArticleContent.destroy({ where: { articleId: id } });
    await article.destroy();

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "文章删除成功",
    };
  } catch (error) {
    console.error("删除文章失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "删除文章失败，服务器内部错误",
    };
  }
};
