import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const ProtectedRoute = ({ element: Element, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Для навигации после выхода

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        jwtDecode(token); // Если токен валиден, пользователь авторизован
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false); // Если токен невалидный
        navigate('/login'); // Перенаправляем на страницу входа
      }
    } else {
      setIsAuthenticated(false);
      navigate('/login'); // Перенаправляем на страницу входа
    }
  }, [navigate]); // Добавляем зависимость от navigate

  return isAuthenticated ? <Element {...rest} /> : null;
};

export default ProtectedRoute;
