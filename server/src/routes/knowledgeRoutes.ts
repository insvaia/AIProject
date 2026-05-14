import Router from "@koa/router";
import {
  categoryTree,
  articlePage,
  createArticle,
  getArticleDetail,
  updateArticle,
  changeArticleStatus,
  deleteArticle,
} from "../controllers/knowledgeController";

const knowledgeRouter = new Router({
  prefix: "/knowledge",
});

// 分类树
knowledgeRouter.get("/category/tree", categoryTree);

// 文章分页
knowledgeRouter.get("/article/page", articlePage);

// 创建文章
knowledgeRouter.post("/article", createArticle);

// 文章详情
knowledgeRouter.get("/article/:id", getArticleDetail);

// 更新文章
knowledgeRouter.put("/article/:id", updateArticle);

// 修改文章状态（发布/下线）
knowledgeRouter.put("/article/:id/status", changeArticleStatus);

// 删除文章
knowledgeRouter.delete("/article/:id", deleteArticle);

export default knowledgeRouter;
