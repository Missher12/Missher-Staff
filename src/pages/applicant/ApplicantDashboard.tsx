import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { MobileLayout } from "../../app/layouts/MobileLayout";
import { StatusBadge } from "../../shared/ui";
import { Calendar, Bell, ChevronRight, QrCode, ClipboardList, Clock } from "lucide-react";

export const ApplicantDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { applications, interviewSlots, bookInterview } = useEventStore();

  // 筛选当前用户的报名记录
  const myApps = applications.filter(a => a.userId === user?.id);
  const activeApp = myApps[0]; // 拿最新一条

  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const handleBookSlot = async (slotId: string) => {
    if (!activeApp) return;
    setBookingLoading(slotId);
    setTimeout(async () => {
      const success = await bookInterview(activeApp.id, slotId);
      setBookingLoading(null);
      if (success) {
        alert("面试预约成功！请妥善保存您的面试二维码凭证并在入场时签到。");
      } else {
        alert("预约失败，该场次名额已满或已被取消");
      }
    }, 600);
  };

  return (
    <MobileLayout title="报名进程大厅">
      <div className="space-y-5">
        {/* 1. 顶部迎宾卡片 */}
        <div className="p-5 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] rounded-[22px] text-white shadow-sm relative">
          <div className="absolute top-4 right-4 text-white/20">
            <ClipboardList size={54} />
          </div>
          <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">下午好, 志愿者候选人</p>
          <h2 className="text-xl font-extrabold mt-1 tracking-tight">{user?.name}</h2>
          <p className="text-[11px] text-white/80 mt-1.5 leading-relaxed font-medium">
            您登记的实名信息已入库。以下是您本次动漫嘉年华的报名核验和最新审批流转状态。
          </p>
        </div>

        {/* 2. 主卡片：活动状态与时间线 */}
        {!activeApp ? (
          <div className="bg-white border border-black/5 rounded-[22px] p-6 text-center space-y-3 shadow-sm">
            <p className="text-xs text-[#86868B] font-medium">您目前尚无正在处理的活动报名件。</p>
            <button
              onClick={() => navigate("/activities/ACT_2026_01/apply")}
              className="px-4 py-2 bg-[#0A84FF] text-white font-semibold text-xs rounded-full hover:bg-[#0A84FF]/95 transition-all cursor-pointer"
            >
              浏览公开招募活动
            </button>
          </div>
        ) : (
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[9px] text-[#86868B] font-bold block uppercase">当前报名的会场</span>
                <span className="text-xs font-bold text-[#1D1D1F] line-clamp-1 mt-0.5">{activeApp.activityName}</span>
              </div>
              <StatusBadge status={activeApp.status} />
            </div>

            {/* 可视化审批时间线 (Apple style) */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-[#86868B] uppercase block">审批进度流转记录</span>
              <div className="space-y-4 relative pl-4 border-l border-zinc-100">
                {activeApp.auditHistory.map((history, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Circle dot on line */}
                    <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-[#0A84FF] border-2 border-white ring-4 ring-blue-50" />
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-[#1D1D1F]">
                        {history.status === "SUBMITTED" ? "报名表提交入库" : ""}
                        {history.status === "PENDING_REVIEW" ? "系统预筛通过" : ""}
                        {history.status === "APPROVED" ? "简历资格初审通过" : ""}
                        {history.status === "RETURNED" ? "资料被驳回补充" : ""}
                        {history.status === "WAITLIST" ? "进入候补名单" : ""}
                      </span>
                      <span className="text-[9px] font-mono text-[#86868B]">{history.time.substring(5, 16)}</span>
                    </div>
                    <p className="text-[10px] text-[#86868B] leading-relaxed">{history.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. 面试通知与时间场次预约 (APPROVED 时显示) */}
        {activeApp && activeApp.status === "APPROVED" && (
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-[#1D1D1F] flex items-center gap-1.5">
                <Calendar size={15} className="text-[#0A84FF]" /> 
                {activeApp.interviewStatus === "UNSCHEDULED" ? "挑选预约面试场次" : "您已成功预约面试"}
              </h3>
              
              {activeApp.interviewStatus === "SCHEDULED" && (
                <button
                  onClick={() => navigate("/applicant/interview-qrcode")}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-[10px] font-bold text-[#0A84FF] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <QrCode size={12} /> 展示签到码
                </button>
              )}
            </div>

            {activeApp.interviewStatus === "UNSCHEDULED" ? (
              <div className="space-y-3">
                <p className="text-[10px] text-[#86868B] leading-relaxed">
                  管理员已批准您的资料初审。请选择以下任意一个可面试时间段：
                </p>
                <div className="space-y-2">
                  {interviewSlots.map((slot) => (
                    <div key={slot.id} className="p-3 border border-black/5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#1D1D1F]">{slot.date} {slot.timeRange}</p>
                        <p className="text-[10px] text-[#86868B] font-medium mt-0.5">{slot.location}</p>
                      </div>
                      <button
                        onClick={() => handleBookSlot(slot.id)}
                        disabled={bookingLoading !== null || slot.reservedCount >= slot.limit}
                        className="px-3.5 py-1.5 text-[10px] font-bold rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white disabled:opacity-50 cursor-pointer transition-all shrink-0"
                      >
                        {bookingLoading === slot.id ? "预约中..." : "确定预约"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-[#0A84FF] flex items-center gap-1">
                  <Clock size={13} /> 预约成功，请准时出场：
                </p>
                <p className="text-[#1D1D1F] font-semibold">{activeApp.comment}</p>
                <p className="text-[10px] text-[#86868B] leading-relaxed">
                  在到达面试场地后，请点击右上角 <b>[展示签到码]</b> 并出示二维码供陈大伟组长扫码，完成到场打卡登记。
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. 信息提示板 */}
        <div className="p-4 bg-zinc-50 border border-black/5 rounded-[22px] flex items-start gap-3">
          <span className="p-1.5 bg-white rounded-full text-[#86868B] shadow-sm shrink-0">
            <Bell size={13} />
          </span>
          <div>
            <p className="text-xs font-bold text-[#1D1D1F]">漫展骨干招募常见问答</p>
            <p className="text-[10px] text-[#86868B] leading-relaxed mt-0.5">
              面试通过后，管理员会在后台对您进行终审“录取”并分派工作岗位。录取成功后您的角色会自动转换为 [STAFF] 级别并开放自拍照定位打卡和请假审批。
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
