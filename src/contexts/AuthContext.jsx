import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = () => {
    try {
      const token = localStorage.getItem('kosan_owner_token');
      const userData = localStorage.getItem('kosan_owner_user');

      if (token && userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth init error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('kosan_owner_token', token);
    localStorage.setItem('kosan_owner_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kosan_owner_token');
    localStorage.removeItem('kosan_owner_user');
    setUser(null);
  };

  /** ✅ SOURCE OF TRUTH */
  const isAuthenticated = () => !!user;

  const isKosanOwner = () => user?.role === 'mitra_owner';

  const hasAccessToKosan = (kosanId) =>
    user?.kosan_id?.toString() === kosanId?.toString();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isKosanOwner,
        hasAccessToKosan
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
