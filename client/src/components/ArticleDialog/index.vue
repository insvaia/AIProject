<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑文章' : '创建文章'"
    width="50%"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入文章标题"
          maxlength="100"
          show-word-limit
          clearable
        />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择分类">
          <el-option
            v-for="item in props.categories"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文章摘要" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          placeholder="请输入文章摘要(可选)"
          maxlength="1000"
          show-word-limit
          :rows="4"
          clearable
        />
      </el-form-item>
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="formData.tagArray"
          multiple
          placeholder="请选择标签(逗号分隔)"
          filterable
          allow-create
          style="width: 100%"
        >
          <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="封面图片">
        <div class="cover-upload">
          <el-upload
            class="avatar-uploader"
            action="#"
            :before-upload="beforeUpload"
            :http-request="handleUploadRequest"
            :show-file-list="false"
            accept="image/*"
          >
            <div class="cover-placeholder" v-if="!imgUrl">
              <p>点击上传图片</p>
            </div>
            <img v-else :src="imgUrl" class="cover-img" alt="图片封面" />
          </el-upload>
          <div v-if="imgUrl" class="cover-remove">
            <el-button type="danger" size="small" @click="handleDeleteCover"
              >移除封面</el-button
            >
          </div>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <RichTextEditor
          v-model="formData.content"
          placeholder="请输入文章内容,支持富文本格式\n\n可以使用加粗、斜体、列表、链接等功能来丰富文章内容"
          :maxCharCount="5000"
          @change="handleContentChange"
          @created="handleEditorCreated"
          min-height="400px"
        />
      </el-form-item>
    </el-form>
    <div v-if="btnPreview">
      <h3>内容预览</h3>
      <div v-html="formData.content"></div>
    </div>
    <template #footer>
      <el-button @click="btnPreview = !btnPreview">
        {{ btnPreview ? "隐藏预览" : "预览效果" }}
      </el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? "更新文章" : "创建文章" }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, nextTick, watch } from "vue";
import { ElMessage } from "element-plus";
import { uploadFile, createArticle, updateArticle } from "@/api/admin.js";
import { fileBaseURL } from "@/config";
import RichTextEditor from "@/components/RichTextEditor/index.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  article: {
    type: Object,
    default: null,
  },
});

// 表单数据
const formData = reactive({
  title: "",
  content: "",
  coverImage: "",
  categoryId: 1,
  summary: "",
  tags: "",
  id: "",
  tagArray: [],
});

const commonTags = [
  "情绪管理",
  "焦虑",
  "抑郁",
  "压力",
  "睡眠",
  "冥想",
  "正念",
  "放松",
  "心理健康",
  "自我成长",
  "人际关系",
  "工作压力",
  "学习方法",
  "生活技巧",
];

const rules = reactive({
  title: [
    { required: true, message: "请输入文章标题", trigger: "blur" },
    { max: 100, message: "文章标题不能超过100个字符", trigger: "blur" },
  ],
  categoryId: [
    { required: true, message: "请选择文章分类", trigger: "change" },
  ],
  content: [
    { required: true, message: "请输入文章内容", trigger: "blur" },
    { max: 5000, message: "文章内容不能超过5000个字符", trigger: "blur" },
  ],
});

const emit = defineEmits(["update:modelValue", "success"]);

const dialogVisible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const isEdit = computed(() => {
  return !!props.article?.id;
});

const handleClose = () => {
  // 重置表单
  formRef.value.resetFields();
  // 重置ID
  businessId.value = null;
  // 重置标签
  formData.tagArray = [];
  // 重置封面和图片
  handleDeleteCover();
  // 关闭对话框
  emit("update:modelValue", false);
};

watch(
  () => props.article,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        Object.assign(formData, newVal);
        businessId.value = newVal.id;
        // 封面url
        imgUrl.value = fileBaseURL + newVal.coverImage;
      });
    }
  },
);

const imgUrl = ref("");

const beforeUpload = (file) => {
  // 针对上传前文件的校验
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error("只能上传图片文件");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB");
    return false;
  }
  return true;
};

const businessId = ref(null);

const handleUploadRequest = async ({ file }) => {
  // 设置uuid为唯一标识
  businessId.value = crypto.randomUUID();
  const fileRes = await uploadFile(file, {
    businessId: businessId.value,
  });
  imgUrl.value = fileBaseURL + fileRes.filePath;
  formData.coverImage = fileRes.filePath;
};

const handleDeleteCover = () => {
  imgUrl.value = "";
  formData.coverImage = "";
};

const handleContentChange = (data) => {
  formData.content = data.html;
};

const editorInstance = ref(null);
// 创建完成之后要做的事情
const handleEditorCreated = (editor) => {
  editorInstance.value = editor;
  // 编辑
  if (formData.content && editor) {
    nextTick(() => {
      editor.setHtml(formData.content);
    });
  }
};

const btnPreview = ref(false);

const loading = ref(false);
const formRef = ref();
const handleSubmit = () => {
  formRef.value.validate(async (valid, fields) => {
    if (!valid) {
      ElMessage.error("请完善表单信息");
      return;
    }

    loading.value = true;
    const submitData = {
      ...formData,
      tags: Array.isArray(formData.tagArray) ? formData.tagArray.join(",") : "",
    };
    delete submitData.tagArray;

    if (!isEdit.value) {
      submitData.id = businessId.value;
      createArticle(submitData)
        .then(() => {
          ElMessage.success("文章创建成功");
          loading.value = false;
          handleClose();
          handleDeleteCover();
          emit("success");
        })
        .catch(() => {
          loading.value = false;
        });
    } else {
      updateArticle(props.article.id, submitData)
        .then(() => {
          ElMessage.success("文章更新成功");
          loading.value = false;
          handleClose();
          handleDeleteCover();
          emit("success");
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
};
</script>

<style scoped lang="scss">
.cover-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

:deep(.avatar-uploader .el-upload) {
  width: 200px;
  height: 120px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  background: #f6f8fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #8b949e;
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: var(--el-color-primary);
}

.cover-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.cover-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
</style>
