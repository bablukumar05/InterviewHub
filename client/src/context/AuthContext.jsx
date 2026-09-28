import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inFlightMeRef = useRef(null);

  const getMe = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    if (inFlightMeRef.current) {
      return inFlightMeRef.current;
    }

    const requestPromise = (async () => {
      try {
        const response = await api.get("/auth/me");

        if (response.data.success) {
          setUser(response.data.data.user);
          return response.data.data.user;
        } else {
          localStorage.removeItem("token");
          setUser(null);
          return null;
        }
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
        return null;
      } finally {
        inFlightMeRef.current = null;
        setLoading(false);
      }
    })();

    inFlightMeRef.current = requestPromise;
    return requestPromise;
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        setUser(user);

        if (token) {
          localStorage.setItem("token", token);
        }

        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please try again.",
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post(
        "/auth/register",
        formData
      );

      if (response.data.success) {
        const { user, token } = response.data.data;

        setUser(user);

        if (token) {
          localStorage.setItem("token", token);
        }

        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  const handleOAuthSuccess = async (token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    const freshUser = await getMe();
    return freshUser;
  };

  const devSocialLogin = async (provider = "GOOGLE", role = "CANDIDATE") => {
    try {
      const response = await api.post("/auth/dev-social", {
        provider,
        role,
      });

      if (response.data.success) {
        const { user, token, isNewUser } = response.data.data;

        setUser(user);

        if (token) {
          localStorage.setItem("token", token);
        }

        return {
          success: true,
          user,
          isNewUser,
        };
      }

      return {
        success: false,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Social login simulation failed.",
      };
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      const response = await api.put("/auth/onboarding", onboardingData);

      if (response.data.success) {
        const { user, token } = response.data.data;

        setUser(user);

        if (token) {
          localStorage.setItem("token", token);
        }

        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to complete candidate onboarding. Please try again.",
      };
    }
  };

  const selectRole = completeOnboarding;

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout request failed:",
        error.message
      );
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    getMe();
  }, [getMe]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getMe,
    handleOAuthSuccess,
    devSocialLogin,
    selectRole,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
