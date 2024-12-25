<template>
  <div class="flex justify-center items-center py-4">
    <el-pagination
      v-model:currentPage="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :background="true"
      :total="total"
      :disabled="disabled"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
      <template #default="{ default: defaultSlot }">
        <div class="flex items-center space-x-2">
          {{ defaultSlot }}
        </div>
      </template>
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "PaginationComponent",
  props: {
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    initialPageSize: {
      type: Number,
      default: 10,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentPage: 1,
      pageSize: this.initialPageSize,
    };
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page;
      this.$emit("page-changed", {
        page,
        pageSize: this.pageSize,
      });
    },
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1; // 重置到第一页
      this.$emit("page-changed", {
        page: 1,
        pageSize: size,
      });
    },
  },
  watch: {
    // 监听外部total变化，如果total变小可能需要调整currentPage
    total(newVal) {
      const maxPage = Math.ceil(newVal / this.pageSize);
      if (this.currentPage > maxPage) {
        this.currentPage = Math.max(1, maxPage);
      }
    },
  },
};
</script>

<style scoped>
:deep(.el-pagination) {
  --el-pagination-hover-color: #409eff;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #409eff;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #409eff;
}

/* 适配移动端 */
@media (max-width: 640px) {
  :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
