<template>
  <el-table
    :data="tableData"
    style="width: 100%"
    :row-class-name="tableRowClassName"
  >
    <el-table-column prop="date" label="文件名" width="280" />
    <el-table-column prop="name" label="课程名" width="180" />
    <el-table-column prop="name" label="课堂名" width="180" />
    <el-table-column prop="name" label="上课时间" width="180" />
    <el-table-column fixed="right" label="操作">
      <template v-slot="slotProps">
        <el-button
          @click="handleRowClick(slotProps.row)"
          type="text"
          size="small"
          >下载</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
export default {
  name: "StudentFilePanel",
  setup() {
    const tableData = [
      {
        date: "2021-09-01",
        name: "文件1",
        address: "课程1",
      },
      {
        date: "2021-09-02",
        name: "文件2",
        address: "课程2",
      },
      {
        date: "2021-09-03",
        name: "文件3",
        address: "课程3",
      },
    ];

    const handleRowClick = (row: any) => {
      console.log("Download file:", row);
    };

    const tableRowClassName = ({
      row,
      rowIndex,
    }: {
      row: any;
      rowIndex: number;
    }) => {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 0) {
        return "success-row";
      }
      return "";
    };

    return {
      tableData,
      handleRowClick,
      tableRowClassName,
    };
  },
};
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
