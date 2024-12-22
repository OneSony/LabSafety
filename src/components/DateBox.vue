<template>
  <div style="display: inline-block">
    <el-tooltip class="item" effect="dark" placement="top">
      <div class="date-display">
        <p class="time" :style="{ color: textColor, fontSize: fontSize }">
          {{ date.hour }}:{{ date.minute }}
        </p>
        <p class="date" :style="{ color: textColor, fontSize: fontSize }">
          {{ date.year }}年{{ date.month }}月{{ date.day }}日
        </p>
        <el-tag :style="{ fontSize: fontSize - 2 }">{{ date.weekday }}</el-tag>
      </div>

      <template #content>
        <div>
          <span v-if="daysToToday === 0">今天</span>
          <span v-else-if="daysToToday < 0">还有{{ -daysToToday }}天</span>
          <span v-else>已过{{ daysToToday }}天</span>
        </div>
      </template>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: "DateBox",
  props: {
    dateStr: {
      type: String,
      required: true,
    },
    textColor: {
      type: String,
      default: "#000000", // 默认文本颜色为黑色
    },
    fontSize: {
      type: String,
      default: "16px", // 默认字号为16px
    },
  },
  data() {
    return {
      date: this.generateDate(this.dateStr),
    };
  },
  computed: {
    // 计算距今天的天数
    daysToToday() {
      return this.calculateDaysToToday(this.dateStr);
    },
  },
  watch: {
    dateStr(newDateStr) {
      this.date = this.generateDate(newDateStr); // 当 dateStr 变化时更新 date
    },
  },
  methods: {
    generateDate(dateStr) {
      const date = new Date(dateStr);

      // 获取星期几（0表示星期天，1表示星期一，依此类推）
      const dayOfWeek = date.getDay();

      // 星期几的中文名称
      const daysOfWeek = [
        "周日",
        "周一",
        "周二",
        "周三",
        "周四",
        "周五",
        "周六",
      ];
      const weekdayName = daysOfWeek[dayOfWeek];

      // 返回包含年、月、日、星期几等信息的对象
      return {
        year: date.getFullYear(), // 获取年份
        month: date.getMonth() + 1, // 获取月份 (月份从0开始，所以要加1)
        day: date.getDate(), // 获取日期
        hour: date.getHours(), // 获取小时
        minute: date.getMinutes(), // 获取分钟
        weekday: weekdayName, // 获取星期几的中文名称
      };
    },

    // 计算距今天的天数
    calculateDaysToToday(dateStr) {
      const targetDate = new Date(dateStr); // 目标日期
      const today = new Date(); // 当前日期

      // 清除时间部分，确保比较日期时不受时分秒影响
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      // 计算两个日期之间的时间差，单位是毫秒
      const timeDiff = today - targetDate;

      // 将时间差从毫秒转换为天数
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      return Math.floor(daysDiff); // 返回天数（向下取整）
    },
  },
};
</script>

<style scoped>
.date-display {
  background-color: red;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.time,
.date {
  margin: 0;
}

.el-tag {
  margin-top: 5px;
}
</style>
