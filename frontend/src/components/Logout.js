import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  React.useEffect(() => {
    localStorage.removeItem('token'); // Удаляем токен
    navigate('/login'); // Перенаправляем на страницу входа
  }, [navigate]);

  return <div>Выход...</div>;
}

export default Logout;
