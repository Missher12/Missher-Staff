import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { apiClient } from "../../shared/api/client";
import { ApplicantLayout } from "../../app/layouts/ApplicantLayout";
import { QRCodeDisplay } from "../../shared/ui";
import { ArrowLeft, CheckCircle2, RefreshCw, Clock } from "lucide-react";

export const InterviewQrCode: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { applications } = useEventStore();

  const myApp = applications.find(a => a.userId === user?.id);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch the secure dyanmic token
  const { data: qrToken, refetch, isFetching } = useQuery({
    queryKey: ["interviewToken", user?.id, myApp?.interviewSlotId, myApp?.activityId],
    queryFn: () => apiClient.generateInterviewToken(
      user?.id || "",
      myApp?.interviewSlotId || "SL_01",
      myApp?.activityId || "ACT_2026_01"
    ),
    enabled: !!user?.id,
    refetchInterval: 15000, // Auto refresh every 15 seconds
  });

  // Calculate dynamic countdown in seconds
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!qrToken) return;
    const interval = setInterval(() => {
      const expires = new Date(qrToken.expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.round((expires - now) / 1000));
      setTimeLeft(diff);
      if (diff === 0) {
        refetch();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrToken, refetch]);

  const mockTokenVal = qrToken?.token || `INTERVIEW_FALLBACK_USER:${user?.id}`;

  return (
    <ApplicantLayout 
      title="面试登记电子凭证" 
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

          <div className="bg-white border border-black/5 rounded-[32px] p-6 shadow-sm flex flex-col items-center justify-center max-w-xs mx-auto">
            <QRCodeDisplay value={mockTokenVal} />
            
            {/* Dynamic countdown status */}
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#FF9F0A] bg-amber-50 px-3 py-1 rounded-full">
              <Clock size={12} className={timeLeft <= 5 ? "animate-pulse" : ""} />
              <span>动态口令将在 {timeLeft} 秒内刷新</span>
              <button 
                onClick={() => { refetch(); }}
                disabled={isFetching}
                className="ml-1 text-[#0A84FF] hover:underline"
              >
                {isFetching ? "..." : "刷新"}
              </button>
            </div>
          </div>

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
    </ApplicantLayout>
  );
};
