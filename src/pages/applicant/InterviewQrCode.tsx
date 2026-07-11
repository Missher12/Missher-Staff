import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { MobileLayout } from "../../app/layouts/MobileLayout";
import { QRCodeDisplay } from "../../shared/ui";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";

export const InterviewQrCode: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { applications } = useEventStore();

  const myApp = applications.find(a => a.userId === user?.id);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generates a mock token including date, userId and slotId to authenticate
  const mockTokenVal = `INTERVIEW_CONF_USER:${user?.id}_TIME:${Date.now().toString().substring(0, 10)}`;

  return (
    <MobileLayout 
      title="面试登记电子凭证" 
      onBack={() => navigate("/applicant/dashboard")}
    >
      <div className="space-y-6">
        {/* Intro */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-extrabold text-[#1D1D1F]">实名面试核验二维码</h2>
          <p className="text-[11px] text-[#86868B] max-w-xs mx-auto leading-relaxed">
            请到场后将此二维码出示给组长陈大伟，扫码登记即代表您已按时出场参加面试。
          </p>
        </div>

        {/* QR Code Area */}
        <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-[#F5F5F7] p-8 flex flex-col justify-center items-center" : "relative"}`}>
          {isFullscreen && (
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-[#1D1D1F] text-xs font-semibold rounded-full cursor-pointer"
            >
              退出全屏
            </button>
          )}

          <QRCodeDisplay value={mockTokenVal} />

          {!isFullscreen && (
            <div className="text-center mt-3">
              <button 
                onClick={() => setIsFullscreen(true)}
                className="text-xs font-bold text-[#0A84FF] hover:underline flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                点我全屏展示二维码
              </button>
            </div>
          )}
        </div>

        {/* Booking particulars Card */}
        {myApp && (
          <div className="bg-white border border-black/5 rounded-[22px] p-5 space-y-3 shadow-sm text-xs">
            <h3 className="font-bold text-[#1D1D1F] border-b border-zinc-100 pb-2">已预约面试场次信息</h3>
            <div className="space-y-2 text-[#86868B] font-medium">
              <div className="flex justify-between">
                <span>预约活动</span>
                <span className="text-[#1D1D1F] font-semibold">{myApp.activityName}</span>
              </div>
              <div className="flex justify-between">
                <span>候考候选人</span>
                <span className="text-[#1D1D1F] font-semibold">{myApp.userName}</span>
              </div>
              <div className="flex justify-between">
                <span>联系手机</span>
                <span className="text-[#1D1D1F] font-semibold">{myApp.userPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>当前面试状态</span>
                <span className="text-[#30D158] font-bold">
                  {myApp.interviewStatus === "SCHEDULED" ? "● 已到岗候考" : "● 面试签到完成"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3.5 bg-slate-100 rounded-2xl text-[10px] text-[#86868B] text-center font-semibold leading-relaxed">
          正式环境二维码令牌基于 JWT 防伪算法。由于现场可能存在网络信号堵塞，请勿提前 5 分钟外截屏，倒计时将保证现场鉴权安全。
        </div>
      </div>
    </MobileLayout>
  );
};
