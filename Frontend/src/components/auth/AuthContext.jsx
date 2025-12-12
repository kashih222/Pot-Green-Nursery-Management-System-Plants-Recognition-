import { useState, useEffect, createContext, useContext } from 'react';
import axios from "axios";
import Cookies from 'js-cookie';

const AuthContext = createContext();

// Helper functions for storage
const setAuthData = (token, userData) => {
  try {
    // Try localStorage first
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Set secure cookie as fallback
    Cookies.set('auth_token', token, { 
      secure: true, 
      sameSite: 'strict',
      expires: 7 // 7 days
    });
    
    // Set user data in sessionStorage as additional backup
    sessionStorage.setItem("user", JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting auth data:', error);
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    Cookies.remove('auth_token');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

const getAuthData = () => {
  try {
    const token = localStorage.getItem("token") || Cookies.get('auth_token');
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    return { token, user };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(getAuthData().token);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Load user and token on refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext - Initializing auth state');
        const { token: storedToken, user: storedUser } = getAuthData();
        
        console.log('AuthContext - Stored auth data:', { 
          hasToken: !!storedToken, 
          hasUser: !!storedUser 
        });
        
        if (!storedToken) {
          console.log('AuthContext - No stored token found');
          setLoading(false);
          return;
        }

        // Set token in state and axios headers
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('AuthContext - Setting user from storage:', parsedUser);
            setCurrentUser(parsedUser);
          } catch (e) {
            console.error('AuthContext - Error parsing stored user:', e);
            clearAuthData();
            setLoading(false);
            return;
          }
        }

        // Verify token with backend
        console.log('AuthContext - Verifying token with backend');
        const response = await axios.get("http://localhost:8020/api/web/me", {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        if (response.data?.success && response.data?.user) {
          console.log('AuthContext - Token verified, setting user:', response.data.user);
          const userData = response.data.user;
          setCurrentUser(userData);
          setAuthData(storedToken, userData);
        }
      } catch (error) {
        console.error("AuthContext - Auth initialization error:", error);
        if (error.response?.status === 401) {
          console.log('AuthContext - Token invalid or expired, logging out');
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    console.log('AuthContext - Handling logout');
    setCurrentUser(null);
    setToken(null);
    clearAuthData();
    delete axios.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext - Attempting login with:', { email });
      
      // Clear any existing auth data before login
      handleLogout();
      
      const response = await axios.post(
        "http://localhost:8020/api/web/auth/login",
        { email, password }
      );

      console.log('AuthContext - Login response:', response.data);

      if (!response.data) {
        throw new Error("No response data received");
      }

      const { user: userData, token: authToken, message } = response.data;

      if (!userData || !authToken) {
        throw new Error(message || "Invalid response data");
      }

      // Normalize user data
      const userToStore = {
        ...userData,
        _id: userData.id || userData._id,
        role: (userData.role || '').toLowerCase() // Ensure role is lowercase
      };

      console.log('AuthContext - Normalized user data:', userToStore);

      // Store auth data using our helper function
      setAuthData(authToken, userToStore);
      setToken(authToken);
      setCurrentUser(userToStore);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return response.data;
    } catch (err) {
      console.error("AuthContext - Login error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      handleLogout();
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext - Logging out');
      if (token) {
        await axios.get("http://localhost:8020/api/web/logout-id/logouted", {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      handleLogout();
    }
  };

  const updateUser = (updatedUserData) => {
    console.log('AuthContext - Updating user data:', updatedUserData);
    setCurrentUser(updatedUserData);
    setAuthData(token, updatedUserData);
  };

  const isAuthenticated = () => {
    try {
      const { token: storedToken, user: storedUser } = getAuthData();
      const hasUser = !!currentUser;
      const hasToken = !!token;
      
      const isAuthenticated = !!(currentUser && token && storedToken && storedUser);
      
      console.log('AuthContext - Authentication check:', {
        hasUser,
        hasToken,
        hasStoredToken: !!storedToken,
        hasStoredUser: !!storedUser,
        userRole: currentUser?.role,
        isAuthenticated
      });
      
      return isAuthenticated;
    } catch (error) {
      console.error('AuthContext - Error checking authentication:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        token,
        loading,
        isAuthenticated,
        login, 
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
