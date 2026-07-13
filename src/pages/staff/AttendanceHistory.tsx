import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../app/stores/authStore";
import { useAttendanceRecords, useAttendanceById, useAttendanceCorrections } from "../../shared/hooks/useQueries";
import { MobileLayout } from "../../app/layouts/MobileLayout";
import { StatusBadge } from "../../shared/ui";
import { Calendar, ArrowLeft, MapPin, Smartphone, ShieldCheck, Clock, User, Award, AlertTriangle } from "lucide-react";

export const AttendanceHistory: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { attendanceId } = useParams<{ attendanceId: string }>();

  // Fetch all my records
  const { data: myLogs = [], isLoading: isLoadingList } = useAttendanceRecords({ userId: user?.id });

  // Fetch single record if attendanceId is present
  const { data: record, isLoading: isLoadingRecord } = useAttendanceById(attendanceId || "");
  const { data: corrections = [] } = useAttendanceCorrections(attendanceId || "");

  // 1. If viewing specific attendance record detail
  if (attendanceId) {
    if (isLoadingRecord) {
      return (
        <MobileLayout title="打卡底片详情" onBack={() => navigate("/staff/attendance")}>
          <div className="p-10 text-center text-zinc-400 text-xs font-semibold">
            正在加载考勤档案底片...
          </div>
        </MobileLayout>
      );
    }

    if (!record) {
      return (
        <MobileLayout title="打卡底片详情" onBack={() => navigate("/staff/attendance")}>
          <div className="p-10 text-center text-zinc-400 text-xs font-semibold">
            未找到该条考勤档案底片
          </div>
        </MobileLayout>
      );
    }

    // Security: STAFF can only see their own records
    if (record.userId !== user?.id) {
      return (
        <MobileLayout title="无权查看" onBack={() => navigate("/staff/attendance")}>
          <div className="p-10 text-center text-red-500 text-xs font-bold space-y-2">
            <AlertTriangle className="mx-auto text-red-500" size={24} />
            <p>403 - 权限受限</p>
            <p className="font-semibold text-zinc-500">根据安全沙盒策略，STAFF 成员无权查阅他人的出勤底片。</p>
          </div>
        </MobileLayout>
      );
    }

    return (
      <MobileLayout title="考勤底片详情" onBack={() => navigate("/staff/attendance")}>
        <div className="space-y-5">
          {/* Header Summary */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 text-[#0A84FF] rounded-full flex items-center justify-center font-black text-sm">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-800">{record.userName}</h3>
                <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                  {record.groupName} • {record.positionName}
                </span>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-zinc-500">
              <div>排班日期：<span className="text-zinc-800 font-mono">{record.date}</span></div>
              <div>考勤结果：<span className="inline-block scale-90 origin-left"><StatusBadge status={record.status} /></span></div>
              <div className="col-span-2">当前活动：<span className="text-zinc-800">盛夏次元动漫嘉年华</span></div>
            </div>
          </div>

          {/* Time & Clock details */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <h4 className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} className="text-[#0A84FF]" /> 打卡指标细节
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Checkin details */}
              <div className="bg-slate-50 border border-black/5 rounded-2xl p-3.5 space-y-2 font-medium">
                <span className="text-[9px] font-extrabold text-zinc-400 block uppercase">上午签到</span>
                <p className="text-xs font-black text-zinc-800">{record.checkInTime || "未签到"}</p>
                <div className="text-[10px] text-zinc-400 space-y-0.5">
                  <p>计划时间: 08:00 - 09:00</p>
                  <p>打卡方式: 定位打卡+自拍</p>
                  <p className="line-clamp-2">偏差距离: {record.checkInDistance !== undefined ? `${record.checkInDistance}m` : "无"}</p>
                </div>
                {record.checkInPhoto && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-black/5">
                    <img src={record.checkInPhoto} alt="签到照片" className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* Checkout details */}
              <div className="bg-slate-50 border border-black/5 rounded-2xl p-3.5 space-y-2 font-medium">
                <span className="text-[9px] font-extrabold text-zinc-400 block uppercase">下午签退</span>
                <p className="text-xs font-black text-zinc-800">{record.checkOutTime || "未签退"}</p>
                <div className="text-[10px] text-zinc-400 space-y-0.5">
                  <p>计划时间: 17:30 - 21:00</p>
                  <p>打卡方式: 定位打卡+自拍</p>
                  <p className="line-clamp-2">偏差距离: {record.checkOutDistance !== undefined ? `${record.checkOutDistance}m` : "无"}</p>
                </div>
                {record.checkOutPhoto && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-black/5">
                    <img src={record.checkOutPhoto} alt="签退照片" className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GPS and Environment details */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-3.5">
            <h4 className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} className="text-[#0A84FF]" /> 物理定位与设备指纹 (演示数据)
            </h4>

            <div className="divide-y divide-zinc-50 text-xs font-semibold text-zinc-500">
              <div className="py-2 flex justify-between">
                <span>GPS 坐标</span>
                <span className="text-zinc-800 font-mono">30.1234° N, 120.5678° E</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>定位物理精度</span>
                <span className="text-zinc-800">±15米</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>设备/指纹</span>
                <span className="text-zinc-800">iPhone 15 Pro, Safari Mobile</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>网络 IP 归属</span>
                <span className="text-zinc-800 font-mono">112.12.33.24 (模拟WiFi)</span>
              </div>
            </div>
          </div>

          {/* Risk description */}
          {record.riskReason && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-red-600">打卡安全拦截风险</p>
                <p className="text-zinc-500 font-medium leading-relaxed">{record.riskReason}</p>
              </div>
            </div>
          )}

          {/* Correction timelines */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-3.5">
            <h4 className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#30D158]" /> 审计管理修正记录
            </h4>

            {corrections.length === 0 ? (
              <p className="text-xs text-zinc-400 font-medium text-center py-2">
                该卡片目前为原始底片，未曾被人为修正。
              </p>
            ) : (
              <div className="space-y-3">
                {corrections.map((corr: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-black/5 p-3 rounded-2xl text-xs space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-800">修正人: {corr.operatorName}</span>
                      <span className="text-zinc-400 font-mono scale-90">{corr.createdAt}</span>
                    </div>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                      <strong>修正原因：</strong>{corr.reason}
                    </p>
                    <div className="text-[10px] text-[#0A84FF] font-bold">
                      考勤状态变更为：{corr.after.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // 2. Normal List Display
  const totalDays = myLogs.length;
  const normalCount = myLogs.filter(r => r.status === "NORMAL").length;
  const lateCount = myLogs.filter(r => r.status === "LATE").length;
  const excCount = myLogs.filter(r => r.status === "EXCEPTIONAL" || r.riskLevel === "HIGH").length;

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

          {isLoadingList ? (
            <div className="bg-white border border-black/5 rounded-[22px] p-6 text-center text-xs text-[#86868B] font-medium">
              正在加载考勤履历...
            </div>
          ) : myLogs.length === 0 ? (
            <div className="bg-white border border-black/5 rounded-[22px] p-6 text-center text-xs text-[#86868B] font-medium">
              暂无已提交的打卡记录
            </div>
          ) : (
            myLogs.map((log) => (
              <div 
                key={log.id} 
                onClick={() => navigate(`/staff/attendance/${log.id}`)}
                className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm space-y-3 active:scale-98 transition-transform cursor-pointer"
              >
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
                
                <div className="text-right">
                  <span className="text-[9px] text-[#0A84FF] font-bold hover:underline">
                    查看出勤底片与定位指纹 ➜
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
};
