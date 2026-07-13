import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { MobileLayout } from "../../app/layouts/MobileLayout";
import { LocationCapture, CameraCapture, ConfirmDialog } from "../../shared/ui";
import { ArrowLeft, CheckCircle, AlertCircle, RefreshCw, Send } from "lucide-react";

export const AttendanceCheck: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { attendanceRecords, submitAttendance, showToast } = useEventStore();

  // 1. 判断是签到还是签退 (假定今日为 2026-07-11)
  const todayRecord = attendanceRecords.find(r => r.userId === user?.id && r.date === "2026-07-11");
  const isCheckOutMode = !!todayRecord?.checkInTime;

  // 2. 表单收集状态
  const [gpsLocation, setGpsLocation] = useState("");
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [punchResult, setPunchResult] = useState<any>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [error, setError] = useState("");

  const handleLocationCaptured = (loc: string, distance: number) => {
    setGpsLocation(loc);
    setGpsDistance(distance);
    setError("");
  };

  const handleSelfieCaptured = (base64Img: string) => {
    setSelfiePhoto(base64Img);
    setError("");
  };

  const triggerConfirmPunch = () => {
    if (!gpsLocation || gpsDistance === null) {
      setError("请先获取您的现场 GPS 定位！");
      return;
    }
    if (!selfiePhoto) {
      setError("请开启相机并拍摄一张清晰自拍作为考勤凭证！");
      return;
    }
    setError("");
    setDialogOpen(true);
  };

  const executePunch = async () => {
    setDialogOpen(false);
    setIsSubmitting(true);

    const currentTimeString = new Date().toLocaleTimeString("zh-CN", { hour12: false });

    // 组装数据并提交
    const recordPayload = {
      userId: user?.id || "",
      userName: user?.name || "",
      userPhone: user?.phone || "",
      groupName: "舞台控场组", // 默认
      positionName: "舞台控场岗", // 默认
      activityId: "ACT_2026_01",
      date: "2026-07-11",
      ...(isCheckOutMode 
        ? { 
            checkOutTime: currentTimeString, 
            checkOutPhoto: selfiePhoto, 
            checkOutLocation: gpsLocation, 
            checkOutDistance: gpsDistance 
          } 
        : { 
            checkInTime: currentTimeString, 
            checkInPhoto: selfiePhoto, 
            checkInLocation: gpsLocation, 
            checkInDistance: gpsDistance 
          }
      )
    };

    try {
      const res = await submitAttendance(recordPayload);
      setPunchResult(res);
    } catch (err) {
      showToast("考勤数据上传异常，请重新提交", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout 
      title={isCheckOutMode ? "STAFF 会场签退" : "STAFF 会场签到"} 
      onBack={() => navigate("/staff/dashboard")}
    >
      <div className="space-y-6">
        {punchResult ? (
          /* 打卡成功结算看板 */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-green-50 text-[#30D158] rounded-full flex items-center justify-center mx-auto border border-green-100">
              <CheckCircle size={32} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#1D1D1F]">
                {isCheckOutMode ? "下午签退打卡成功" : "上午签到打卡成功"}
              </h3>
              <p className="text-[10px] text-[#86868B] font-mono">
                流水回执号: {punchResult.id}
              </p>
            </div>

            {/* 实名卡片 */}
            <div className="bg-white border border-black/5 rounded-2xl p-4 text-left text-xs space-y-2.5 max-w-sm mx-auto shadow-sm">
              <div className="flex justify-between border-b border-zinc-50 pb-2">
                <span className="text-[#86868B]">打卡职工</span>
                <span className="text-[#1D1D1F] font-bold">{punchResult.userName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-2">
                <span className="text-[#86868B]">打卡日期</span>
                <span className="text-[#1D1D1F] font-semibold">{punchResult.date}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-2">
                <span className="text-[#86868B]">打卡时戳</span>
                <span className="text-[#1D1D1F] font-semibold font-mono">
                  {isCheckOutMode ? punchResult.checkOutTime : punchResult.checkInTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-2">
                <span className="text-[#86868B]">GPS 围栏偏差</span>
                <span className="text-[#0A84FF] font-bold">
                  {isCheckOutMode ? punchResult.checkOutDistance : punchResult.checkInDistance} 米
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">合规评级</span>
                <span className={`font-bold ${punchResult.riskLevel === "LOW" ? "text-[#30D158]" : "text-[#FF9F0A]"}`}>
                  {punchResult.riskLevel === "LOW" ? "极低风险" : "系统预警打卡"}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/staff/dashboard")}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 border border-black/5 text-zinc-800 text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              返回我的工作大厅
            </button>
          </div>
        ) : (
          /* 二步采集打卡核心表单 */
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50/50 border border-blue-100/50 rounded-2xl text-[11px] text-[#0A84FF] flex gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>根据本次动漫展会安防要求：打卡会同步核验当前移动端 GPS 芯片位置与工作现场自拍照双因子，防止伪造打卡行为。</span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-[#FF453A] font-semibold flex items-center gap-2 animate-scale-up">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: GPS Position */}
            <LocationCapture onCapture={handleLocationCaptured} />

            {/* Step 2: Camera Selfie */}
            <CameraCapture onCapture={handleSelfieCaptured} />

            {/* Action submit button */}
            <div className="pt-2">
              <button
                onClick={triggerConfirmPunch}
                disabled={isSubmitting}
                className="w-full py-4 bg-[#30D158] hover:bg-[#30D158]/95 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "加密特征打包上传中..." : isCheckOutMode ? "确认提交考勤签退打卡" : "确认提交考勤签到打卡"}
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        title="确认提交本次打卡？"
        message="打卡后，系统将自动核算您的签到距离并记录合规水印。打卡数据将在次日进行工资核对，如有异常需要通过各小组长向管理员进行考勤补卡申请。"
        onConfirm={executePunch}
        onCancel={() => setDialogOpen(false)}
        confirmText="确定并提交"
        cancelText="我再核对下"
        type="INFO"
      />
    </MobileLayout>
  );
};
