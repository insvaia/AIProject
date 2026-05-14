<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="handleEdit({})">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" stripe style="width: 100%; margin-top: 25px">
      <el-table-column label="文章标题" width="470" fixed="left">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon><Timer /></el-icon>
            <span>{{ scope.row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="200">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ categoryMap[scope.row.categoryId] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="250" />
      <el-table-column prop="readCount" label="阅读量" width="250" />
      <el-table-column prop="updatedAt" label="发布时间" width="250" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="scope">
          <el-button text type="primary" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            v-if="scope.row.status === 0 || scope.row.status == 2"
            text
            type="success"
            @click="handlePublish(scope.row)"
            >发布</el-button
          >
          <el-button
            v-if="scope.row.status === 1"
            text
            type="success"
            @click="handleUnPublish(scope.row)"
            >下线</el-button
          >
          <el-button text type="danger" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 25px"
      layout="prev, pager, next"
      :page-size="pagination.size"
      :total="pagination.total"
      @change="handleChange"
    />
    <ArticleDialog
      v-model:modelValue="dialogVisibgle"
      :categories="categoryList"
      :dialogVisibgle="dialogVisibgle"
      :article="currentArticle"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import PageHead from "@/components/PageHead/index.vue";
import TableSearch from "@/components/TableSearch/index.vue";
import ArticleDialog from "@/components/ArticleDialog/index.vue";
import { Timer } from "@element-plus/icons-vue";
import {
  categoryTree,
  articlePage,
  getArticleDetail,
  ChangeArticleStatus,
  deleteArticle,
} from "@/api/admin";
import { ElMessageBox, ElMessage } from "element-plus";

const formItem = [
  {
    comp: "input",
    prop: "title",
    label: "文章标题",
    placeholder: "请输入文章标题",
  },
  {
    comp: "select",
    prop: "category",
    label: "文章分类",
    placeholder: "请选择文章分类",
  },
  {
    comp: "select",
    prop: "category",
    label: "文章分类",
    placeholder: "请选择文章分类",
    options: [
      {
        label: "草稿",
        value: 0,
      },
      {
        label: "已发布",
        value: 1,
      },
      {
        label: "未发布",
        value: 2,
      },
    ],
  },
];

const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0,
});

const tableData = ref([]);

const handleSearch = async (formData) => {
  const params = {
    ...pagination,
    ...formData,
  };
  const { records, total } = await articlePage(params);
  tableData.value = records;
  pagination.total = total;
};

// 分类映射
const categoryMap = reactive({});
// 分类列表
const categoryList = ref([]);

onMounted(async () => {
  const data = await categoryTree();
  console.log(data);
  categoryList.value = data.map((item) => {
    categoryMap[item.id] = item.categoryName;
    return {
      label: item.categoryName,
      value: item.id,
    };
  });
  formItem[1].options = categoryList.value;
});

const handleChange = (page) => {
  pagination.currentPage = page;
  handleSearch();
};

const handleSuccess = () => {
  dialogVisibgle.value = false;
  // 刷新列表
  handleSearch();
};

const handlePublish = (row) => {
  ElMessageBox.confirm(`确定要发布文章${row.title}吗？`, "确认", {
    confirmButtonText: "确定发布",
    cancelButtonText: "取消",
    type: "info",
  }).then(() => {
    ChangeArticleStatus(row.id, { status: 1 }).then(() => {
      ElMessage.success("文章发布成功");
      handleSearch();
    });
  });
};

const handleUnPublish = (row) => {
  ElMessageBox.confirm(`确定要下线文章${row.title}吗？`, "确认", {
    confirmButtonText: "确定下线",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ChangeArticleStatus(row.id, { status: 2 }).then(() => {
      ElMessage.success("文章下线成功");
      handleSearch();
    });
  });
};
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除文章${row.title}吗？`, "确认", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "danger",
  }).then(() => {
    deleteArticle(row.id).then(() => {
      ElMessage.success("文章删除成功");
      handleSearch();
    });
  });
};

const dialogVisibgle = ref(false);
const currentArticle = ref(null);
const handleEdit = (row) => {
  if (!row.id) {
    currentArticle.value = null;
    dialogVisibgle.value = true;
  } else {
    getArticleDetail(row.id).then((res) => {
      currentArticle.value = res;
      dialogVisibgle.value = true;
    });
  }
};
</script>

<style scoped lang="scss"></style>
