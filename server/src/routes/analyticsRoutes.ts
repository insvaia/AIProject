import Router from "@koa/router";
import { getAnalyticsOverview } from "../controllers/analyticsController";
import authMiddleware from "../middleware/auth";

const analyticsRouter = new Router({
  prefix: "/data-analytics",
});

analyticsRouter.get("/overview", authMiddleware(), getAnalyticsOverview);

export default analyticsRouter;
