import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/stores/authStore";
import { Shield, Phone, Key, HelpCircle, ArrowRight, UserCheck } from "lucide-react";

export const Login: React.FC = () => {
  const { login, loginAsRole } = useAuthStore();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [idCardSuffix, setIdCardSuffix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !idCardSuffix) {
      setError("请填写手机号和身份证后六位");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await login(phone, idCardSuffix);
      if (res.success) {
        // 根据角色跳转
        const currentRole = useAuthStore.getState().user?.role;
        if (currentRole === "APPLICANT") {
          navigate("/applicant/dashboard");
        } else if (currentRole === "STAFF") {
          navigate("/staff/dashboard");
        } else if (currentRole === "LEADER") {
          navigate("/leader/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("系统通讯出现异常，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (role: "APPLICANT" | "STAFF" | "LEADER" | "ADMIN") => {
    loginAsRole(role);
    if (role === "APPLICANT") {
      navigate("/applicant/dashboard");
    } else if (role === "STAFF") {
      navigate("/staff/dashboard");
    } else if (role === "LEADER") {
      navigate("/leader/dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 md:p-10 font-sans">
      <div className="bg-white/84 backdrop-blur-2xl border border-black/5 rounded-[32px] shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* 1. 左侧：活动宣发海报卡片 (桌面可见) */}
        <div className="md:col-span-5 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] p-8 text-white flex flex-col justify-between relative hidden md:flex">
          {/* Decorative blurry spheres */}
          <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg mb-4">
              S
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">2026 盛夏次元动漫嘉年华</h2>
            <p className="text-[11px] text-white/70 font-semibold tracking-wider uppercase mt-1">STAFF 现场服务招募系统</p>
          </div>

          <div className="relative z-10 space-y-4">
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              “热血夏日，与爱前行。携手加入 STAFF 团队，共赴漫展次元之旅！”
            </p>
            <div className="space-y-2 pt-2 border-t border-white/15 text-[10px] text-white/75 font-mono">
              <p>● 出勤会场: 杭州国际博览中心 (1A-1B)</p>
              <p>● 招募规模: 约 80 名在校志愿骨干</p>
              <p>● 打卡验证: GPS 围栏 + 自拍防作弊算法</p>
            </div>
          </div>
        </div>

        {/* 2. 右侧：登录输入面板 */}
        <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">登入考勤与报名中心</h3>
              <p className="text-xs text-[#86868B] mt-1.5">输入手机号码和身份证后六位，即可查询录取进度或打卡签到。</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-[#FF453A] mb-4 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1D1F]">手机号码</label>
                <div className="relative flex items-center">
                  <Phone size={14} className="absolute left-4 text-[#86868B]" />
                  <input
                    type="tel"
                    placeholder="139xxxx8888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={11}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-medium focus:bg-white focus:border-[#0A84FF] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#1D1D1F]">身份证后六位</label>
                  <span className="text-[10px] text-[#86868B] hover:text-[#0A84FF] cursor-pointer flex items-center gap-1">
                    <HelpCircle size={11} /> 忘记密码/首登
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Shield size={14} className="absolute left-4 text-[#86868B]" />
                  <input
                    type="password"
                    placeholder="请输入身份证后6位"
                    value={idCardSuffix}
                    onChange={(e) => setIdCardSuffix(e.target.value)}
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-medium focus:bg-white focus:border-[#0A84FF] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0A84FF] hover:bg-[#0A84FF]/95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0A84FF]/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "正在验证身份并进入通道..." : "验证并登录"}
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* 3. 底部：快速体验面板 */}
          <div className="pt-6 border-t border-black/5 mt-8">
            <span className="text-[10px] font-bold text-[#86868B] tracking-wider uppercase block mb-2.5 flex items-center gap-1">
              <UserCheck size={12} className="text-[#0A84FF]" /> 快速体验账号 (免密码直接登录)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoClick("APPLICANT")}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-black/5 text-xs font-semibold text-[#1D1D1F] rounded-xl transition-colors cursor-pointer text-center"
              >
                林可儿 (报名)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick("STAFF")}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-black/5 text-xs font-semibold text-[#1D1D1F] rounded-xl transition-colors cursor-pointer text-center"
              >
                李小华 (员工)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick("LEADER")}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-black/5 text-xs font-semibold text-[#1D1D1F] rounded-xl transition-colors cursor-pointer text-center"
              >
                陈大伟 (组长)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick("ADMIN")}
                className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 border border-[#0A84FF]/20 text-xs font-semibold text-[#0A84FF] rounded-xl transition-colors cursor-pointer text-center"
              >
                张晓明 (管理员)
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-[10px] text-zinc-400 hover:underline cursor-pointer" onClick={() => navigate("/activities/ACT_2026_01/apply")}>
                直接去往活动公开报名入口（游客可见）→
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
