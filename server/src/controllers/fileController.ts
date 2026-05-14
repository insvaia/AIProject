import { Context } from "koa";
import path from "path";
import fs from "fs";

export const uploadFile = async (ctx: Context) => {
  try {
    const files = (ctx.request as any).files;
    if (!files || !files.file) {
      ctx.status = 200;
      ctx.body = {
        code: "BUSINESS_ERROR",
        message: "请选择要上传的文件",
      };
      return;
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const ext = path.extname(file.originalFilename || file.newFilename);
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;

    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const destPath = path.join(uploadDir, filename);
    const reader = fs.createReadStream(file.filepath);
    const writer = fs.createWriteStream(destPath);
    await new Promise<void>((resolve, reject) => {
      reader.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const filePath = `/uploads/${filename}`;

    ctx.status = 200;
    ctx.body = {
      code: "200",
      message: "文件上传成功",
      data: {
        filePath,
        fileName: filename,
        originalName: file.originalFilename || filename,
      },
    };
  } catch (error) {
    console.error("文件上传失败:", error);
    ctx.status = 200;
    ctx.body = {
      code: "500",
      message: "文件上传失败，服务器内部错误",
    };
  }
};
