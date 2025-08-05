import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
  Typography,
} from '@material-tailwind/react';
import { LanguageIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const languages = [
  {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    
    // Update document direction for RTL languages
    const selectedLang = languages.find(lang => lang.code === languageCode);
    if (selectedLang) {
      document.documentElement.dir = selectedLang.dir;
      document.documentElement.lang = languageCode;
    }
    
    setIsOpen(false);
  };

  return (
    <Menu open={isOpen} handler={setIsOpen}>
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-2 text-sm font-normal capitalize tracking-normal"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3.5 w-3.5 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 rounded ${
              currentLanguage.code === language.code
                ? 'bg-blue-50 text-blue-600'
                : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <Typography
              variant="small"
              className="font-medium"
              color={currentLanguage.code === language.code ? 'blue' : 'inherit'}
            >
              {language.name}
            </Typography>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
