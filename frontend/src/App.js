import React from 'react';
import './css/App.css';
import Header from './components/Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import Footer from './components/Footer';
import MapPage from './pages/MapPage';
import HomePage from './pages/Home';
import ContactPage from './pages/Contact';
import PlaceEditPage from './pages/PlaceEditPage';

import EventCreatePage from './pages/EventCreatePage';
import EventEditPage from './pages/EventEditPage';



import PlaceCreatePage from './pages/PlaceCreatePage';
import Login from './components/Login';
import Logout from './components/Logout';
import ProtectedRoute from './components/ProtectedRoute';
import { jwtDecode } from 'jwt-decode';
import AdminPanel from './pages/AdminPanel';

// Закомментированы неиспользуемые импорты
// import UpdateMapPage from './pages/UpdateMapPage';
// import EditMapPage from './pages/EditMapPage';

function App() {
  const [state, setState] = React.useState(false);

  React.useEffect(() => {
    getMe();
  }, []);

  const getMe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decode = jwtDecode(token);
        setState(true);
      } else {
        setState(false);
      }
    } catch (error) {
      console.log(error);
      setState(false);
    }
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/MapPage" element={<MapPage />} />
        <Route path="/contacts" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {state && (
          <>
            <Route
              path="/adminpanel"
              element={<ProtectedRoute element={AdminPanel} />}
            />
            <Route
              path="/admin/places/edit/:id"
              element={<ProtectedRoute element={PlaceEditPage} />}
            />
            <Route
              path="/admin/places/new"
              element={<ProtectedRoute element={PlaceCreatePage} />}
            />
            <Route
              path="/admin/events/new"
              element={<ProtectedRoute element={EventCreatePage} />}
            />
            <Route
              path="/admin/events/edit/:id"
              element={<ProtectedRoute element={EventEditPage} />}

            />
          </>
        )}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;