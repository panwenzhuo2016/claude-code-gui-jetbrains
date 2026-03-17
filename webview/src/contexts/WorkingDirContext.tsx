import {createContext, ReactNode, useCallback, useContext, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useBridgeContext} from '@/contexts/BridgeContext';
import {useApi} from '@/contexts/ApiContext';
import {Route, routeToPath, withWorkingDir} from '@/router/routes';

interface WorkingDirContextValue {
  workingDirectory: string | null;
  setWorkingDirectory: (dir: string | null) => void;
}

const WorkingDirContext = createContext<WorkingDirContextValue | null>(null);

interface Props {
  children: ReactNode;
}

export const WORKING_DIR_PARAM_KEY = 'workingDir';

export function WorkingDirProvider(props: Props) {
  const { children } = props;
  const { isConnected } = useBridgeContext();
  const api = useApi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workingDirectory = searchParams.get(WORKING_DIR_PARAM_KEY) || null;

  const setWorkingDirectory = useCallback((dir: string | null) => {
    const currentDir = new URLSearchParams(window.location.search).get(WORKING_DIR_PARAM_KEY);
    if (dir === currentDir) return;

    const target = dir
      ? withWorkingDir(routeToPath(Route.NEW_SESSION), dir)
      : routeToPath(Route.PROJECT_SELECTOR);
    navigate(target, { replace: true });
  }, [navigate]);

  // Routing guard: ensure workingDir and pathname are consistent
  useEffect(() => {
    if (isConnected) setWorkingDirectory(workingDirectory);
  }, [isConnected, workingDirectory, setWorkingDirectory]);

  // Sync workingDir to API whenever it changes
  useEffect(() => {
    if (workingDirectory) {
      api.setWorkingDir(workingDirectory);
    }
  }, [api, workingDirectory]);

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
