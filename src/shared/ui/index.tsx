import React, { useState, useEffect } from "react";
import { 
  Check, AlertTriangle, Info, Shield, Camera, MapPin, 
  Search, Eye, EyeOff, Loader2, QrCode, X, CheckCircle 
} from "lucide-react";

// ==========================================
// 1. StatusBadge (苹果质感状态标签)
// ==========================================
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      // 报名状态
      case "SUBMITTED":
        return { bg: "bg-blue-50 text-blue-600 border-blue-100", text: "已提交" };
      case "PENDING_REVIEW":
        return { bg: "bg-amber-50 text-amber-600 border-amber-100", text: "待资料审核" };
      case "RETURNED":
        return { bg: "bg-purple-50 text-purple-600 border-purple-100", text: "退回补资料" };
      case "APPROVED":
        return { bg: "bg-green-50 text-green-600 border-green-100", text: "审核通过(待安排)" };
      case "WAITLIST":
        return { bg: "bg-zinc-100 text-zinc-600 border-zinc-200", text: "候补名单" };
      case "REJECTED":
        return { bg: "bg-red-50 text-red-600 border-red-100", text: "已驳回" };
      
      // 面试状态
      case "UNSCHEDULED":
        return { bg: "bg-zinc-50 text-zinc-500 border-zinc-150", text: "未安排面试" };
      case "SCHEDULED":
        return { bg: "bg-blue-50 text-blue-500 border-blue-100", text: "已安排面试" };
      case "ATTENDED":
        return { bg: "bg-sky-50 text-sky-600 border-sky-100", text: "已到场签到" };
      case "COMPLETED":
        return { bg: "bg-indigo-50 text-indigo-600 border-indigo-100", text: "面试完成" };
      case "RECOMMENDED":
        return { bg: "bg-green-50 text-green-600 border-green-100", text: "组长推荐" };
      case "WAITING":
        return { bg: "bg-orange-50 text-orange-500 border-orange-100", text: "候补观察" };
      case "NOT_RECOMMENDED":
        return { bg: "bg-red-50 text-red-500 border-red-100", text: "不推荐录用" };

      // 录用状态
      case "PENDING":
        return { bg: "bg-amber-50 text-amber-600 border-amber-100", text: "待终审" };
      case "EMPLOYED":
        return { bg: "bg-green-100 text-green-700 border-green-200", text: "已正式录用" };

      // 考勤状态
      case "NORMAL":
        return { bg: "bg-green-50 text-green-600 border-green-100", text: "正常打卡" };
      case "LATE":
        return { bg: "bg-amber-50 text-amber-600 border-amber-100", text: "迟到" };
      case "EARLY_LEAVE":
        return { bg: "bg-orange-50 text-orange-600 border-orange-100", text: "早退" };
      case "ABSENT":
        return { bg: "bg-red-50 text-red-600 border-red-100", text: "缺勤" };
      case "LEAVE":
        return { bg: "bg-purple-50 text-purple-600 border-purple-100", text: "请假" };
      case "EXCEPTIONAL":
        return { bg: "bg-red-100 text-red-700 border-red-200", text: "考勤异常" };
      case "NONE":
        return { bg: "bg-zinc-100 text-zinc-400 border-zinc-200", text: "今日无排班" };

      default:
        return { bg: "bg-gray-100 text-gray-600 border-gray-200", text: status };
    }
  };

  const config = getStyle();
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      {config.text}
    </span>
  );
};

// ==========================================
// 2. Bento Grid & Bento Card (苹果磁贴网格)
// ==========================================
export const BentoGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 w-full ${className}`}>
    {children}
  </div>
);

interface BentoCardProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
  id?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({ children, span = 12, className = "", id }) => {
  const spanClass = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    7: "md:col-span-7",
    8: "md:col-span-8",
    9: "md:col-span-9",
    10: "md:col-span-10",
    11: "md:col-span-11",
    12: "md:col-span-12",
  }[span];

  return (
    <div
      id={id}
      className={`bg-white/84 backdrop-blur-md border border-black/6 rounded-[22px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] ${spanClass} ${className}`}
    >
      {children}
    </div>
  );
};

// ==========================================
// 3. MetricCard (大盘指标卡)
// ==========================================
interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color?: string; // e.g. "text-[#0A84FF]"
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, icon, color = "text-[#0A84FF]", span = 3 }) => (
  <BentoCard span={span as any} className="relative group overflow-hidden">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[13px] font-medium text-[#86868B] mb-1">{title}</p>
        <h3 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">{value}</h3>
        {subValue && <p className="text-xs text-[#86868B] mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-2xl bg-slate-50 border border-black/5 ${color}`}>
        {icon}
      </div>
    </div>
  </BentoCard>
);

