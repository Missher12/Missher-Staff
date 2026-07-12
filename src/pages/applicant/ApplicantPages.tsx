import React, { useState } from "react";
import { ApplicantLayout } from "../../app/layouts/ApplicantLayout";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { 
  User, ShieldCheck, Mail, Calendar, MapPin, 
  Clock, Bell, CheckCircle2, ChevronRight 
} from "lucide-react";

// ==========================================
// 1. ApplicantProfile (候选人报名资料及建档状态)
// ==========================================
export const ApplicantProfile: React.FC = () => {
  const { user } = useAuthStore();
  return (
    <ApplicantLayout title="我的报名档案">
      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xl text-[#0A84FF]">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">{user?.name}</h2>
              <p className="text-xs text-[#86868B] font-medium">实名登记账户 • 志愿者</p>
            </div>
          </div>

          <div className="h-px bg-zinc-100" />

          <div className="space-y-3.5 text-xs text-zinc-500 font-semibold">
            <div className="flex justify-between">
              <span>手机号码</span>
              <span className="text-[#1D1D1F]">{user?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>常驻城市</span>
              <span className="text-[#1D1D1F]">浙江省杭州市</span>
            </div>
            <div className="flex justify-between">
              <span>身份证件</span>
              <span className="text-[#1D1D1F]">{user?.idCard ? `${user.idCard.substring(0, 4)}***********${user.idCard.substring(14)}` : "未录入"}</span>
            </div>
            <div className="flex justify-between">
              <span>保险购买状态</span>
              <span className="text-[#30D158] font-bold">● 已全额承保</span>
            </div>
          </div>
        </div>

        {/* Dynamic status card */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-[#1D1D1F] uppercase tracking-wide">会务工作档案状态</h3>
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs space-y-1.5 font-medium">
            <p className="font-bold text-[#1D1D1F]">初审状态: <span className="text-[#0A84FF]">审核通过</span></p>
            <p className="text-[#86868B] leading-relaxed">您的基础简历资质及工作日匹配度已通过会务组初筛，请尽快进入“预约面试”板块抢占面试名额。</p>
          </div>
        </div>
      </div>
    </ApplicantLayout>
  );
};

// ==========================================
// 2. ApplicantInterview (面试场次预约与管理)
// ==========================================
export const ApplicantInterview: React.FC = () => {
  const { interviewSlots, bookInterview, applications } = useEventStore();
  const { user } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState("");

  const userApp = applications.find(a => a.userId === user?.id);
  const currentReservedSlotId = userApp?.interviewSlotId;

  const handleBook = async (slotId: string) => {
    if (!userApp) return;
    try {
      const res = await bookInterview(userApp.id, slotId);
      if (res) {
        setSuccessMsg("抢位成功！已为您锁定该场次。请携带面试签到二维码准时入场考查。");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (e) {
      alert("预约失败，请稍后重试");
    }
  };

  return (
    <ApplicantLayout title="预约面试时间">
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100/50 rounded-2xl text-xs text-[#0A84FF] font-medium leading-relaxed">
          💡 <strong>预约指南：</strong> 会务工作者考查包含现场执勤规范、防暑自救和岗前仪容。预约一旦确认，在改签截止前可自由更换。
        </div>

        {successMsg && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl text-xs text-[#30D158] font-bold flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <div className="space-y-2.5">
          <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">开放预约场次</span>
          
          {interviewSlots.map((slot) => {
            const isReservedByMe = currentReservedSlotId === slot.id;
            const isFull = slot.reservedCount >= slot.limit;

            return (
              <div 
                key={slot.id} 
                className={`bg-white/80 backdrop-blur-xl border rounded-2xl p-4 flex justify-between items-center shadow-sm transition-all ${
                  isReservedByMe 
                    ? "border-[#0A84FF] bg-blue-50/10" 
                    : "border-black/5"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-[9px] font-bold font-mono text-zinc-500">
                      ID: {slot.id}
                    </span>
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      {slot.date}
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#1D1D1F] font-mono">{slot.timeRange}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                    <MapPin size={11} /> {slot.location}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <span className="text-[10px] text-[#86868B] font-bold block">
                    余量: {slot.limit - slot.reservedCount} / {slot.limit}
                  </span>
                  {isReservedByMe ? (
                    <span className="px-3.5 py-1.5 bg-[#0A84FF] text-white text-[10px] font-bold rounded-full">
                      已锁定该场
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBook(slot.id)}
                      disabled={isFull}
                      className={`px-3.5 py-1.5 text-[10px] font-bold rounded-full cursor-pointer transition-all ${
                        isFull 
                          ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                          : "bg-zinc-100 hover:bg-[#0A84FF] hover:text-white text-[#0A84FF]"
                      }`}
                    >
                      {isFull ? "满员" : "预约抢位"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ApplicantLayout>
  );
};

// ==========================================
// 3. ApplicantNotifications (通知消息中心)
// ==========================================
export const ApplicantNotifications: React.FC = () => {
  const notifications = [
    {
      id: "1",
      title: "🎉 志愿者基础档案初筛通过",
      time: "2026-07-09 10:24",
      content: "林可儿您好！您的简历与出勤偏好非常符合本次漫展舞台及门禁考务标准。特批准通过初审资质，请前往预约面试场次。",
      read: true
    },
    {
      id: "2",
      title: "🔒 实名安全保险承保确认",
      time: "2026-07-08 14:15",
      content: "会务组已为您提交并购买了『太平洋漫展大型集会意外险』，投保期间内保额100万元。现场考勤打卡时请提供实时GPS核对。",
      read: false
    }
  ];

  return (
    <ApplicantLayout title="我的消息通知">
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">历史会务通知</span>
        
        {notifications.map((n) => (
          <div key={n.id} className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl p-4.5 shadow-sm space-y-2 relative overflow-hidden">
            {!n.read && (
              <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#FF453A]" />
            )}
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#1D1D1F]">{n.title}</h3>
              <span className="text-[9px] font-mono text-zinc-400">{n.time}</span>
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed font-medium">
              {n.content}
            </p>
          </div>
        ))}
      </div>
    </ApplicantLayout>
  );
};
