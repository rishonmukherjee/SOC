import { useState } from "react";

export function useRole() {
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });

  const loginUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return {
    user,
    role: user?.role,
    name: user?.name,
    loginUser,
    logoutUser,
    isAuthenticated: !!user,
  };
}
