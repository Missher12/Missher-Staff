import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { MobileLayout } from "../../app/layouts/MobileLayout";
import { StatusBadge, SensitiveText } from "../../shared/ui";
import { MapPin, Phone, Bell, QrCode, ArrowRight, CheckSquare, Clock, Users } from "lucide-react";
import { mockUsers } from "../../shared/mocks/data";

export const StaffDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { groups, attendanceRecords, announcements } = useEventStore();

  // 1. 查找当前用户的小组
  const myGroup = groups.find(g => g.memberIds.includes(user?.id || ""));
  
  // 2. 查找同组组员
  const groupMembers = myGroup 
    ? mockUsers.filter(u => myGroup.memberIds.includes(u.id) && u.id !== user?.id) 
    : [];

  // 3. 查找今日打卡记录 (假定今日为 2026-07-11)
  const todayRecord = attendanceRecords.find(r => r.userId === user?.id && r.date === "2026-07-11");

  // 4. 选择公告列表
  const unreadCount = announcements.filter(a => !a.confirmedUserIds.includes(user?.id || "")).length;

  return (
    <MobileLayout title="STAFF 移动工作站">
      <div className="space-y-5">
        {/* 1. 个人与小组岗位卡 */}
        <div className="p-5 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] rounded-[22px] text-white shadow-sm relative">
          <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">今日漫展排班</p>
          <h2 className="text-xl font-extrabold mt-1 tracking-tight">{user?.name}</h2>
          
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-xs font-semibold">
            <div>
              <span className="text-white/60 text-[9px] uppercase">所属组别</span>
              <p className="text-white font-bold">{myGroup?.name || "后勤保障机动组"}</p>
            </div>
            <div>
              <span className="text-white/60 text-[9px] uppercase">岗位职责</span>
              <p className="text-white font-bold">{todayRecord?.positionName || "舞台控场岗"}</p>
            </div>
          </div>
        </div>

        {/* 2. 今日考勤控制台 */}
        <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <span className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5">
              <Clock size={15} className="text-[#0A84FF]" /> 今日考勤控制台
            </span>
            <StatusBadge status={todayRecord?.status || "NONE"} />
          </div>

          {/* 打卡卡片 */}
          <div className="grid grid-cols-2 gap-3 text-xs text-[#86868B] font-medium">
            <div className="p-3 bg-slate-50 border border-black/5 rounded-2xl space-y-1">
              <span className="text-[9px] uppercase block">签到打卡 (应 08:30 前)</span>
              <span className="text-xs font-bold text-[#1D1D1F]">
                {todayRecord?.checkInTime ? todayRecord.checkInTime : "（尚未签到）"}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-black/5 rounded-2xl space-y-1">
              <span className="text-[9px] uppercase block">签退打卡 (应 18:00 后)</span>
              <span className="text-xs font-bold text-[#1D1D1F]">
                {todayRecord?.checkOutTime ? todayRecord.checkOutTime : "（尚未签退）"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => navigate("/staff/attendance/check")}
              className="flex-1 py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer text-center"
            >
              自拍照 + GPS 实时打卡
            </button>
            <button
              onClick={() => navigate("/staff/attendance")}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-[#1D1D1F] text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              title="查看历史考勤明细"
            >
              历史明细
            </button>
          </div>
        </div>

        {/* 3. 组长和联系人 */}
        {myGroup && (
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
              <span className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <Users size={15} className="text-[#0A84FF]" /> 负责人与团队组员
              </span>
            </div>

            {/* 组长 */}
            <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0A84FF] font-bold flex items-center justify-center">
                  陈
                </div>
                <div>
                  <p className="font-bold text-[#1D1D1F]">{myGroup.leaderName} (组长)</p>
                  <p className="text-[9px] text-[#86868B]">有问题请第一紧急致电组长</p>
                </div>
              </div>
              <a 
                href={`tel:${myGroup.leaderPhone}`}
                className="p-2 bg-white border border-black/5 rounded-full text-[#0A84FF] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Phone size={14} />
              </a>
            </div>

            {/* 组员 */}
            {groupMembers.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[9px] font-bold text-[#86868B] block uppercase">同组 STAFF 同事 ({groupMembers.length})</span>
                <div className="space-y-1.5">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex justify-between items-center py-1 text-xs">
                      <div className="flex items-center gap-2">
                        <img src={member.avatar} className="w-6 h-6 rounded-full border border-black/5 bg-slate-50" alt="" />
                        <span className="font-semibold text-[#1D1D1F]">{member.name}</span>
                      </div>
                      <SensitiveText text={member.phone} type="PHONE" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. 最新公告与未确认数 */}
        <div className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-50 text-[#FF453A] rounded-xl relative">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF453A] border-2 border-white animate-pulse" />
              )}
            </span>
            <div>
              <p className="text-xs font-bold text-[#1D1D1F]">紧急置顶考勤守则</p>
              <p className="text-[10px] text-[#86868B]">{unreadCount > 0 ? `有 ${unreadCount} 条置顶通知必须确认才能出勤` : "所有考勤前公告均已成功确认"}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/staff/attendance/check")} // 打卡时会自动触发 AnnouncementGuard 阻挡
            className="p-1.5 text-zinc-400 hover:text-[#0A84FF] transition-colors cursor-pointer"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};
