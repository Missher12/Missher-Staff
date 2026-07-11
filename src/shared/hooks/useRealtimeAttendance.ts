import { useState, useEffect } from "react";
import { useEventStore } from "../../app/stores/eventStore";
import { AttendanceRecord, AttendanceStatus } from "../types";

export function useRealtimeAttendance() {
  const { attendanceRecords, submitAttendance } = useEventStore();
  const [liveRecords, setLiveRecords] = useState<AttendanceRecord[]>(attendanceRecords);

  useEffect(() => {
    // 每次 store 里的 attendanceRecords 变化，更新本地缓存
    setLiveRecords(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    // 定时器模拟：每隔 15 秒，模拟一名 STAFF (例如赵雷，李小华，或者全新虚构的志愿者) 进行定位打卡行为
    const names = ["王超", "周婷婷", "许诺", "孙浩然", "姜珊"];
    const groups = ["舞台控场组", "门禁检票A组", "后勤机动组", "秩序引导组"];
    const positions = ["舞台控场岗", "门禁检票岗", "后勤机动岗", "秩序疏导岗"];

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * names.length);
      const randomGroupIdx = Math.floor(Math.random() * groups.length);
      const randomPosIdx = Math.floor(Math.random() * positions.length);

      const isLateSeed = Math.random() > 0.6;
      const isOutRangeSeed = Math.random() > 0.85;

      const currentTimeString = new Date().toLocaleTimeString("zh-CN", { hour12: false });
      const randomDistance = isOutRangeSeed 
        ? Math.floor(Math.random() * 600) + 120  // 异常：120m ~ 720m
        : Math.floor(Math.random() * 45) + 3;    // 正常：3m ~ 48m

      const newRecord: Omit<AttendanceRecord, "id" | "riskLevel" | "status"> = {
        userId: `U_LIVE_${Date.now()}`,
        userName: names[randomIdx],
        userPhone: `138${Math.floor(Math.random() * 9000 + 1000)}${Math.floor(Math.random() * 9000 + 1000)}`,
        groupName: groups[randomGroupIdx],
        positionName: positions[randomPosIdx],
        activityId: "ACT_2026_01",
        date: "2026-07-11",
        checkInTime: currentTimeString,
        checkInPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60",
        checkInLocation: `展馆内部定位 (误差 ${randomDistance}m)`,
        checkInDistance: randomDistance
      };

      // 自动写入全局 store 模拟
      submitAttendance(newRecord);
    }, 15000); // 15s 发生一次打卡事件

    return () => clearInterval(interval);
  }, [submitAttendance]);

  // 整理数据大盘指标
  const totalCheckedIn = liveRecords.length;
  const normalCount = liveRecords.filter(r => r.status === "NORMAL").length;
  const lateCount = liveRecords.filter(r => r.status === "LATE").length;
  const exceptionalCount = liveRecords.filter(r => r.status === "EXCEPTIONAL").length;

  return {
    liveRecords,
    stats: {
      totalCheckedIn,
      normalCount,
      lateCount,
      exceptionalCount,
      absentCount: Math.max(0, 80 - totalCheckedIn) // 设定总数 80 人
    }
  };
}
