import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useBridgeContext } from '@/contexts/BridgeContext';
import { useApi } from '@/contexts/ApiContext';

interface WorkingDirContextValue {
  workingDirectory: string | null;
  setWorkingDirectory: (dir: string | null) => void;
}

const WorkingDirContext = createContext<WorkingDirContextValue | null>(null);

interface Props {
  children: ReactNode;
}

export function WorkingDirProvider(props: Props) {
  const { children } = props;
  const { send, isConnected } = useBridgeContext();
  const api = useApi();
  const location = useLocation();

  const [workingDirectory, setWorkingDirectoryState] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('workingDir') || null;
  });

  const setWorkingDirectory = useCallback((dir: string | null) => {
    setWorkingDirectoryState(dir);
    if (dir) {
      api.setWorkingDir(dir);
      const url = new URL(window.location.href);
      url.searchParams.set('workingDir', dir);
      window.history.replaceState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('workingDir');
      window.history.replaceState({}, '', url.toString());
    }
  }, [api]);

  // Initialize API workingDir on mount
  useEffect(() => {
    if (workingDirectory) {
      api.setWorkingDir(workingDirectory);
    }
  }, [api, workingDirectory]);

  // workingDir가 없는 상태로 연결되면 백엔드에서 process.cwd()를 가져옴
  // 단, 루트 경로(/)에서는 프로젝트 선택 화면이므로 자동 복원하지 않음
  useEffect(() => {
    if (!isConnected || workingDirectory || location.pathname === '/') return;

    send('GET_WORKING_DIR', {}).then((payload: { workingDir: string }) => {
      if (payload?.workingDir) {
        setWorkingDirectory(payload.workingDir);
      }
    }).catch((error: unknown) => {
      console.error('[WorkingDirContext] Failed to get working directory:', error);
    });
  }, [isConnected, workingDirectory, location.pathname, send, setWorkingDirectory]);

  const value: WorkingDirContextValue = {
    workingDirectory,
    setWorkingDirectory,
  };

  return (
    <WorkingDirContext.Provider value={value}>
      {children}
    </WorkingDirContext.Provider>
  );
}

export function useWorkingDir(): WorkingDirContextValue {
  const context = useContext(WorkingDirContext);
  if (!context) {
    throw new Error('useWorkingDir must be used within a WorkingDirProvider');
  }
  return context;
}
