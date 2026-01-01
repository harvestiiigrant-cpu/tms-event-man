import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramWebAppData {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      added_to_attachment_menu?: boolean;
      allows_write_to_pm?: boolean;
      photo_url?: string;
    };
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  headerColor?: string;
  backgroundColor?: string;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  isOrientationLocked: boolean;
}

interface TelegramTheme {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramContextType {
  isRunningInTelegram: boolean;
  webApp: typeof WebApp | null;
  initData: string | null;
  user: TelegramWebAppData['initDataUnsafe']['user'] | null;
  theme: TelegramTheme | null;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  shareMessage: (url: string, text?: string) => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isRunningInTelegram] = useState(() => {
    return typeof window !== 'undefined' && 'Telegram' in window && 'WebApp' in (window as any).Telegram;
  });

  const [initData, setInitData] = useState<string | null>(null);
  const [user, setUser] = useState<TelegramWebAppData['initDataUnsafe']['user'] | null>(null);
  const [theme, setTheme] = useState<TelegramTheme | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isRunningInTelegram) {
      console.log('Not running in Telegram environment');
      return;
    }

    try {
      // Initialize WebApp
      WebApp.ready();

      // Extract data
      const data = WebApp.initData;
      const dataUnsafe = WebApp.initDataUnsafe;
      const themeParams = WebApp.themeParams;

      setInitData(data);
      setUser(dataUnsafe.user || null);
      setTheme(themeParams);
      setIsExpanded(WebApp.isExpanded);

      // Listen to theme changes
      const handleThemeChange = () => {
        setTheme(WebApp.themeParams);
      };

      WebApp.onEvent('themeChanged', handleThemeChange);

      // Listen to viewport changes
      const handleViewportChanged = () => {
        setIsExpanded(WebApp.isExpanded);
      };

      WebApp.onEvent('viewportChanged', handleViewportChanged);

      // Cleanup
      return () => {
        WebApp.offEvent('themeChanged', handleThemeChange);
        WebApp.offEvent('viewportChanged', handleViewportChanged);
      };
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
    }
  }, [isRunningInTelegram]);

  const ready = () => {
    if (isRunningInTelegram) {
      WebApp.ready();
    }
  };

  const expand = () => {
    if (isRunningInTelegram) {
      WebApp.expand();
    }
  };

  const close = () => {
    if (isRunningInTelegram) {
      WebApp.close();
    }
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    if (isRunningInTelegram && WebApp.HapticFeedback) {
      switch (type) {
        case 'light':
          WebApp.HapticFeedback.light();
          break;
        case 'medium':
          WebApp.HapticFeedback.medium();
          break;
        case 'heavy':
          WebApp.HapticFeedback.heavy();
          break;
        case 'rigid':
          WebApp.HapticFeedback.rigid();
          break;
        case 'soft':
          WebApp.HapticFeedback.soft();
          break;
      }
    }
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (isRunningInTelegram && WebApp.MainButton) {
      WebApp.MainButton.text = text;
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    if (isRunningInTelegram && WebApp.MainButton) {
      WebApp.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (isRunningInTelegram && WebApp.BackButton) {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(onClick);
    }
  };

  const hideBackButton = () => {
    if (isRunningInTelegram && WebApp.BackButton) {
      WebApp.BackButton.hide();
    }
  };

  const shareMessage = (url: string, text?: string) => {
    if (isRunningInTelegram && WebApp.shareURL) {
      WebApp.shareURL(url, text);
    }
  };

  const value: TelegramContextType = {
    isRunningInTelegram,
    webApp: isRunningInTelegram ? WebApp : null,
    initData,
    user,
    theme,
    isExpanded,
    setIsExpanded,
    ready,
    expand,
    close,
    hapticFeedback,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    shareMessage,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextType {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}
