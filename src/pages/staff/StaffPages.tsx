import React, { useState } from "react";
import { StaffLayout } from "../../app/layouts/StaffLayout";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { 
  useLeaveRequests,
  useSubmitLeaveRequest,
  useAnnouncements,
  useConfirmAnnouncement
} from "../../shared/hooks/useQueries";
import { 
  QrCode, Calendar, Users, FileSpreadsheet, RefreshCw, 
  Clock, MapPin, Send, AlertTriangle, CheckCircle, ShieldCheck, Mail
} from "lucide-react";

// ==========================================
// 1. StaffQrCode (考勤动态保底二维码)
// ==========================================
export const StaffQrCode: React.FC = () => {
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(60);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(p => (p <= 1 ? 60 : p - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StaffLayout title="个人保底二维码">
      <div className="space-y-5 text-center py-6">
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[28px] p-6 shadow-sm max-w-sm mx-auto space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1D1D1F]">实时打卡保底凭证</h2>
            <p className="text-xs text-[#86868B] font-medium leading-relaxed">
              因设备硬件GPS漂移或偏远位置定位失败时，请向组长陈大伟出示此码，扫码直接录入签到。
            </p>
          </div>

          {/* Simulated QR Code card */}
          <div className="w-52 h-52 bg-[#F5F5F7] rounded-3xl mx-auto flex flex-col justify-center items-center border border-black/5 relative p-4 group">
            <QrCode size={160} className="text-zinc-800" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-3xl pointer-events-none" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#86868B] font-semibold">
            <RefreshCw size={13} className="text-[#30D158] animate-spin" />
            <span>防伪水印动态更新，剩余 {timeLeft} 秒</span>
          </div>

          <div className="h-px bg-zinc-100" />

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">安全验证水印</p>
            <p className="text-xs font-bold text-zinc-800 font-mono">STAFF_TOKEN_{user?.phone.substring(7)}_SECURE</p>
          </div>
        </div>

        <p className="text-[10px] text-[#86868B] max-w-xs mx-auto leading-relaxed">
          正式环境由后端提供动态加密签名与物理基准点时间，严禁任何截屏打卡等作弊手段，防伪层动态轮询验证。
        </p>
      </div>
    </StaffLayout>
  );
};

