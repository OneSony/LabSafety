<template>
  <div>
    <el-button type="primary" @click="openGuidelineDialog"
      >添加安全准则</el-button
    >
    <el-table :data="guidelines" style="width: 100%">
      <el-table-column prop="content" label="安全准则内容" />
      <el-table-column prop="tag" label="标签" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="editGuideline(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteGuideline(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 安全准则弹窗 -->
    <el-dialog v-model="isDialogVisible" title="添加安全准则">
      <el-form :model="form">
        <el-form-item label="准则内容">
          <el-input type="textarea" v-model="form.content" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tag">
            <el-option label="安全" value="安全"></el-option>
            <el-option label="操作" value="操作"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 使用 template #footer 替代 slot 属性 -->
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGuideline">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      guidelines: [],
      isDialogVisible: false,
      form: {
        content: "",
        tag: "",
      },
    };
  },
  methods: {
    fetchGuidelines() {
      axios.get("/api/guidelines").then((response) => {
        this.guidelines = response.data;
      });
    },
    saveGuideline() {
      axios.post("/api/guidelines", this.form).then(() => {
        this.isDialogVisible = false;
        this.fetchGuidelines();
      });
    },
    deleteGuideline(id) {
      axios.delete(`/api/guidelines/${id}`).then(() => {
        this.fetchGuidelines();
      });
    },
    editGuideline(guideline) {
      this.form = { ...guideline };
      this.isDialogVisible = true;
    },
  },
  created() {
    this.fetchGuidelines();
  },
};
</script>
