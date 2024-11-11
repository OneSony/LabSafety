<template>
  <el-pagination
    background
    layout="prev, pager, next"
    :page-size="10"
    :total="total"
    @current-change="handlePageChange"
  />
</template>

<script>
export default {
  name: "PaginationComponent",
  props: {
    total: Number,
  },
  methods: {
    handlePageChange(page) {
      this.$emit("page-changed", page);
    },
  },
};
</script>