// ==========================================
// 2. StaffWorkDates (班期与出勤日期)
// ==========================================
export const StaffWorkDates: React.FC = () => {
  const dates = [
    { id: "1", date: "2026-07-11", site: "展会博览中心A馆", status: "已完成" },
    { id: "2", date: "2026-07-12", site: "展会博览中心A馆", status: "今日排班" },
    { id: "3", date: "2026-07-13", site: "外场安检大棚区", status: "未开始" },
  ];

  return (
    <StaffLayout title="我的出勤排班表">
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">已分配的出勤工作日</span>
        
        {dates.map((d) => (
          <div key={d.id} className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl p-4.5 shadow-sm flex justify-between items-center">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-[9px] font-extrabold text-zinc-500 font-mono">
                DAY_0{d.id}
              </span>
              <h3 className="text-sm font-black text-[#1D1D1F]">{d.date}</h3>
              <p className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
                <MapPin size={12} /> {d.site}
              </p>
            </div>

            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
              d.status === "已完成" 
                ? "bg-zinc-100 text-zinc-500" 
                : d.status === "今日排班" 
                  ? "bg-[#30D158]/10 text-[#30D158]" 
                  : "bg-blue-50 text-[#0A84FF]"
            }`}>
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </StaffLayout>
  );
};

// ==========================================
// 3. StaffGroup (同组通讯录)
// ==========================================
export const StaffGroup: React.FC = () => {
  const members = [
    { id: "L_01", name: "陈大伟", role: "舞台控场组 • 组长", phone: "13511112222", avatar: null },
    { id: "U_01", name: "林可儿", role: "舞台控场组 • 组员", phone: "13800000001", avatar: null },
    { id: "U_02", name: "张小豪", role: "舞台控场组 • 组员", phone: "13912345678", avatar: null },
    { id: "U_03", name: "苏苏", role: "舞台控场组 • 组员", phone: "13111110000", avatar: null }
  ];

  return (
    <StaffLayout title="同组通讯录">
      <div className="space-y-3.5">
        <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-[#FF9F0A] font-medium leading-relaxed">
          ⚠️ <strong>隐私保护：</strong> 手机通讯录仅供本组紧急调岗调休通讯，根据《网络安全法》，敏感联系信息仅对同组认证人员可见。
        </div>

        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-black/5 flex items-center justify-center font-bold text-sm text-[#0A84FF]">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1D1D1F]">{m.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold">{m.role}</p>
                </div>
              </div>

              <div className="text-right">
                <a href={`tel:${m.phone}`} className="text-xs font-bold text-[#0A84FF] hover:underline font-mono">
                  {m.phone.substring(0,3)}****{m.phone.substring(7)}
                </a>
                <span className="text-[8px] text-zinc-400 block font-mono mt-0.5">ID: {m.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
};

// ==========================================
// 4. StaffLeave (请假申请与记录)
// ==========================================
export const StaffLeave: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useEventStore();
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("2026-07-12");

  const { data: myLeaves = [], isLoading } = useLeaveRequests({ userId: user?.id });
  const submitMutation = useSubmitLeaveRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast("请填写请假原因！", "error");
      return;
    }
    if (!user) return;

    submitMutation.mutate({
      userId: user.id,
      leave: {
        date,
        reason,
        status: "PENDING_LEADER",
        userName: user.name
      }
    }, {
      onSuccess: () => {
        showToast("请假申请已提交，已实时推送给您的组长审核！", "success");
        setReason("");
      },
      onError: (err: any) => {
        showToast(`提交失败: ${err.message}`, "error");
      }
    });
  };

  return (
    <StaffLayout title="向组长申请请假">
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">请假出勤日期</label>
            <select 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full p-3 bg-zinc-50 border border-black/5 rounded-2xl text-xs font-bold outline-none"
            >
              <option value="2026-07-11">2026-07-11 (已过期)</option>
              <option value="2026-07-12">2026-07-12 (今日出勤)</option>
              <option value="2026-07-13">2026-07-13 (明日排班)</option>
              <option value="2026-07-14">2026-07-14 (后续排班)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">请假原因及事由说明</label>
            <textarea
              placeholder="请输入真实的请假原因（病假需后期提供就诊凭证）..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full p-3 bg-zinc-50 border border-black/5 rounded-2xl text-xs font-medium outline-none resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitMutation.isPending}
            className="w-full py-3.5 bg-[#FF453A] text-white font-bold text-xs rounded-full hover:bg-[#FF453A]/90 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Send size={14} /> {submitMutation.isPending ? "正在提交..." : "提交请假单"}
          </button>
        </form>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">历史请假记录</span>
          
          {isLoading ? (
            <div className="text-center py-6 text-xs text-[#86868B]">加载请假记录中...</div>
          ) : myLeaves.length === 0 ? (
            <div className="text-center py-6 bg-white border border-black/5 rounded-2xl text-xs text-[#86868B] font-semibold">
              暂无请假申请历史
            </div>
          ) : (
            myLeaves.map((l: any) => (
              <div key={l.id} className="p-4 bg-white border border-black/5 rounded-2xl flex justify-between items-center text-xs shadow-sm">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1D1D1F]">{l.date} 请假单</p>
                  <p className="text-[10px] text-zinc-400">事由：{l.reason}</p>
                  {l.comment && <p className="text-[10px] text-zinc-500 font-semibold bg-zinc-50 p-1.5 rounded mt-1">审批意见: {l.comment}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  l.status === "PENDING_LEADER" ? "bg-amber-50 text-[#FF9F0A]" :
                  l.status === "PENDING_ADMIN" ? "bg-blue-50 text-[#0A84FF]" :
                  l.status === "APPROVED" ? "bg-green-50 text-[#30D158]" : "bg-red-50 text-[#FF453A]"
                }`}>
                  {l.status === "PENDING_LEADER" ? "待组长初审" :
                   l.status === "PENDING_ADMIN" ? "待管理员终审" :
                   l.status === "APPROVED" ? "已批准" : "已驳回"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

// ==========================================
// 5. StaffAnnouncements (公告消息中心)
// ==========================================
export const StaffAnnouncements: React.FC = () => {
  const { announcements } = useEventStore();
  return (
    <StaffLayout title="最新会务公告">
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl p-4.5 shadow-sm space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                  ann.isRequiredConfirm ? "bg-red-50 text-[#FF453A]" : "bg-blue-50 text-[#0A84FF]"
                }`}>
                  {ann.isRequiredConfirm ? "紧急考勤强制确认" : "常规公告"}
                </span>
                <h3 className="text-xs font-bold text-[#1D1D1F] mt-1.5">{ann.title}</h3>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 shrink-0">{ann.publishDate}</span>
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed font-medium">
              {ann.content}
            </p>
          </div>
        ))}
      </div>
    </StaffLayout>
  );
};

// ==========================================
// 6. StaffProfile (我的资料、结算卡)
// ==========================================
export const StaffProfile: React.FC = () => {
  const { user } = useAuthStore();
  return (
    <StaffLayout title="我的资料档案">
      <div className="space-y-4">
        {/* Personal Basic File Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center font-bold text-xl text-[#30D158]">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">{user?.name}</h2>
              <p className="text-xs text-[#86868B] font-medium">实名 STAFF 账户 • 舞台控场组</p>
            </div>
          </div>

          <div className="h-px bg-zinc-100" />

          <div className="space-y-3 text-xs text-zinc-500 font-semibold">
            <div className="flex justify-between">
              <span>手机号码</span>
              <span className="text-[#1D1D1F] font-mono">{user?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>银行结算卡</span>
              <span className="text-[#1D1D1F] font-mono">6222***********8899</span>
            </div>
            <div className="flex justify-between">
              <span>结算开户行</span>
              <span className="text-[#1D1D1F]">招商银行杭州分行三墩支行</span>
            </div>
            <div className="flex justify-between">
              <span>工作保险单</span>
              <span className="text-[#30D158]">已参保 (太平洋100万意外险)</span>
            </div>
          </div>
        </div>

        {/* Wage stats */}
        <div className="bg-white border border-black/5 rounded-2xl p-4 flex justify-between items-center text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-[#1D1D1F]">本期预计劳务报酬</p>
            <p className="text-[10px] text-zinc-400">计酬基准：¥180 / 天 • 共3天</p>
          </div>
          <span className="text-base font-black text-[#30D158] font-mono">¥540.00</span>
        </div>
      </div>
    </StaffLayout>
  );
};

// ==========================================
// 7. StaffSecurity (会务安全与设置)
// ==========================================
export const StaffSecurity: React.FC = () => {
  return (
    <StaffLayout title="会务安全与设备设置">
      <div className="space-y-4">
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-[#1D1D1F] uppercase tracking-wide flex items-center gap-1">
            <ShieldCheck size={14} className="text-[#30D158]" /> 本地安全沙盒与定位校验
          </h3>

          <div className="space-y-3.5 text-xs text-zinc-500 font-semibold">
            <div className="flex justify-between">
              <span>系统定位GPS状态</span>
              <span className="text-[#30D158] font-bold">● 已授权 (精度5米)</span>
            </div>
            <div className="flex justify-between">
              <span>人脸核查OCR证书</span>
              <span className="text-[#30D158]">● 绑定通过 (腾讯核验接口)</span>
            </div>
            <div className="flex justify-between">
              <span>当前设备系统版本</span>
              <span className="text-[#1D1D1F]">iOS 17.4 / Chrome Mobile</span>
            </div>
            <div className="flex justify-between">
              <span>物理时钟篡改防御</span>
              <span className="text-[#30D158]">● 无篡改防护激活</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-100 rounded-2xl text-[10px] text-[#86868B] font-medium leading-relaxed">
          会务组严格限制任何虚拟定位（Gps Mocking）、越狱挂件以及模拟时钟。打卡提交时会自动记录网络BSSID，违规账号将自动触发红牌封锁。
        </div>
      </div>
    </StaffLayout>
  );
};
