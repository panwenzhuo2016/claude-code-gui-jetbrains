import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { SessionDropdown } from './SessionDropdown';
import { Route } from '@/router';
import { Label, ROUTE_META } from '@/router/routes';

interface SessionHeaderProps {
  sessionTitle: string;
  onOpenNewTab: () => void;
  onOpenSettings: () => void;
}

export function SessionHeader({
  sessionTitle,
  onOpenNewTab,
  onOpenSettings,
}: SessionHeaderProps) {
  const settingsMeta = ROUTE_META[Route.SETTINGS];

  return (
    <div className="flex justify-between items-center px-2 py-1">
      {/* Left: Session dropdown */}
      <div className="min-w-0 flex-1">
        <SessionDropdown
          sessionTitle={sessionTitle}
        />
      </div>

      {/* Right: buttons */}
      <div className="flex items-center gap-1">
        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1 rounded transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          title={settingsMeta.label}
        >
          <Cog6ToothIcon className="w-4 h-4" />
        </button>

        {/* New tab button - opens new Claude Code editor tab */}
        <button
          id="new-tab-button"
          onClick={onOpenNewTab}
          className="p-1 rounded transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          title={Label.NEW_TAB}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
