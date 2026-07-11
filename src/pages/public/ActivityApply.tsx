import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "../../app/stores/eventStore";
import { useAuthStore } from "../../app/stores/authStore";
import { Calendar, MapPin, Users, Award, Shield, ArrowRight, ArrowLeft } from "lucide-react";

export const ActivityApply: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { activities } = useEventStore();
  const { isAuthenticated, user } = useAuthStore();

  const activity = activities.find(a => a.id === activityId) || activities[0];

  const handleApplyClick = () => {
    // 如果已经登录，直接跳去填写报名表，否则如果是游客，先强制在表单里自动创建账号或者在这里跳去 /login 注册
    navigate(`/activities/${activity.id}/application-form`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans pb-12">
      {/* Cover Hero Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img src={activity.cover} className="w-full h-full object-cover" alt={activity.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <button 
          onClick={() => navigate("/login")}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft size={14} /> 登入管理
        </button>

        <div className="absolute bottom-6 left-4 right-4 max-w-4xl mx-auto text-white">
          <span className="px-2.5 py-1 bg-[#0A84FF] text-[10px] font-bold rounded-full uppercase tracking-wider">
            正式招募中
          </span>
          <h2 className="text-xl md:text-3xl font-extrabold mt-2 tracking-tight leading-tight">
            {activity.name}
          </h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left main grid: Details */}
        <div className="md:col-span-8 space-y-6">
          {/* Card: Quick Info Bento */}
          <div className="bg-white/84 backdrop-blur-md border border-black/5 rounded-[22px] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm border-b border-zinc-100 pb-2">活动概览</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-blue-50 text-[#0A84FF] rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868B] font-semibold">服务日期</p>
                  <p className="text-xs font-bold">{activity.startDate} 至 {activity.endDate}</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-amber-50 text-[#FF9F0A] rounded-xl">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868B] font-semibold">出勤地点</p>
                  <p className="text-xs font-bold truncate max-w-[200px]">{activity.venue}</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-purple-50 text-[#BF5AF2] rounded-xl">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868B] font-semibold">招募总量</p>
                  <p className="text-xs font-bold">{activity.recruitCount} 名志愿骨干</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-red-50 text-[#FF453A] rounded-xl">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868B] font-semibold">截止日期</p>
                  <p className="text-xs font-bold text-[#FF453A]">{activity.applyDeadline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Description */}
          <div className="bg-white/84 backdrop-blur-md border border-black/5 rounded-[22px] p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm border-b border-zinc-100 pb-2">关于本次会场</h3>
            <p className="text-xs text-[#1D1D1F]/90 leading-relaxed whitespace-pre-line font-medium">
              {activity.description}
            </p>
          </div>

          {/* Card: Available positions list */}
          <div className="bg-white/84 backdrop-blur-md border border-black/5 rounded-[22px] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm border-b border-zinc-100 pb-2">岗位设置及职责</h3>
            <div className="space-y-4">
              {activity.positions.map((pos) => (
                <div key={pos.id} className="p-4 bg-slate-50 border border-black/5 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#1D1D1F]">{pos.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-200/60 rounded text-[#86868B] font-semibold">
                      需 {pos.requireCount} 人
                    </span>
                  </div>
                  <p className="text-xs text-[#86868B] leading-relaxed font-medium">{pos.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Apply bar */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white border border-black/5 rounded-[22px] p-6 shadow-lg space-y-4 sticky top-6">
            <h3 className="font-extrabold text-sm text-[#1D1D1F]">STAFF 福利特权</h3>
            
            <ul className="space-y-3 text-xs font-medium text-[#1D1D1F]/90">
              <li className="flex items-start gap-2">
                <span className="text-[#30D158] shrink-0">✔</span>
                <span><b>包餐供给</b>: 每日精美双餐、冰镇饮用水、红牛不限量供应。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#30D158] shrink-0">✔</span>
                <span><b>专属配饰</b>: 限定版 ACG STAFF 专属短T + 金属合金纪念胸章。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#30D158] shrink-0">✔</span>
                <span><b>出勤证明</b>: 颁发官方印章中英文社会志愿实践出勤证书。</span>
              </li>
            </ul>

            <div className="h-px bg-zinc-100" />

            <button
              onClick={handleApplyClick}
              className="w-full py-3.5 bg-[#0A84FF] hover:bg-[#0A84FF]/95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              立即报名填写报名表
              <ArrowRight size={14} />
            </button>

            {isAuthenticated && user && (
              <div className="bg-slate-50/50 p-2 border border-black/5 rounded-xl text-[10px] text-center text-[#86868B] font-medium">
                检测到您当前已作为 <b>{user.name} ({user.role})</b> 登入
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
