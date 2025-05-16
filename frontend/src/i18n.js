import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import est from "./locales/est.json";
import ru from "./locales/ru.json";

const savedLanguage = localStorage.getItem("language") || "en"; // Загружаем сохранённый язык

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      est: { translation: est },
      ru: { translation: ru }
    },
    lng: savedLanguage, // Устанавливаем язык
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
