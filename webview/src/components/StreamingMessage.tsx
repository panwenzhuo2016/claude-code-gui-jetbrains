import React, { useEffect, useState } from 'react';
import { Streamdown } from 'streamdown';
import { isInsideCodeBlock, isMarkdownComplete } from '../utils/markdownParser';
import './streaming.css';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  content,
  isStreaming,
  className = '',
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(isStreaming);

  // Handle streaming animation
  useEffect(() => {
    if (isStreaming) {
      setShouldAnimate(true);
    } else {
      // Keep animation for a short period after streaming ends
      const timer = setTimeout(() => setShouldAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  // Determine if we should show incomplete indicator
  const showIncompleteIndicator = isStreaming && !isMarkdownComplete(content) && isInsideCodeBlock(content);

  return (
    <div className={`streaming-message ${className}`}>
      <div className={`markdown-content ${shouldAnimate ? 'streaming-animate' : ''}`}>
        <Streamdown
          className="space-y-0"
          mode={isStreaming ? 'streaming' : 'static'}
          parseIncompleteMarkdown={isStreaming}
          isAnimating={isStreaming}
          shikiTheme={['github-dark', 'github-light']}
          controls={{
            code: true,
            table: true,
          }}
        >
          {content}
        </Streamdown>
      </div>

      {showIncompleteIndicator && (
        <div className="incomplete-indicator">
          <span className="cursor-blink">▋</span>
        </div>
      )}

      {isStreaming && (
        <div className="streaming-indicator">
          <span className="dot-pulse" />
        </div>
      )}
    </div>
  );
};
