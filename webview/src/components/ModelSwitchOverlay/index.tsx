import { useEffect, useRef } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useChatStreamContext } from '@/contexts/ChatStreamContext';
import { useBridge } from '@/hooks/useBridge';
import { useSessionContext } from '@/contexts/SessionContext';
import { useClaudeSettings } from '@/contexts/ClaudeSettingsContext';
import { ClaudeModel, LoadedMessageType } from '@/types';
import { CLAUDE_MODELS, getModelDef, parseClaudeModel } from '@/types/models';

export const SWITCH_MODEL_EVENT = 'switch-model';

interface ModelOption {
  value: ClaudeModel;
  label: string;
  sublabel: string;
}

function buildDefaultSublabel(modelValue: string | null | undefined): string {
  if (!modelValue) {
    return 'Claude Code default · Most capable for complex work';
  }
  const parsed = parseClaudeModel(modelValue);
  if (parsed && parsed !== ClaudeModel.DEFAULT) {
    const def = getModelDef(parsed);
    return def.id ? `${def.label} (${def.id})` : def.label;
  }
  return modelValue;
}

interface ModelSwitchOverlayProps {
  onClose: () => void;
}

export function ModelSwitchOverlay({ onClose }: ModelSwitchOverlayProps) {
  const { sessionModel, setSessionModel, appendMessage } = useChatStreamContext();
  const { send } = useBridge();
  const { currentSessionId } = useSessionContext();
  const { settings } = useClaudeSettings();
  const panelRef = useRef<HTMLDivElement>(null);

  const currentModel = sessionModel ?? ClaudeModel.DEFAULT;
  const defaultSublabel = buildDefaultSublabel(settings.model);

  const modelOptions: ModelOption[] = CLAUDE_MODELS.map((m) => ({
    value: m.key,
    label: m.label,
    sublabel: m.key === ClaudeModel.DEFAULT ? defaultSublabel : m.description,
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSelect = async (value: ClaudeModel) => {
    setSessionModel(value);

    const def = getModelDef(value);
    const notificationText = def.id
      ? `Set model to ${def.label.toLowerCase()} (${def.id})`
      : `Set model to ${def.label}`;

    appendMessage({
      type: LoadedMessageType.Notification,
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      summary: notificationText,
    });

    if (currentSessionId) {
      await send('SET_MODEL', { model: value });
    }

    onClose();
  };

  const isSelected = (option: ModelOption): boolean => {
    return currentModel === option.value;
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '0',
        marginBottom: '12px',
        width: 'calc(100%)',
        backgroundColor: 'var(--panel-bg, #252526)',
        borderRadius: 'var(--panel-radius, 6px)',
        boxShadow: 'var(--panel-shadow, 0 4px 12px rgba(0,0,0,0.3))',
        zIndex: 100,
        border: '1px solid var(--divider-color, #3c3c3c)',
      }}
    >
      {/* Header */}
      <div className="pt-1 pb-1.5 px-3 text-[12px] text-zinc-500">
        Select a model
      </div>

      {/* Model list */}
      <div className="pb-1.5 px-1">
        {modelOptions.map((opt) => {
          const selected = isSelected(opt);
          return (
            <button
              key={opt.value}
              onClick={() => void handleSelect(opt.value)}
              className={`w-full relative flex items-center justify-between px-2 py-1 rounded-md text-left transition-colors ${
                selected ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <span className="flex flex-col min-w-0">
                <span className={`leading-tight text-[13px] truncate ${selected ? 'text-zinc-100' : 'text-zinc-200'}`}>
                  {opt.label}
                </span>
                <span className="leading-normal text-[11px] truncate text-zinc-400/80">
                  {opt.sublabel}
                </span>
              </span>
              {selected && (
                <CheckIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex-shrink-0 text-zinc-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
