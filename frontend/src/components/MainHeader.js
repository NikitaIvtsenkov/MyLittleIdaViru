// import React, { useState, useEffect } from 'react';
// import Container from 'react-bootstrap/Container';
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
// import { jwtDecode } from 'jwt-decode';
// import logo from "../assets/main/MY-little-IDA-VIRU-BLACK.svg";
// import '../css/App.css';
// import axios from 'axios';

// function MainHeader() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userName, setUserName] = useState('');
//   const [cities, setCities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     getMe();
//     fetchCities();
//   }, []);

//   const getMe = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const decoded = jwtDecode(token);
//         setUserName(decoded.name);
//         setIsAuthenticated(true);
//       } else {
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error("Ошибка декодирования токена:", error);
//       setIsAuthenticated(false);
//     }
//   };

//   const fetchCities = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await axios.get('http://localhost:5000/cities');
//       setCities(response.data);
//     } catch (err) {
//       console.error("Ошибка загрузки городов:", err);
//       setError("Не удалось загрузить города");
//       setCities([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setIsAuthenticated(false);
//     setUserName('');
//   };

//   return (
//     <Navbar
//       className="px-5 pt-1"
//       collapseOnSelect
//       expand="md"
//       style={{
//         zIndex: 1000,
//         backgroundColor: "white",
//         boxShadow: "0px 4px 10px -7px rgba(34, 60, 80, 0.1)",
//       }}
//       variant='dark'
//     >
//       <Container fluid style={{ padding: "0", marginTop: "0.2rem" }}>
//         <Navbar.Brand href="/">
//           <img src={logo} alt="MY little Estonia logo" height="45" />
//         </Navbar.Brand>
//         <Navbar.Toggle aria-controls="responsive-navbar-nav" />
//         <Navbar.Collapse style={{ color: "black" }} id="responsive-navbar-nav" className="justify-content-end">
//           <Nav className="custom-nav">
//             <Nav.Link href="/">Home</Nav.Link>
//             <NavDropdown 
//               title="Cities" 
//               id="basic-nav-dropdown"
//             >
//               {loading && (
//                 <NavDropdown.Item disabled>Loading cities...</NavDropdown.Item>
//               )}
//               {error && (
//                 <NavDropdown.Item disabled>{error}</NavDropdown.Item>
//               )}
//               {!loading && !error && cities.length === 0 && (
//                 <NavDropdown.Item disabled>No cities found</NavDropdown.Item>
//               )}
//               {!loading && !error && cities.map((city) => (
//                 <NavDropdown.Item 
//                   key={city.id} 
//                   href={`/MapPage?city=${encodeURIComponent(city.city_name)}`}
//                 >
//                   {city.city_name}
//                 </NavDropdown.Item>
//               ))}
//             </NavDropdown>
//             {/* <Nav.Link href="/">Contacts</Nav.Link> */}
//             {isAuthenticated && (
//               <>
//                 <Nav.Link href="/adminpanel">Admin Panel</Nav.Link>
//                 <Nav.Link href="/logout" onClick={logout}>Log out</Nav.Link>
//               </>
//             )}
//             {!isAuthenticated && (
//               <Nav.Link href="/login">Log in</Nav.Link>
//             )}
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// }

// export default MainHeader;
import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { jwtDecode } from 'jwt-decode';
import logo from "../assets/main/MY-little-IDA-VIRU-BLACK.svg";
import '../css/App.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function MainHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const { t } = useTranslation();

  useEffect(() => {
    getMe();
    fetchCities();
  }, []);

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
      setError("Не удалось загрузить города");
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
      className="px-5 pt-1"
      collapseOnSelect
      expand="md"
      style={{
        zIndex: 1000,
        backgroundColor: "white",
        boxShadow: "0px 4px 10px -7px rgba(34, 60, 80, 0.1)",
      }}
      variant='dark'
    >
      <Container fluid style={{ padding: "0", marginTop: "0.2rem" }}>
        <Navbar.Brand href="/">
          <img src={logo} alt="MY little Estonia logo" height="45" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse style={{ color: "black" }} id="responsive-navbar-nav" className="justify-content-end">
          <Nav className="custom-nav">
            <Nav.Link href="/">{t('header.home')}</Nav.Link>
<NavDropdown title={t('header.cities')} id="basic-nav-dropdown" align="end">
  {loading && <NavDropdown.Item disabled>{t('header.loadingCities')}</NavDropdown.Item>}
  {error && <NavDropdown.Item disabled>{t('header.errorLoadingCities')}</NavDropdown.Item>}
  {!loading && !error && cities.length === 0 && (
    <NavDropdown.Item disabled>{t('header.noCities')}</NavDropdown.Item>
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
                <Nav.Link href="/adminpanel">{t('header.adminPanel')}</Nav.Link>
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

export default MainHeader;