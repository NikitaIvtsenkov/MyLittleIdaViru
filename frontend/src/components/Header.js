import React from 'react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MainHeader from './MainHeader';

function Header() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Точные пути, где НЕ нужно показывать хедер
  const noHeaderPaths = [
    '/',                // Главная страница
    // '/MapPage',         // Страница карты
    // Добавьте другие пути, где хедер не нужен
  ];

  React.useEffect(() => {
    const checkAdmin = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setIsAdmin(decoded.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Ошибка проверки прав администратора:", error);
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [location]);

  // Проверяем, нужно ли скрыть хедер для текущего пути
  const shouldHideHeader = noHeaderPaths.includes(location.pathname);

  if (shouldHideHeader) {
    return null;
  }

  return <MainHeader isAdmin={isAdmin} />;
}

export default Header;