// ==========================================
// 4. SensitiveText (脱敏文本，支持点击隐藏/显示)
// ==========================================
interface SensitiveTextProps {
  text: string;
  type: "IDCARD" | "PHONE" | "BANKCARD" | "NAME";
}

export const SensitiveText: React.FC<SensitiveTextProps> = ({ text, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getMaskedText = () => {
    if (!text) return "";
    if (isVisible) return text;
    
    switch (type) {
      case "IDCARD":
        return text.replace(/^(\d{6})\d+(\d{4}|\w{4})$/, "$1********$2");
      case "PHONE":
        return text.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
      case "BANKCARD":
        return text.replace(/^(\d{4})\d+(\d{4})$/, "$1 **** **** $2");
      case "NAME":
        return text.length > 2 
          ? text.charAt(0) + "*".repeat(text.length - 2) + text.charAt(text.length - 1)
          : text.charAt(0) + "*";
      default:
        return text;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-[#1D1D1F]">
      {getMaskedText()}
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="p-1 text-[#86868B] hover:text-[#0A84FF] rounded-lg transition-colors cursor-pointer"
        title={isVisible ? "隐藏敏感信息" : "显示敏感信息"}
      >
        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </span>
  );
};

// ==========================================
// 5. GPS Location Capture (模拟 GPS 定位)
// ==========================================
interface LocationCaptureProps {
  onCapture: (loc: string, distance: number) => void;
  venueName?: string;
}

export const LocationCapture: React.FC<LocationCaptureProps> = ({ onCapture, venueName = "杭州国际博览中心" }) => {
  const [status, setStatus] = useState<"IDLE" | "LOCATING" | "SUCCESS" | "OUT_RANGE">("IDLE");
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number; distance: number } | null>(null);

  const triggerLocate = () => {
    setStatus("LOCATING");
    setTimeout(() => {
      // 模拟 70% 概率获取到精确合格的定位，30% 随机模拟超出范围或完美定位
      const randomSeed = Math.random();
      if (randomSeed > 0.15) {
        // 定位成功并在范围内
        const distance = Math.floor(Math.random() * 45) + 5; // 5m ~ 50m
        setCoords({ lat: 30.2289, lng: 120.2341, accuracy: 12, distance });
        setStatus("SUCCESS");
        onCapture(`${venueName} A 展厅门厅 (30.2289, 120.2341)`, distance);
      } else {
        // 模拟超出围栏
        const distance = Math.floor(Math.random() * 800) + 180; // 180m ~ 980m
        setCoords({ lat: 30.2452, lng: 120.2104, accuracy: 25, distance });
        setStatus("OUT_RANGE");
        onCapture(`市民中心广场 (30.2452, 120.2104)`, distance);
      }
    }, 1200);
  };

  return (
    <div className="border border-black/5 bg-slate-50/50 p-4 rounded-2xl w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1D1D1F] font-medium">
          <MapPin size={18} className="text-[#0A84FF]" />
          <span>打卡定位验证</span>
        </div>
        <button
          onClick={triggerLocate}
          disabled={status === "LOCATING"}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#0A84FF] text-white hover:bg-[#0A84FF]/90 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {status === "LOCATING" ? <Loader2 size={13} className="animate-spin" /> : null}
          {status === "IDLE" ? "获取实时位置" : "重新定位"}
        </button>
      </div>

      <div className="mt-3 text-sm">
        {status === "IDLE" && <p className="text-[#86868B] text-xs">请点击按钮，获取当前 GPS 坐标与目标会场的实际距离。</p>}
        {status === "LOCATING" && <p className="text-[#0A84FF] text-xs flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> 正在调取高德/GPS接口，精确算算距离中...</p>}
        {status === "SUCCESS" && coords && (
          <div className="space-y-1">
            <p className="text-[#30D158] font-semibold text-xs flex items-center gap-1">
              <CheckCircle size={12} /> 成功进入考勤地理围栏范围
            </p>
            <p className="text-[#1D1D1F] text-xs mt-1">您当前距离 <b>{venueName}</b> 约 <span className="text-[#0A84FF] font-semibold">{coords.distance}米</span>。</p>
            <p className="text-[#86868B] text-[10px] font-mono">精度: {coords.accuracy}m (高精度定位成功)</p>
          </div>
        )}
        {status === "OUT_RANGE" && coords && (
          <div className="space-y-1">
            <p className="text-[#FF453A] font-semibold text-xs flex items-center gap-1">
              <AlertTriangle size={12} /> 定位校验失败: 超出签到范围
            </p>
            <p className="text-[#1D1D1F] text-xs mt-1">您当前距离 <b>{venueName}</b> <span className="text-[#FF453A] font-semibold">{coords.distance}米</span>。考勤围栏规定必须在 <b>100米</b> 范围内！</p>
            <p className="text-[#FF9F0A] text-[10px]">保底提醒：如现场GPS漂移，请联络陈大伟组长使用“保底考勤二维码”由组长直接扫码打卡。</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. Camera Face Capture (模拟自拍摄像头)
// ==========================================
interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const takePhoto = () => {
    setCapturing(true);
    setTimeout(() => {
      // 随机分配一个漂亮的高保真二次元或真实人脸 Avatar 用于模拟自拍
      const seeds = ["joe", "amy", "max", "lily", "sam"];
      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
      const fakePhotoUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${randomSeed}`;
      
      setPhoto(fakePhotoUrl);
      setCapturing(false);
      onCapture(fakePhotoUrl);
    }, 800);
  };

  return (
    <div className="border border-black/5 bg-slate-50/50 p-4 rounded-2xl w-full">
      <div className="flex items-center gap-2 text-[#1D1D1F] font-medium mb-3">
        <Camera size={18} className="text-[#0A84FF]" />
        <span>工作现场自拍验证</span>
      </div>

      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 flex flex-col items-center justify-center border border-black/10">
        {photo ? (
          <>
            <img src={photo} className="w-full h-full object-contain bg-zinc-800" alt="Selfie preview" />
            <button 
              onClick={() => { setPhoto(null); onCapture(""); }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="text-center p-4">
            {capturing ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 size={24} className="animate-spin text-[#0A84FF]" />
                <span className="text-xs text-zinc-400">正在调用高保真现场摄像头并防作弊活检中...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-zinc-800 rounded-full text-zinc-400 mb-1">
                  <Camera size={24} />
                </div>
                <button
                  type="button"
                  onClick={takePhoto}
                  className="px-4 py-2 bg-[#0A84FF] text-white text-xs font-semibold rounded-full hover:bg-[#0A84FF]/90 transition-all cursor-pointer shadow-sm"
                >
                  开启相机并立即自拍
                </button>
                <span className="text-[10px] text-zinc-500">照片会自动带上时间戳与防篡改水印</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 7. QRCode Display (动态二维码，带刷新及刷新条)
// ==========================================
interface QRCodeDisplayProps {
  value: string;
  subText?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, subText = "每60秒自动刷新，请勿截图分享" }) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          return 60; // 刷新
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-black/5 bg-white rounded-3xl shadow-sm text-center">
      <div className="relative p-4 bg-slate-50 rounded-2xl border border-black/5 flex items-center justify-center">
        {/* 精美矢量 Mock QR Code */}
        <div className="relative w-44 h-44 bg-zinc-100 rounded-xl flex flex-col items-center justify-center border border-dashed border-zinc-300">
          <QrCode size={100} className="text-zinc-800" />
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black text-white text-[8px] font-mono rounded">
            TOKEN: {value.substring(0, 8)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-xs text-[#1D1D1F] font-semibold flex items-center justify-center gap-1.5">
          <Loader2 size={12} className="animate-spin text-[#0A84FF]" />
          动态凭证将在 <span className="text-[#0A84FF] font-semibold">{seconds}秒</span> 后刷新
        </p>
        <p className="text-[10px] text-[#86868B]">{subText}</p>
        <div className="w-24 h-1 bg-zinc-100 rounded-full overflow-hidden mx-auto mt-2">
          <div 
            className="h-full bg-[#0A84FF] transition-all duration-1000 ease-linear"
            style={{ width: `${(seconds / 60) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. ConfirmDialog (弹窗组件)
// ==========================================
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, onConfirm, onCancel, confirmText = "确认", cancelText = "取消", type = "INFO"
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    INFO: { color: "text-[#0A84FF]", btn: "bg-[#0A84FF] hover:bg-[#0A84FF]/90" },
    SUCCESS: { color: "text-[#30D158]", btn: "bg-[#30D158] hover:bg-[#30D158]/90" },
    WARNING: { color: "text-[#FF9F0A]", btn: "bg-[#FF9F0A] hover:bg-[#FF9F0A]/90" },
    DANGER: { color: "text-[#FF453A]", btn: "bg-[#FF453A] hover:bg-[#FF453A]/90" },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/94 backdrop-blur-md border border-black/6 rounded-[24px] max-w-sm w-full p-6 shadow-2xl animate-scale-up">
        <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2 mb-2">
          {type === "WARNING" || type === "DANGER" ? <AlertTriangle size={20} className={typeConfig.color} /> : null}
          {title}
        </h3>
        <p className="text-sm text-[#86868B] leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-slate-100 text-[#1D1D1F] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-semibold rounded-full text-white transition-all cursor-pointer ${typeConfig.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. Mobile Navigation (移动端底部栏)
// ==========================================
interface MobileNavProps {
  activeTab: string;
  tabs: Array<{ id: string; label: string; icon: React.ReactNode }>;
  onChange: (id: string) => void;
}

export const MobileNavigation: React.FC<MobileNavProps> = ({ activeTab, tabs, onChange }) => (
  <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-black/5 pb-safe-bottom">
    <div className="flex justify-around items-center h-[58px]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-colors cursor-pointer ${
              isActive ? "text-[#0A84FF] font-semibold" : "text-[#86868B]"
            }`}
          >
            <div className={`mb-0.5 transition-transform ${isActive ? "scale-110" : ""}`}>
              {tab.icon}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

// ==========================================
// 10. File Uploader (精美模拟上传框)
// ==========================================
interface FileUploaderProps {
  label: string;
  onUpload: (url: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ label, onUpload }) => {
  const [file, setFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFakeUpload = () => {
    setUploading(true);
    setTimeout(() => {
      // 随机返回一个高逼格 Unsplash 图片模拟证件照片
      const fakeUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60";
      setFile("身份证正反面_已上传.png");
      setUploading(false);
      onUpload(fakeUrl);
    }, 1000);
  };

  return (
    <div className="space-y-1">
      <label className="text-[13px] font-semibold text-[#1D1D1F] block">{label}</label>
      <div 
        onClick={handleFakeUpload}
        className="border-2 border-dashed border-zinc-200 hover:border-[#0A84FF]/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all"
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-2 text-[#0A84FF]">
            <Loader2 size={20} className="animate-spin mb-1" />
            <span className="text-xs">证件信息OCR智能解析中...</span>
          </div>
        ) : file ? (
          <div className="flex items-center justify-between bg-white border border-black/5 p-2 rounded-xl text-xs">
            <span className="text-[#30D158] font-medium truncate flex items-center gap-1">
              <CheckCircle size={14} /> {file}
            </span>
            <span className="text-[#86868B] hover:text-[#FF453A]" onClick={(e) => { e.stopPropagation(); setFile(null); onUpload(""); }}>
              删除
            </span>
          </div>
        ) : (
          <div className="py-2 text-zinc-400 space-y-1">
            <p className="text-xs font-medium text-[#1D1D1F]">点击上传身份证或相关证明</p>
            <p className="text-[10px] text-zinc-400">支持 JPG, PNG，最大 5MB。支持自动OCR脱敏解析</p>
          </div>
        )}
      </div>
    </div>
  );
};
