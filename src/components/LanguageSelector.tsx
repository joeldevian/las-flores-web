import { useState } from 'react';

interface LanguageSelectorProps {
  isScrolled?: boolean;
}

export function LanguageSelector({ isScrolled = false }: LanguageSelectorProps) {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es');

  const languageOptions = {
    es: { flag: 'https://flagcdn.com/w40/pe.png', label: 'español' },
    en: { flag: 'https://flagcdn.com/w40/us.png', label: 'english' },
  };

  return (
    <div className="relative pointer-events-auto">
      <button
        onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
        aria-label="Seleccionar idioma"
      >
        <img 
          src={languageOptions[selectedLanguage].flag}
          alt={`${selectedLanguage} flag`}
          className="w-6 h-auto shadow-sm rounded-[2px]" 
        />
      </button>
      
      {/* Dropdown Menu */}
      {languageDropdownOpen && (
        <>
          {/* Backdrop para cerrar el dropdown */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setLanguageDropdownOpen(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-cream rounded-lg shadow-xl border border-nogal/10 overflow-hidden min-w-[140px]">
            {Object.entries(languageOptions).map(([lang, { flag, label }]) => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLanguage(lang as 'es' | 'en');
                  setLanguageDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-nogal hover:bg-nogal/5 transition-colors"
              >
                <img 
                  src={flag}
                  alt={`${lang} flag`}
                  className="w-5 h-auto shadow-sm rounded-[2px]" 
                />
                <span className="font-medium">{label}</span>
                {selectedLanguage === lang && (
                  <span className="ml-auto text-eucalipto">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
