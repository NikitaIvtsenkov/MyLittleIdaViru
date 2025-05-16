import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { jwtDecode } from 'jwt-decode';
import logo from "../assets/main/MY-little-IDA-VIRU-WHITE.svg";
import axios from 'axios';
import { useTranslation } from 'react-i18next';



function SimpleHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMe();
    fetchCities();
  }, []);
const { t } = useTranslation();

  const getMe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUserName(decoded.name);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
      setIsAuthenticated(false);
    }
  };

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/cities');
      setCities(response.data);
    } catch (err) {
      console.error("Ошибка загрузки городов:", err);
      setError(err.response?.data?.message || "Не удалось загрузить города");
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserName('');
  };

  return (
    <Navbar
      sticky="top"
      collapseOnSelect
      expand="md"
      style={{
        backgroundColor: "transparent",
        // position: "absolute",
        // top: 20,
        // left: 30,
        // right: 30,
        // zIndex: 1000,
      }}
      variant="dark"
    >
      <Container fluid style={{ padding: "0", marginTop: "0.2rem" }}>
        <Navbar.Brand href="/">
          <img src={logo} alt="MY little Estonia logo" height="45" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse style={{ color: "white" }} id="responsive-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link href="/">{t('simpleHeader.home')}</Nav.Link>
            <NavDropdown title={t('simpleHeader.cities')}  id="basic-nav-dropdown" className="text-light mx-0 px-0" align="end">
              {loading && (
                <NavDropdown.Item  disabled>{t('simpleHeader.loadingCities')}</NavDropdown.Item>
              )}
              {error && (
                <NavDropdown.Item disabled>{error}</NavDropdown.Item>
              )}
              {!loading && !error && cities.length === 0 && (
                <NavDropdown.Item disabled>No cities found</NavDropdown.Item>
              )}
              {!loading && !error && cities.map((city) => (
                <NavDropdown.Item 
                  key={city.id} 
                  href={`/MapPage?city=${encodeURIComponent(city.city_name)}`}
                >
                  {city.city_name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            {/* <Nav.Link href="/">Contacts</Nav.Link> */}
            {isAuthenticated && (
              <>
                <Nav.Link href="/adminpanel">{t('simpleHeader.adminPanel')}</Nav.Link>
                <Nav.Link href="/logout" onClick={logout}>{t('header.logout')}</Nav.Link>
              </>
            )}
            {/* {!isAuthenticated && (
              <Nav.Link href="/login">{t('header.login')}</Nav.Link>
            )} */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SimpleHeader;