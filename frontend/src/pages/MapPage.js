// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import BannerBoxCities from '../components/BannerBoxCities';
// import Carousel from '../components/Carousel';
// import PlacesMap from '../components/PlacesMap';
// import homeImage from "../assets/main/JohviMainPhoto.png";
// import axios from 'axios';
// import '../css/App.css';

// const MapPage = () => {
//   const { t } = useTranslation();
//   const location = useLocation();
  
//   // Извлекаем параметр city из URL
//   const queryParams = new URLSearchParams(location.search);
//   const initialCity = queryParams.get('city') || 'Jõhvi'; // Значение по умолчанию, если параметр отсутствует

//   const [city, setCity] = useState(initialCity);
//   const [cities, setCities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Загружаем список городов из API
//   useEffect(() => {
//     const fetchCities = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get('http://localhost:5000/cities');
//         setCities(response.data);
//         // Если город из URL не существует в списке, устанавливаем первый город из списка
//         if (response.data.length > 0 && !response.data.some(c => c.city_name === initialCity)) {
//           setCity(response.data[0].city_name);
//         }
//       } catch (err) {
//         console.error("Ошибка загрузки городов:", err);
//         setError(err.response?.data?.message || "Не удалось загрузить города");
//         setCities([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCities();
//   }, [initialCity]);

//   const handleCityChange = (e) => {
//     const newCity = e.target.value;
//     setCity(newCity);
//     // Обновляем URL без перезагрузки страницы
//     window.history.pushState({}, '', `/MapPage?city=${encodeURIComponent(newCity)}`);
//   };

//   // Динамическое обновление заголовка и описания на основе выбранного города
//   const cityData = cities.find(c => c.city_name === city) || {};
//   const bannerTitle = `${cityData.city_name || city} is a cosy town with a rich history and unique character`;
//   const bannerDescription = `A cozy corner with a distinctive atmosphere, rich historical heritage and unique character, where the past harmoniously combines with the present`;

//   return (
//     <PlacesMap city={city} className="full-width" />

//   );
// };

// export default MapPage;
// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import BannerBoxCities from '../components/BannerBoxCities';
// import Carousel from '../components/Carousel';
// import PlacesMap from '../components/PlacesMap';
// import homeImage from "../assets/main/JohviMainPhoto.png";
// import axios from 'axios';
// import '../css/App.css';

// const MapPage = () => {
//   const { t } = useTranslation();
//   const location = useLocation();
  
//   // Извлекаем параметр city из URL
//   const queryParams = new URLSearchParams(location.search);
//   const initialCity = queryParams.get('city') || 'Narva'; // Значение по умолчанию — Narva

//   const [city, setCity] = useState(initialCity);
//   const [cities, setCities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Загружаем список городов из API
//   useEffect(() => {
//     const fetchCities = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get('http://localhost:5000/cities');
//         setCities(response.data);
//         // Проверяем, существует ли город из URL в списке
//         if (response.data.length > 0 && !response.data.some(c => c.city_name.toLowerCase() === initialCity.toLowerCase())) {
//           console.warn(`City ${initialCity} not found, keeping URL value`);
//           // Оставляем city как есть (Narva)
//         }
//       } catch (err) {
//         console.error("Ошибка загрузки городов:", err);
//         setError(err.response?.data?.message || "Не удалось загрузить города");
//         setCities([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCities();
//   }, [initialCity]);

//   const handleCityChange = (e) => {
//     const newCity = e.target.value;
//     setCity(newCity);
//     // Обновляем URL без перезагрузки страницы
//     window.history.pushState({}, '', `/MapPage?city=${encodeURIComponent(newCity)}`);
//   };

//   // Динамическое обновление заголовка и описания на основе выбранного города
//   const cityData = cities.find(c => c.city_name.toLowerCase() === city.toLowerCase()) || { city_name: city };
//   const bannerTitle = `${cityData.city_name || city} is a cosy town with a rich history and unique character`;
//   const bannerDescription = `A cozy corner with a distinctive atmosphere, rich historical heritage and unique character, where the past harmoniously combines with the present`;

//   return (
//     <PlacesMap city={city} className="full-width" />
//   );
// };

// export default MapPage;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BannerBoxCities from '../components/BannerBoxCities';
import Carousel from '../components/Carousel';
import PlacesMap from '../components/PlacesMap';
import homeImage from "../assets/main/JohviMainPhoto.png";
import axios from 'axios';
import '../css/App.css';

const MapPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Извлекаем параметр city из URL
  const queryParams = new URLSearchParams(location.search);
  const initialCity = queryParams.get('city') || 'Narva'; // Значение по умолчанию — Narva

  const [city, setCity] = useState(initialCity);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем список городов из API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/cities');
        setCities(response.data);
        // Проверяем, существует ли город из URL в списке
        if (response.data.length > 0 && !response.data.some(c => c.city_name.toLowerCase() === initialCity.toLowerCase())) {
          console.warn(`City ${initialCity} not found, keeping URL value`);
          // Оставляем city как есть
        }
      } catch (err) {
        console.error("Ошибка загрузки городов:", err);
        setError(err.response?.data?.message || "Не удалось загрузить города");
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [initialCity]);

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCity(newCity);
    // Обновляем URL без перезагрузки страницы
    window.history.pushState({}, '', `/MapPage?city=${encodeURIComponent(newCity)}`);
  };

  // Динамическое обновление заголовка и описания на основе выбранного города
  const cityData = cities.find(c => c.city_name.toLowerCase() === city.toLowerCase()) || { city_name: city };
  const bannerTitle = `${cityData.city_name || city} is a cosy town with a rich history and unique character`;
  const bannerDescription = `A cozy corner with a distinctive atmosphere, rich historical heritage and unique character, where the past harmoniously combines with the present`;

  // Отладка
  console.log('MapPage city:', city);

  return (
    <PlacesMap city={city} className="full-width" />
  );
};

export default MapPage;