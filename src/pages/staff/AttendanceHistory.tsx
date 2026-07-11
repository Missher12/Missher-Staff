import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { MobileLayout } from "../../app/layouts/MobileLayout";
import { StatusBadge } from "../../shared/ui";
import { ClipboardCheck, Calendar, ArrowLeft } from "lucide-react";

export const AttendanceHistory: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { attendanceRecords } = useEventStore();

  // 1. 过滤当前用户的历史考勤明细
  const myLogs = attendanceRecords.filter(r => r.userId === user?.id);

  // 2. 考勤指标统计
  const totalDays = myLogs.length;
  const normalCount = myLogs.filter(r => r.status === "NORMAL").length;
  const lateCount = myLogs.filter(r => r.status === "LATE").length;
  const excCount = myLogs.filter(r => r.status === "EXCEPTIONAL").length;

  return (
    <MobileLayout 
      title="我的考勤履历" 
      onBack={() => navigate("/staff/dashboard")}
    >
      <div className="space-y-5">
        {/* Statistics Grid */}
        <div className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm grid grid-cols-4 gap-2 text-center">
          <div className="p-1">
            <span className="text-[9px] text-[#86868B] font-bold block uppercase">出勤天数</span>
            <span className="text-base font-extrabold text-[#1D1D1F] mt-0.5 block">{totalDays}</span>
          </div>
          <div className="p-1">
            <span className="text-[9px] text-[#86868B] font-bold block uppercase">正常打卡</span>
            <span className="text-base font-extrabold text-[#30D158] mt-0.5 block">{normalCount}</span>
          </div>
          <div className="p-1">
            <span className="text-[9px] text-[#86868B] font-bold block uppercase">迟到记录</span>
            <span className="text-base font-extrabold text-[#FF9F0A] mt-0.5 block">{lateCount}</span>
          </div>
          <div className="p-1">
            <span className="text-[9px] text-[#86868B] font-bold block uppercase">考勤异常</span>
            <span className="text-base font-extrabold text-[#FF453A] mt-0.5 block">{excCount}</span>
          </div>
        </div>

        {/* Attendance Logs list */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-[#86868B] block uppercase px-1">考勤时间线日志</span>

          {myLogs.length === 0 ? (
            <div className="bg-white border border-black/5 rounded-[22px] p-6 text-center text-xs text-[#86868B] font-medium">
              暂无已提交的打卡记录
            </div>
          ) : (
            myLogs.map((log) => (
              <div key={log.id} className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
                  <span className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#0A84FF]" /> {log.date} (今日排班)
                  </span>
                  <StatusBadge status={log.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-medium text-[#86868B]">
                  {/* Checkin info */}
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-black/5">
                    <span className="text-[8px] font-bold uppercase block text-zinc-400">上午签到</span>
                    <p className="text-xs font-extrabold text-[#1D1D1F]">{log.checkInTime || "未签到"}</p>
                    {log.checkInLocation && (
                      <p className="text-[9px] line-clamp-1">{log.checkInLocation}</p>
                    )}
                  </div>

                  {/* Checkout info */}
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-black/5">
                    <span className="text-[8px] font-bold uppercase block text-zinc-400">下午签退</span>
                    <p className="text-xs font-extrabold text-[#1D1D1F]">{log.checkOutTime || "未签退"}</p>
                    {log.checkOutLocation && (
                      <p className="text-[9px] line-clamp-1">{log.checkOutLocation}</p>
                    )}
                  </div>
                </div>

                {log.riskReason && (
                  <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-[10px] text-[#FF453A] font-semibold leading-relaxed">
                    ⚠ 系统拦截警报: {log.riskReason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
};
