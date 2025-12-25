import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type KhmerFont = 'Suwannaphum' | 'Taprom' | 'Battambang' | 'Bayon' | 'Bokor' | 'Content' | 'Dangrek' | 'Fasthand' | 'Freehand' | 'Kantumruy' | 'Khmer' | 'Koulen' | 'Metal' | 'Moul' | 'Moulpali' | 'Nokora' | 'Odor Mean Chey' | 'Preahvihear' | 'Siemreap' | 'Suwannaphum';

export const KHMER_FONTS: { value: KhmerFont; label: string; labelKm: string }[] = [
  { value: 'Suwannaphum', label: 'Suwannaphum', labelKm: 'សុវណ្ណភូមិ' },
  { value: 'Taprom', label: 'Taprom', labelKm: 'តាព្រហ្ម' },
  { value: 'Battambang', label: 'Battambang', labelKm: 'បាត់ដំបង' },
  { value: 'Bayon', label: 'Bayon', labelKm: 'បាយ័ន' },
  { value: 'Bokor', label: 'Bokor', labelKm: 'បូកគោ' },
  { value: 'Content', label: 'Content', labelKm: 'កុនតឹន' },
  { value: 'Dangrek', label: 'Dangrek', labelKm: 'ដងរែក' },
  { value: 'Fasthand', label: 'Fasthand', labelKm: 'ហ្វាស់ហេន' },
  { value: 'Freehand', label: 'Freehand', labelKm: 'ហ្វ្រីហេន' },
  { value: 'Kantumruy', label: 'Kantumruy', labelKm: 'កន្ទុំរុយ' },
  { value: 'Khmer', label: 'Khmer', labelKm: 'ខ្មែរ' },
  { value: 'Koulen', label: 'Koulen', labelKm: 'គូលេន' },
  { value: 'Metal', label: 'Metal', labelKm: 'មេតល' },
  { value: 'Moul', label: 'Moul', labelKm: 'មូល' },
  { value: 'Moulpali', label: 'Moulpali', labelKm: 'មូលបាលី' },
  { value: 'Nokora', label: 'Nokora', labelKm: 'នគរ' },
  { value: 'Odor Mean Chey', label: 'Odor Mean Chey', labelKm: 'ឧត្ដុងមានជ័យ' },
  { value: 'Preahvihear', label: 'Preahvihear', labelKm: 'ព្រះវិហារ' },
  { value: 'Siemreap', label: 'Siemreap', labelKm: 'សៀមរាប' },
];

interface FontContextType {
  khmerFont: KhmerFont;
  setKhmerFont: (font: KhmerFont) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [khmerFont, setKhmerFontState] = useState<KhmerFont>(() => {
    const saved = localStorage.getItem('khmerFont');
    return (saved as KhmerFont) || 'Suwannaphum';
  });

  useEffect(() => {
    // Update CSS variable when font changes
    document.documentElement.style.setProperty('--font-khmer', `'${khmerFont}'`);

    // Update the font-sans and font-serif variables to include the new Khmer font
    const fontSans = `'Ubuntu', '${khmerFont}', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`;
    const fontSerif = `'Ubuntu', '${khmerFont}', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`;

    document.documentElement.style.setProperty('--font-sans', fontSans);
    document.documentElement.style.setProperty('--font-serif', fontSerif);
  }, [khmerFont]);

  const setKhmerFont = (font: KhmerFont) => {
    setKhmerFontState(font);
    localStorage.setItem('khmerFont', font);
  };

  return (
    <FontContext.Provider value={{ khmerFont, setKhmerFont }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
