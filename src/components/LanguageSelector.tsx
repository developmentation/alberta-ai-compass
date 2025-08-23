import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

interface LanguageSelectorProps {
  currentLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
  isLoading?: boolean;
}

export function LanguageSelector({ 
  currentLanguage, 
  availableLanguages, 
  onLanguageChange, 
  isLoading = false 
}: LanguageSelectorProps) {
  const currentLangData = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1">
        <span>{currentLangData?.flag}</span>
        <span>{currentLangData?.name}</span>
      </Badge>
      
      <Select 
        value={currentLanguage} 
        onValueChange={onLanguageChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((langCode) => {
            const langData = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
            return (
              <SelectItem key={langCode} value={langCode}>
                <div className="flex items-center gap-2">
                  <span>{langData?.flag}</span>
                  <span>{langData?.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      )}
    </div>
  );
}