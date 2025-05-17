import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import MapPage from '../pages/MapPage';

import AddMapPage from '../pages/AddMapPage';
import UpdateMapPage from '../pages/UpdateMapPage';
import Login from './Login';
import Logout from './Logout';
import ProtectedRoute from './ProtectedRoute'; // Импортируем компонент для защищенных маршрутов
import { jwtDecode } from 'jwt-decode';

function Content() {
  const [state, setState] = React.useState(false);

  React.useEffect(() => {
    getMe();
  }, []);

  const getMe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decode = jwtDecode(token);
        setState(true); // если токен валиден, значит, пользователь авторизован
      } else {
        setState(false);
      }
    } catch (error) {
      console.log(error);
      setState(false); // если токен невалиден
    }
  };

  return (
    <main className="flex-shrink-0">
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/MapPage" element={<MapPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Защищенные маршруты для добавления и редактирования */}
          {state && (
            <>
              <Route
                path="/addmappage"
                element={<ProtectedRoute element={AddMapPage} />}
              />
              <Route
                path="/editplace"
                element={<ProtectedRoute element={UpdateMapPage} />}
              />
            </>
          )}
        </Routes>
      </Router>
    </main>
  );
}

export default Content;
