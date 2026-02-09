import { AppProviders } from './contexts';
import { ChatPanel } from './components';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts();

  return (
    <AppProviders>
      <ChatPanel />
    </AppProviders>
  );
}

export default App;
