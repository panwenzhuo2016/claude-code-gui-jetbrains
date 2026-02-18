import { createContext, useContext, ReactNode } from 'react';
import { api, ClaudeCodeApi } from '../api';
import { useBridgeContext } from './BridgeContext';

interface ApiContextValue {
  api: ClaudeCodeApi;
  isConnected: boolean;
}

const ApiContext = createContext<ApiContextValue | null>(null);

interface ApiProviderProps {
  children: ReactNode;
}

/**
 * Provider that exposes the ClaudeCodeApi and connection status.
 * Must be nested inside BridgeProvider.
 *
 * Bridge 싱글턴이 자체 초기화하므로 initialize() 호출 불필요.
 * isConnected만 BridgeContext에서 가져와서 전파.
 */
export function ApiProvider({ children }: ApiProviderProps) {
  const { isConnected } = useBridgeContext();

  const value: ApiContextValue = {
    api,
    isConnected,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

/**
 * Hook to access the API context
 */
export function useApiContext(): ApiContextValue {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}

/**
 * Hook to access the ClaudeCodeApi instance directly
 */
export function useApi(): ClaudeCodeApi {
  const { api } = useApiContext();
  return api;
}
