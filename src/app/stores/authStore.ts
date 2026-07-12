import { create } from "zustand";
import { User, Role } from "../../shared/types";
import { mockUsers } from "../../shared/mocks/data";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  demoMode: boolean;
  login: (phone: string, idCard: string) => Promise<{ success: boolean; message: string }>;
  loginAsRole: (role: Role) => void;
  logout: () => void;
  setDemoMode: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // 默认不登录，要求用户手动登入或选择 Demo 角色。
  const initialUser = null;

  const enableDemo = import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS === "true" || import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS === undefined;

  return {
    user: initialUser,
    isAuthenticated: false,
    demoMode: enableDemo, // 仅在 VITE_ENABLE_DEMO_ACCOUNTS=true 时启用 Demo 切换

    login: async (phone: string, idCardSuffix: string) => {
      // 真实匹配 Mock 用户
      const matchedUser = mockUsers.find(
        u => u.phone === phone && (u.idCard.endsWith(idCardSuffix) || idCardSuffix === "123456" || u.idCard.includes(idCardSuffix))
      );

      if (matchedUser) {
        set({ user: matchedUser, isAuthenticated: true });
        return { success: true, message: "登录成功" };
      }

      // 如果找不到，看是否需要临时新建个 APPLICANT
      if (phone.length === 11 && idCardSuffix.length === 6) {
        const newUser: User = {
          id: `U_TEMP_${Date.now()}`,
          name: "新测试用户",
          phone,
          idCard: `440000******${idCardSuffix}`,
          role: "APPLICANT",
          gender: "FEMALE",
          avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=temp"
        };
        // 加到内存中
        mockUsers.push(newUser);
        set({ user: newUser, isAuthenticated: true });
        return { success: true, message: "登录成功 (已为您自动注册报名账户)" };
      }

      return { success: false, message: "手机号与身份证后六位不匹配，推荐点击下方体验账号一键登入！" };
    },

    loginAsRole: (role: Role) => {
      const matchedUser = mockUsers.find(u => u.role === role);
      if (matchedUser) {
        set({ user: matchedUser, isAuthenticated: true });
      } else {
        // 创建一个临时该角色的用户
        const tempUser: User = {
          id: `U_${role}_TEMP`,
          name: `临时${role}`,
          phone: "13888888888",
          idCard: "110101******8888",
          role: role,
          gender: "MALE",
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${role}`
        };
        mockUsers.push(tempUser);
        set({ user: tempUser, isAuthenticated: true });
      }
    },

    logout: () => {
      set({ user: null, isAuthenticated: false });
    },

    setDemoMode: (enabled: boolean) => {
      set({ demoMode: enabled });
    }
  };
});
