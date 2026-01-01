import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/contexts/TelegramContext';

interface TelegramLayoutProps {
  children: React.ReactNode;
  title?: string;
  onBackClick?: () => void;
}

export function TelegramLayout({ children, title, onBackClick }: TelegramLayoutProps) {
  const { isRunningInTelegram, showBackButton, hideBackButton, theme, expand } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    // Expand to full height when component mounts
    expand?.();
  }, [expand]);

  useEffect(() => {
    if (!isRunningInTelegram) {
      return;
    }

    // Setup back button if we have a callback
    if (onBackClick) {
      showBackButton(() => {
        onBackClick?.();
      });
    } else {
      showBackButton(() => {
        navigate(-1);
      });
    }

    return () => {
      hideBackButton?.();
    };
  }, [isRunningInTelegram, showBackButton, hideBackButton, onBackClick, navigate]);

  // Get background and text colors from Telegram theme
  const bgColor = theme?.bg_color || '#ffffff';
  const textColor = theme?.text_color || '#000000';

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Status Bar Area Simulation */}
      <div className="h-4" />

      {/* Header */}
      {title && (
        <header
          className="sticky top-0 z-40 border-b py-4 px-4"
          style={{
            borderColor: theme?.hint_color || '#e0e0e0',
            backgroundColor: bgColor,
          }}
        >
          <h1 className="text-xl font-bold">{title}</h1>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-6">
        <div className="px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Safe Area for notch/home indicator */}
      <div className="h-2" />
    </div>
  );
}
