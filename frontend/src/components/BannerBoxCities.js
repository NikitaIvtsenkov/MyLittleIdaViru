import React from "react";
import { Button, Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import SimpleHeader from "./SimpleHeader";
import '../css/BannerBox.css';

const BannerBox = ({ title, description, image }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const currentLanguage = i18n.language;

  const getButtonClass = (lang) => {
    let className = "language-button";
    if (currentLanguage === lang) {
      className += " active";
    }
    return className;
  };

  return (
    <div className="banner-container" style={{ backgroundImage: `linear-gradient(45deg, rgba(0, 0, 0, 0.6) 36.54%, rgba(0, 0, 0, 0.4) 68.27%, rgba(0, 0, 0, 0.4) 90.38%), url(${image})`,  }}>
      
      
      <div className="banner-content" >
      <SimpleHeader />
      <div>
        <div className="language-buttons">
          <button
            className={getButtonClass("en")}
            onClick={() => changeLanguage("en")}
          >
            ENG
          </button>
          <button
            className={getButtonClass("est")}
            onClick={() => changeLanguage("est")}
          >
            EST
          </button>
          <button
            className={getButtonClass("ru")}
            onClick={() => changeLanguage("ru")}
          >
            RUS
          </button>
        </div>
        <h1 className="banner-title">{title}</h1>
        <p className="banner-description">{description}</p>
      </div>
      </div>
    </div>
  );
};

export default BannerBox;