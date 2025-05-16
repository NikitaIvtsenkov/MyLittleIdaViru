import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <Button variant="primary" onClick={() => changeLanguage('eng')}>ENG</Button>
      <Button variant="primary" onClick={() => changeLanguage('est')}>EST</Button>
      <Button variant="primary" onClick={() => changeLanguage('rus')}>RUS</Button>
    </div>
  );
};

export default LanguageSwitcher;
