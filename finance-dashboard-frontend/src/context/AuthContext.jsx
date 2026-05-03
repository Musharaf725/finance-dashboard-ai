import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContextStore.js';
import { login as loginRequest } from '../services/authService.js';
import { setAuthToken } from '../services/api.js';
import { decodeJwt } from '../utils/jwtUtils.js';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('finance-auth');
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      const decoded = decodeJwt(parsed.token);
      return {
        token: parsed.token,
        currentUser: parsed.currentUser ?? parsed.user ?? null,
        role: decoded?.role ?? parsed?.role ?? null,
      };
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setAuthToken();
    if (auth) {
      localStorage.setItem('finance-auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('finance-auth');
    }
  }, [auth]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest(credentials);

      // ✅ extract correctly
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;

      const decoded = decodeJwt(token);

      const currentUser = {
        ...user,
        role: decoded?.role ?? user?.role,
      };

      const nextAuth = {
        token,
        currentUser,
        role: currentUser.role,
      };
      setAuth(nextAuth);
      return nextAuth;
    } catch (err) {
      setError(err?.response?.data?.message ?? err.message ?? 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuth(null);
    setError(null);
    setAuthToken();
  };

  const value = useMemo(
    () => ({
      currentUser: auth?.currentUser ?? null,
      role: auth?.role ?? null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      loading,
      error,
      login,
      logout,
      setError,
    }),
    [auth, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
