import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@chakra-ui/react';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleLanguageChange}
      size="sm"
      width="120px"
      variant="filled"
    >
      <option value="pt-BR">Português</option>
      <option value="en">English</option>
    </Select>
  );
};

export default LanguageSelector;
