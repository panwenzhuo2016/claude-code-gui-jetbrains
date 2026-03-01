import Tippy from '@tippyjs/react/headless';
import { Tag } from '@/components/ChatInput/Tag';
import { useChatStreamContext } from '@/contexts/ChatStreamContext';
import { calculateContextWindowPercent } from '@/utils/contextWindow';

interface ContextWindowTagProps {
  onClick?: () => void;
}

export function ContextWindowTag({ onClick }: ContextWindowTagProps) {
  const { contextWindowUsage } = useChatStreamContext();

  if (!contextWindowUsage) return null;

  const { inputTokens = 0, outputTokens = 0, model = null } = contextWindowUsage || {};
  const percent = calculateContextWindowPercent(inputTokens, outputTokens, model);
  const remaining = 100 - percent;

  return (
    <Tippy
      placement="top"
      render={(attrs) => (
        <div
          className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-xs text-zinc-200 shadow-lg max-w-[240px]"
          {...attrs}
        >
          <p>{remaining}% of context remaining until auto-compact.</p>
          <p className="text-zinc-400 mt-1 text-[10px]">
            {inputTokens.toLocaleString()} input + {outputTokens.toLocaleString()} output tokens.
          </p>
          <p className="text-zinc-300 mt-1 text-[10px]">Click to compact now.</p>
        </div>
      )}
    >
      <div className="flex items-center">
        <Tag onClick={onClick}>
          <span>{percent}% used</span>
        </Tag>
      </div>
    </Tippy>
  );
}
