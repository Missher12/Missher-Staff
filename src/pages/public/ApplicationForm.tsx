import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "../../app/stores/eventStore";
import { useAuthStore } from "../../app/stores/authStore";
import { FileUploader, ConfirmDialog } from "../../shared/ui";
import { ArrowLeft, ArrowRight, Save, CheckCircle, Info } from "lucide-react";
import { mockUsers } from "../../shared/mocks/data";

export const ApplicationForm: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { activities, submitApplication } = useEventStore();
  const { loginAsRole, user } = useAuthStore();

  const activity = activities.find(a => a.id === activityId) || activities[0];

  // 步进状态：1 = 基础资料, 2 = 结算银行卡, 3 = 出勤倾向与照片
  const [step, setStep] = useState(1);

  // 表单数据
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [idCard, setIdCard] = useState(user?.idCard || "");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("FEMALE");
  const [bankCard, setBankCard] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [targetPositions, setTargetPositions] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [idCardPhoto, setIdCardPhoto] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDateChange = (date: string) => {
    setAvailableDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handlePositionChange = (posName: string) => {
    setTargetPositions(prev => 
      prev.includes(posName) ? prev.filter(p => p !== posName) : [...prev, posName]
    );
  };

  const handleNextStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!name || !phone || !idCard) {
        setErrorMsg("请完整填写姓名、手机号及身份证号码以便为您买保险。");
        return;
      }
      if (phone.length !== 11) {
        setErrorMsg("请输入合法的11位手机号码。");
        return;
      }
      if (idCard.length !== 18) {
        setErrorMsg("请输入合法的18位二代身份证号码（OCR校验）。");
        return;
      }
    } else if (step === 2) {
      if (!bankCard || !bankName) {
        setErrorMsg("请填写银行卡卡号及所属银行，以便活动结束结算工资。");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setStep(prev => prev - 1);
  };

  const triggerConfirmSubmit = () => {
    setErrorMsg("");
    if (availableDates.length === 0) {
      setErrorMsg("请至少选择一个您可以到岗的工作日期！");
      return;
    }
    if (targetPositions.length === 0) {
      setErrorMsg("请至少选择一个您心仪的意向岗位！");
      return;
    }
    if (!experience) {
      setErrorMsg("请简单写几句您的漫展经历，这将大大增加录取通过率！");
      return;
    }
    setDialogOpen(true);
  };

  const executeSubmit = async () => {
    setDialogOpen(false);
    
    // 模拟提交到全局 store
    // 1. 如果当前没有登录，模拟自动创建并登录该 APPLICANT 角色
    let currentUserId = user?.id || `U_TEMP_${Date.now()}`;
    
    // 如果没有，直接将其注入 store 并强制登录为林可儿角色或该临时新角色
    if (!user) {
      // 写入 mockUsers
      const newUser = {
        id: currentUserId,
        name,
        phone,
        idCard,
        role: "APPLICANT" as const,
        gender
      };
      mockUsers.push(newUser);
      // 同时写入 db
      const { db } = await import("../../shared/api/mock-adapter");
      if (!db.users.some(u => u.id === currentUserId)) {
        db.users.push(newUser);
      }
      // 登录它
      useAuthStore.getState().login(phone, idCard.substring(12));
    }

    try {
      await submitApplication({
        userId: currentUserId,
        userName: name,
        userPhone: phone,
        activityId: activity.id,
        activityName: activity.name,
        availableDates,
        experience,
        targetPositions,
        idCardPhoto
      });

      setSubmitSuccess(true);
    } catch (err) {
      setErrorMsg("提交报名表失败，请检查网络重试");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans pb-12 max-w-lg mx-auto border-x border-black/5 bg-white flex flex-col justify-between">
      <div>
        {/* iOS Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-black/5 bg-white/80 backdrop-blur-md flex items-center justify-between px-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-zinc-100 rounded-full text-[#0A84FF] text-xs font-semibold cursor-pointer">
            ← 取消
          </button>
          <span className="font-bold text-sm">填写 STAFF 报名表</span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-zinc-500 font-semibold">
            {step} / 3 步
          </span>
        </header>

        {/* Dynamic step bar */}
        <div className="h-1 bg-zinc-100 w-full">
          <div 
            className="h-full bg-[#0A84FF] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content Box */}
        <div className="p-4 md:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-150 rounded-2xl text-xs text-[#FF453A] font-semibold">
              {errorMsg}
            </div>
          )}

          {submitSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-green-50 text-[#30D158] rounded-full flex items-center justify-center mx-auto border border-green-100">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-extrabold text-[#1D1D1F]">报名提交成功！</h3>
              <p className="text-xs text-[#86868B] max-w-sm mx-auto leading-relaxed">
                恭喜！系统已自动为您创设报名档案。管理员正在对您的背景资质及银行结算信息进行首轮审查，请前往“个人看板”关注后续的面试和录取通知。
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate("/applicant/dashboard")}
                  className="px-6 py-2.5 bg-[#0A84FF] hover:bg-[#0A84FF]/95 text-white text-xs font-bold rounded-full transition-all shadow-sm cursor-pointer"
                >
                  进入我的报名看板
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/50 border border-blue-100/50 rounded-2xl text-[11px] text-[#0A84FF] flex gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>依据会务保障规定：需要收集您正确的身份信息购买意外险并匹配实名制入馆闸机凭证。敏感数据会自动加密脱敏。</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[13px] font-semibold text-[#1D1D1F]">姓名 (需与证件一致)</label>
                    <input 
                      type="text" 
                      placeholder="例：李小华" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#0A84FF] outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[13px] font-semibold text-[#1D1D1F]">性别</label>
                      <select 
                        value={gender} 
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                      >
                        <option value="MALE">男 (Male)</option>
                        <option value="FEMALE">女 (Female)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-semibold text-[#1D1D1F]">联系电话</label>
                      <input 
                        type="tel" 
                        placeholder="例：13911112222" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={11}
                        className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#0A84FF] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[13px] font-semibold text-[#1D1D1F]">二代身份证号码 (实名校验)</label>
                    <input 
                      type="text" 
                      placeholder="请输入18位二代身份证" 
                      value={idCard}
                      onChange={(e) => setIdCard(e.target.value)}
                      maxLength={18}
                      className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#0A84FF] outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Bank Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50/50 border border-amber-150 rounded-2xl text-[11px] text-[#FF9F0A] flex gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>本展会 STAFF 在活动闭馆次日统一打卡结算发放。必须填写实名借记卡号，拒绝他人代领以规避财务风险。</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[13px] font-semibold text-[#1D1D1F]">结算银行卡卡号</label>
                    <input 
                      type="text" 
                      placeholder="请输入借记卡卡号" 
                      value={bankCard}
                      onChange={(e) => setBankCard(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#0A84FF] outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[13px] font-semibold text-[#1D1D1F]">所属银行</label>
                      <input 
                        type="text" 
                        placeholder="例：中国建设银行" 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#0A84FF] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-semibold text-[#1D1D1F]">具体支行 (选填)</label>
                      <input 
                        type="text" 
                        placeholder="例：杭州庆春路支行" 
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#0A84FF] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Shift dates & Experience */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Dates checkboxes */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#1D1D1F] block">可服从安排的出勤日期 (可多选)</label>
                    <div className="flex gap-2">
                      {activity.dates.map(date => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => handleDateChange(date)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            availableDates.includes(date)
                              ? "bg-[#0A84FF] text-white border-[#0A84FF]"
                              : "bg-slate-50 border-black/5 hover:bg-slate-100"
                          }`}
                        >
                          {date === "2026-07-11" ? "周六 (7/11)" : "周日 (7/12)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target positions */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#1D1D1F] block">第一志愿意向岗位 (多选)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {activity.positions.map(pos => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => handlePositionChange(pos.name)}
                          className={`px-3 py-2 border rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                            targetPositions.includes(pos.name)
                              ? "bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]"
                              : "bg-slate-50 border-black/5 hover:bg-slate-100"
                          }`}
                        >
                          {pos.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Uploader */}
                  <FileUploader label="证件照片上传" onUpload={setIdCardPhoto} />

                  {/* Experience */}
                  <div className="space-y-1">
                    <label className="text-[13px] font-semibold text-[#1D1D1F] block">漫展经历或社团经历 (录取关键因子)</label>
                    <textarea
                      placeholder="请简单写写：如是否有过大型活动检票、舞台助理、引导志愿服务经验；能全天连站及服从轮班等..."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#0A84FF] outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Button footer bar (translucent iOS style) */}
      {!submitSuccess && (
        <div className="border-t border-black/5 p-4 bg-white/80 backdrop-blur-md flex gap-3 sticky bottom-0 z-30 justify-between">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3.5 bg-slate-100 text-zinc-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} /> 上一步
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="flex-[2] py-3.5 bg-[#0A84FF] text-white font-bold text-xs rounded-xl hover:bg-[#0A84FF]/95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              下一步 <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={triggerConfirmSubmit}
              className="flex-[2] py-3.5 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] text-white font-bold text-xs rounded-xl hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> 提交资料报名
            </button>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        title="确认提交报名档案？"
        message="提交后系统会自动进行身份录入。在管理员开始初筛之前，您将无法直接对本次申请的银行卡及出勤信息做出在线修改。"
        onConfirm={executeSubmit}
        onCancel={() => setDialogOpen(false)}
        confirmText="确定提交"
        cancelText="我再检查下"
        type="INFO"
      />
    </div>
  );
};
