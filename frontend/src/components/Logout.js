// import React, { useEffect } from 'react';
// import { Container, Button } from 'react-bootstrap';
// import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom';

// const Logout = () => {
//     const navigate = useNavigate();

//     // Функция для выхода из системы
//     const logout = () => {
//         window.localStorage.removeItem('token'); // Удаление токена из localStorage
//         Cookies.remove('token'); // Удаление токена из куки
//         navigate('/'); // Перенаправление на главную страницу
//     };

//     // Вызов функции logout при загрузке компонента
//     useEffect(() => {
//         logout();
//     }, []);

//     return (
//         <Container className='container mt-5 textAlign'>
//             <h2>Logout</h2>
//             {/* Не нужна кнопка, так как выход происходит автоматически */}
//         </Container>
//     );
// };

// export default Logout;
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
