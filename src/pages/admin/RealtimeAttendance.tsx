import React from "react";
import { useRealtimeAttendance } from "../../shared/hooks/useRealtimeAttendance";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { BentoGrid, BentoCard, MetricCard } from "../../shared/ui";
import { Activity, ShieldAlert, Wifi, TrendingUp, Compass, Clock } from "lucide-react";

export const RealtimeAttendance: React.FC = () => {
  const { liveRecords, stats } = useRealtimeAttendance();

  // 1. 估算百分比
  const totalExpected = 80;
  const attendanceRate = Math.min(100, Math.round((stats.totalCheckedIn / totalExpected) * 100));

  // 2. 模拟各个工作组的签到数据
  const groupStats = [
    { name: "舞台控场组", present: Math.floor(stats.totalCheckedIn * 0.35) + 1, total: 20 },
    { name: "门禁检票A组", present: Math.floor(stats.totalCheckedIn * 0.3) + 1, total: 20 },
    { name: "后勤机动组", present: Math.floor(stats.totalCheckedIn * 0.2) + 1, total: 20 },
    { name: "秩序引导组", present: Math.floor(stats.totalCheckedIn * 0.15), total: 20 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top telemetry bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">STAFF 现场实时考勤大屏</h2>
            <p className="text-xs text-[#86868B] mt-1 font-medium">
              系统当前基于高精 GPS 及自拍识别算法对入场人员进行持续鉴权流验证。
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-green-50 border border-green-150 rounded-full text-xs font-bold text-[#30D158] flex items-center gap-1.5 animate-pulse">
            <Wifi size={13} /> 卫星数据流联通中 (每 15 秒轮询更新)
          </div>
        </div>

        {/* 1. Core indicators Row */}
        <BentoGrid>
          <MetricCard
            title="累计已签到人数"
            value={`${stats.totalCheckedIn} / ${totalExpected} 人`}
            subValue={`当前到岗率: ${attendanceRate}%`}
            icon={<Activity size={18} />}
            color="text-[#0A84FF] bg-blue-50"
            span={3}
          />
          <MetricCard
            title="绿色正常出勤"
            value={stats.normalCount}
            subValue="GPS 及活检照片正常"
            icon={<Compass size={18} />}
            color="text-[#30D158] bg-green-50"
            span={3}
          />
          <MetricCard
            title="迟到及早退"
            value={stats.lateCount}
            subValue="略晚于开馆前规定时间"
            icon={<Clock size={18} />}
            color="text-[#FF9F0A] bg-amber-50"
            span={3}
          />
          <MetricCard
            title="异常围栏打卡"
            value={stats.exceptionalCount}
            subValue="超出 100m 水印范围"
            icon={<ShieldAlert size={18} />}
            color="text-[#FF453A] bg-red-50"
            span={3}
          />
        </BentoGrid>

        {/* 2. Visual Graphs Bento block */}
        <BentoGrid>
          {/* iOS Ring Progress Chart (Span 4) */}
          <BentoCard span={4} className="space-y-4 items-center justify-center text-center">
            <h4 className="text-xs font-extrabold text-[#1D1D1F] self-start">全会场当日出勤率环图</h4>
            
            <div className="relative w-40 h-40 flex items-center justify-center my-2">
              {/* SVG Ring progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(0, 0, 0, 0.04)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#0A84FF"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * attendanceRate) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Centered Percentage */}
              <div className="absolute space-y-0.5">
                <span className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">{attendanceRate}%</span>
                <p className="text-[9px] text-[#86868B] font-bold uppercase">在岗核对</p>
              </div>
            </div>

            <p className="text-[10px] text-[#86868B] font-semibold leading-relaxed">
              今日实际打卡 {stats.totalCheckedIn} 人，仍有 {stats.absentCount} 名志愿者因今日无班次或请假未上岗。
            </p>
          </BentoCard>

          {/* Hourly distribution graph (SVG graph) (Span 4) */}
          <BentoCard span={4} className="space-y-4">
            <h4 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#0A84FF]" /> 今日打卡时段分布 (08:00 - 12:00)
            </h4>

            {/* Custom SVG line-chart matching Apple aesthetic */}
            <div className="flex-1 h-36 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                {/* Grid lines */}
                <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                
                {/* Smooth Area Path under graph */}
                <path
                  d="M 10 90 Q 50 60 90 20 T 170 85 T 190 90 L 190 90 L 10 90 Z"
                  fill="rgba(10, 132, 255, 0.06)"
                />
                {/* Actual line */}
                <path
                  d="M 10 90 Q 50 60 90 20 T 170 85 T 190 90"
                  fill="none"
                  stroke="#0A84FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                
                {/* Core peak node */}
                <circle cx="90" cy="20" r="4.5" fill="#0A84FF" stroke="white" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-[#86868B] font-mono px-1">
              <span>08:00 (开馆)</span>
              <span className="text-[#0A84FF]">09:00 (高峰)</span>
              <span>10:30</span>
              <span>12:00</span>
            </div>
          </BentoCard>

          {/* Group check-in rankings (Span 4) */}
          <BentoCard span={4} className="space-y-4">
            <h4 className="text-xs font-extrabold text-[#1D1D1F]">各小组签到率在岗排行</h4>
            
            <div className="space-y-3.5">
              {groupStats.map((grp) => {
                const pct = Math.min(100, Math.round((grp.present / grp.total) * 100));
                return (
                  <div key={grp.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-[#1D1D1F]">
                      <span>{grp.name}</span>
                      <span className="font-mono text-[#86868B]">{grp.present} / {grp.total} 人 ({pct}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full border border-black/3">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0A84FF] to-[#BF5AF2] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </BentoCard>
        </BentoGrid>

        {/* 3. Live feed logging */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-[#86868B] uppercase block">卫星传输考勤流水日志 (滑动窗口前 4 条)</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveRecords.slice(0, 4).map((rec) => (
              <div key={rec.id} className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm space-y-2.5 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#1D1D1F]">{rec.userName}</span>
                  <span className="font-mono font-bold text-[#0A84FF]">{rec.checkInTime}</span>
                </div>
                <div className="text-[10px] text-[#86868B] font-semibold space-y-0.5">
                  <p>组别: {rec.groupName}</p>
                  <p className="truncate">定位: {rec.checkInLocation}</p>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-zinc-50">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    rec.status === "NORMAL" 
                      ? "bg-green-50 text-[#30D158]" 
                      : rec.status === "LATE" 
                        ? "bg-amber-50 text-[#FF9F0A]" 
                        : "bg-red-50 text-[#FF453A]"
                  }`}>
                    {rec.status === "NORMAL" ? "✔ GPS合规" : rec.status === "LATE" ? "迟到" : "⚠ 异常打卡"}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 font-mono">
                    {rec.checkInDistance}m 偏差
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
