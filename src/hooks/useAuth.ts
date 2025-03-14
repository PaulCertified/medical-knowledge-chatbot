import { useAuth } from '../contexts/AuthContext';

export const useAuthHook = () => {
  const context = useAuth();
  return context;
}; 