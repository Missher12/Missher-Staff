import React, { useState } from "react";
import { useEventStore } from "../../app/stores/eventStore";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { BentoGrid, BentoCard } from "../../shared/ui";
import { Calendar, Users, MapPin, Plus, Save, Scan, CheckCircle, Clock } from "lucide-react";

export const InterviewSessions: React.FC = () => {
  const { interviewSlots, createInterviewSlot, scanInterviewQrCode } = useEventStore();

  // Form states for creating slot
  const [newDate, setNewDate] = useState("2026-07-10");
  const [newTimeRange, setNewTimeRange] = useState("10:00 - 12:00");
  const [newLocation, setNewLocation] = useState("博览中心 B馆 3F-08会议室");
  const [newLimit, setNewLimit] = useState(30);

  // QR Scan Simulator state
  const [scanUserId, setScanUserId] = useState("U_APPLICANT");
  const [selectedSlotId, setSelectedSlotId] = useState("SLOT_02");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    createInterviewSlot({
      activityId: "ACT_2026_01",
      date: newDate,
      timeRange: newTimeRange,
      location: newLocation,
      leaderId: "U_LEADER",
      leaderName: "陈大伟",
      limit: Number(newLimit)
    });
    alert("面试新场次创建成功！");
  };

  const handleSimulateScan = async () => {
    if (!scanUserId) {
      alert("请输入要核销签到的用户 ID");
      return;
    }
    const res = await scanInterviewQrCode(scanUserId, selectedSlotId);
    setScanResult(res);
    setTimeout(() => {
      setScanResult(null);
    }, 4000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">面试考场排班与核签控制台</h2>
          <p className="text-xs text-[#86868B] mt-1">
            设置面试时间段、地点以及负责考核的团队组长，并支持现场扫描电子预约二维码快速入场登记。
          </p>
        </div>

        {/* Grid: Slots list vs Scheduler & QR Scanner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Slots list (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] font-bold text-[#86868B] uppercase block">已开放预约的面试场次 ({interviewSlots.length})</span>
            
            <div className="space-y-3">
              {interviewSlots.map((slot) => (
                <div key={slot.id} className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-blue-50 text-[#0A84FF] rounded-lg">
                        <Calendar size={14} />
                      </span>
                      <span className="font-bold text-[#1D1D1F]">{slot.date} {slot.timeRange}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#86868B] font-semibold">
                      <span className="p-1.5 bg-slate-50 border border-black/5 rounded-lg">
                        <MapPin size={12} />
                      </span>
                      <span>考点: {slot.location}</span>
                    </div>
                    <p className="text-[10px] text-[#86868B] font-medium">考核负责人: 组长 {slot.leaderName}</p>
                  </div>

                  <div className="text-right space-y-1 shrink-0 ml-4">
                    <p className="font-bold text-[#1D1D1F]">
                      预约比: <span className="text-[#0A84FF]">{slot.reservedCount}</span> / {slot.limit} 人
                    </p>
                    <p className="text-[10px] text-[#30D158] font-bold">
                      到场签到: {slot.attendedCount} 人
                    </p>
                    <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden ml-auto">
                      <div 
                        className="h-full bg-[#0A84FF] transition-all"
                        style={{ width: `${(slot.reservedCount / slot.limit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Controls (Scheduler + Scan simulator) (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bento Card: QR Code Scan Simulator */}
            <BentoCard className="space-y-4 border-2 border-[#0A84FF]/20 shadow-md">
              <div>
                <h3 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5 mb-1">
                  <Scan size={16} className="text-[#0A84FF]" /> 60秒电子签到扫码核销器 (模拟)
                </h3>
                <p className="text-[10px] text-[#86868B] font-medium">由现场考核组长使用红外扫描仪或手机相机扫码核对。</p>
              </div>

              {scanResult && (
                <div className={`p-3 border rounded-xl text-xs font-semibold ${
                  scanResult.success 
                    ? "bg-green-50 border-green-150 text-[#30D158]" 
                    : "bg-red-50 border-red-150 text-[#FF453A]"
                }`}>
                  {scanResult.success ? "✔ [扫码核销成功] " : "❌ [核销失败] "}
                  {scanResult.message}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868B]">选择要进行到馆核销的考场场次</label>
                  <select 
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 bg-slate-50 rounded-xl outline-none font-semibold text-xs"
                  >
                    {interviewSlots.map(s => (
                      <option key={s.id} value={s.id}>{s.date} ({s.timeRange})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868B]">输入扫码解析出的令牌/用户 ID</label>
                  <input
                    type="text"
                    value={scanUserId}
                    onChange={(e) => setScanUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-black/5 rounded-xl font-bold font-mono outline-none text-xs"
                    placeholder="例: U_APPLICANT"
                  />
                  <span className="text-[9px] text-zinc-400 font-medium">在林可儿 (APPLICANT) 预约面试后，点击此处扫码，会将他的面试状态变更为【已到场签到】并自动增加签到计数。</span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0A84FF]/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  模拟红外红点扫码核签
                </button>
              </div>
            </BentoCard>

            {/* Bento Card: Scheduler Creator */}
            <BentoCard className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5 mb-1">
                  <Plus size={16} className="text-[#30D158]" /> 新设招募面试时段
                </h3>
                <p className="text-[10px] text-[#86868B] font-medium">新设场次一经保存，将实时推送给通过资料初选的学生候选人。</p>
              </div>

              <form onSubmit={handleCreateSlot} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">日期</label>
                    <input 
                      type="date" 
                      value={newDate} 
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 border border-black/5 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">时间段</label>
                    <input 
                      type="text" 
                      placeholder="例: 14:00 - 15:30" 
                      value={newTimeRange} 
                      onChange={(e) => setNewTimeRange(e.target.value)}
                      className="w-full px-3 py-2 border border-black/5 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500">具体地点</label>
                  <input 
                    type="text" 
                    value={newLocation} 
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500">预约名额上限 (人)</label>
                  <input 
                    type="number" 
                    value={newLimit} 
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/5 rounded-xl outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-black/5 font-bold text-zinc-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save size={14} /> 保存并释放场次
                </button>
              </form>
            </BentoCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
