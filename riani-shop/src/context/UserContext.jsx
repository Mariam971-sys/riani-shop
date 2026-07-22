import { createContext, useState } from "react";

export const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("userInfo");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to read userInfo:", error);
      localStorage.removeItem("userInfo");
      return null;
    }
  });

  function login(userData) {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));

    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;