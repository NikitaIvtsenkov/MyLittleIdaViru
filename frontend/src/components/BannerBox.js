import React from "react";
import { Button, Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import homeImage from "../assets/main/HomeImage.png"
import { transform } from "framer-motion";
import { transformation } from "leaflet";

const buttonStyle = {
  backgroundColor: "rgba(0,0,0,0)", // Основной цвет кнопки
  border: "1.5px solid rgba(255,255,255)",
  color: "#FFFFFF",            // Цвет текста
  padding: "7px 22px",        // Отступы внутри кнопки
  cursor: "pointer",           // Курсор в виде указателя
  transition: "background-color 0.3s ease", // Плавный переход цвета
  fontFamily: "Manrope",
  borderRadius: "30px"
};

const activeButtonStyle = {
  backgroundColor: "#FFF", // Цвет активной кнопки
  color: "#144F7B",
};



export default function BannerBox() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const textStyle = {
    fontWeight: "500",
    fontFamily: "Manrope",
    width: "48%",
    color: "#FFF"
  };

  const titleStyle = {
    width: "50%",
    fontWeight: "Bold",
    fontFamily: "Manrope",
    color: "#FFF"
  };

  // Определяем текущий язык
  const currentLanguage = i18n.language;

  // Функция для определения стиля кнопки в зависимости от состояния
  const getButtonStyle = (lang) => {
    let style = { ...buttonStyle };

    if (currentLanguage === lang) {
      style = { ...style, ...activeButtonStyle };
    }

    return style;
  };

  return (
    <Container
      fluid
      className="text-black p-0 mt-0 position-relative"
      style={{
        backgroundImage: `url(${homeImage})`,
        height: "600px",
        backgroundSize: "cover",
      }}
    >
      <Container className="position-absolute bottom-0 start-0 p-4">
        <div className="my-4">
          <Button
            style={getButtonStyle("en")}
            className="me-2"
            onClick={() => changeLanguage("en")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = getButtonStyle("en").backgroundColor)}
          >
            ENG
          </Button>
          <Button
            style={getButtonStyle("est")}
            className="me-2"
            onClick={() => changeLanguage("est")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = getButtonStyle("est").backgroundColor)}
          >
            EST
          </Button>
          <Button
            style={getButtonStyle("ru")}
            onClick={() => changeLanguage("ru")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = getButtonStyle("ru").backgroundColor)}
          >
            RUS
          </Button>
        </div>
        <h1 className="mb-4" style={titleStyle}>{t("title")}</h1>
        <p style={textStyle}>{t("description")}</p>
      </Container>
    </Container>
  );
}