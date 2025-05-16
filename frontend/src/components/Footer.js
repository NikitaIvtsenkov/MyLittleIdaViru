import React, { useState, useEffect } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { jwtDecode } from 'jwt-decode';
import logo from "../assets/main/MY-little-IDA-VIRU-WHITE.svg";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
const Footer = () => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const noFooterPaths = [
        '/MapPage',
    ];

    useEffect(() => {
        checkAuthentication();
        fetchCities();
    }, []);

    const checkAuthentication = async () => {
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
            console.error("Token decoding error:", error);
            setIsAuthenticated(false);
        }
    };
const { t } = useTranslation();
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserName('');
    };

    const shouldHideFooter = noFooterPaths.includes(location.pathname);

    if (shouldHideFooter) {
        return null;
    }

    return (
        <footer style={{ zIndex: 1000 }} className="bg-dark text-light py-4 mt-5">
            <div className='mx-6'>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <Navbar.Brand href="/" className="mb-3 mb-md-0">
                        <img
                            src={logo}
                            alt="MY little Estonia logo"
                            height="50"
                            className="d-inline-block align-top"
                        />
                    </Navbar.Brand>
                   
                    <Nav className="flex-column flex-md-row text-center">
                        <Nav.Link href="/" className="text-light px-2">{t('simpleHeader.home')}</Nav.Link>

                        <NavDropdown
                            title={t('simpleHeader.cities')}
                            id="basic-nav-dropdown"
                            className="text-light mx-0 px-0"
                            menuVariant="dark"
                            align="start"
                        >
                            {loading && (
                                <NavDropdown.Item disabled>{t('simpleHeader.loadingCities')}</NavDropdown.Item>
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
                        <Nav.Link href="http://localhost:5000/api-docs" className="text-light px-2">{t('header.swager')}</Nav.Link>

                        {/* {!isAuthenticated && (
                            <Nav.Link href="/login" className="text-light px-2">{t('header.login')}</Nav.Link>
                        )} */}
                       
                        {isAuthenticated && (
                            <>
                                <Nav.Link href="/adminpanel" className="text-light px-2">{t('simpleHeader.adminPanel')}</Nav.Link>
                                <Nav.Link href="/logout" onClick={handleLogout} className="text-light px-2">{t('header.logout')}</Nav.Link>
                            </>
                        )}
                    </Nav>
                </div>
               
                <div className="d-flex flex-column flex-md-row align-items-center mt-4 pt-3 border-top border-secondary">
                    <div className="mb-3 mb-md-0 d-flex align-items-center" style={{ flex: '1 1 33%', textAlign: 'left' }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="#ffffff"
                            className="me-2"
                        >
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                        </svg>
                        <a href="mailto:info@mylittleestonia.com" className="text-light text-decoration-none">
                            info@mylittleestonia.com
                        </a>
                    </div>

                    <div className="text-center" style={{ flex: '1 1 33%' }}>
                        <p className="mb-0">© {new Date().getFullYear()} My little Estonia. All rights reserved.</p>
                    </div>

                    <div className="d-flex justify-content-end gap-2" style={{ flex: '1 1 33%' }}>
                        <a
                            href="https://github.com/NikitaIvtsenkov/MyLittleIdaViru"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                textDecoration: 'none'
                            }}
                        >
                            <img
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                                alt="GitHub Logo"
                                style={{ width: '24px', height: '24px' }}
                            />
                        </a>
                        <a
                            href="https://kutsehariduskeskus.ee/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                textDecoration: 'none'
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 56 56"
                                fill="none"
                            >
                                <path
                                    d="M8.46087 54.2408C0.545707 44.3843 -1.89908 31.3866 1.4777 17.1299C1.82888 15.6812 1.93694 15.4104 2.11253 15.4645C2.2476 15.5052 4.86798 16.1821 7.9476 16.9674C11.0272 17.7662 13.5936 18.4567 13.6476 18.4973C13.7016 18.5515 13.6881 18.8493 13.6071 19.1607C13.5395 19.4857 13.364 20.6907 13.2154 21.8415C11.9727 31.5491 13.7827 40.16 18.6182 47.5524C19.226 48.5002 19.7123 49.2854 19.6853 49.3125C19.5232 49.4479 9.73054 55.2156 9.56845 55.2833C9.43338 55.3239 9.0822 54.999 8.46087 54.2408Z"
                                    fill="#000000"
                                />
                                <path
                                    d="M25.7094 53.8075C20.32 47.7961 17.1053 40.3766 16.0248 31.522C15.7951 29.6536 15.7951 23.3985 16.0248 21.2999C16.2139 19.5804 16.8217 15.5863 16.9297 15.4103C16.9838 15.3156 28.6809 17.6037 28.8295 17.7391C28.8565 17.7797 28.8025 18.565 28.6944 19.4856C28.0191 25.0502 28.0461 30.1545 28.762 33.7559C29.0456 35.1234 30.1667 38.779 30.3423 38.8873C30.3963 38.9144 30.5584 38.5353 30.6935 38.0479C31.1257 36.5179 32.3684 33.431 33.3003 31.6574C34.3404 29.64 36.2449 26.7291 37.8117 24.7524C39.8513 22.1664 46.1456 16.1144 46.6454 16.2498C46.7264 16.2768 48.6984 18.2536 51.0217 20.65L55.2359 25.0096L54.7226 25.4564C53.4935 26.4989 50.5084 29.5317 49.4413 30.8179C44.7139 36.5586 41.5532 44.0728 41.0939 50.6799C41.0399 51.384 40.9589 52.0068 40.9048 52.0339C40.8643 52.0609 38.9463 51.7901 36.6771 51.4381L32.5304 50.7882L29.856 52.616C28.3973 53.6179 27.0601 54.5251 26.9115 54.6334C26.6278 54.8094 26.5603 54.7688 25.7094 53.8075Z"
                                    fill="#000000"
                                />
                                <path
                                    d="M8.93359 14.95C7.21818 14.5303 5.25965 13.1222 4.30065 11.6194C2.126 8.22104 3.09852 3.48232 6.42126 1.28897C7.78548 0.395385 8.71747 0.083984 10.3113 0.016288C11.8511 -0.0649471 12.9047 0.15168 14.1743 0.801561C15.1198 1.27543 16.5381 2.5752 17.1324 3.49586C18.6722 5.8923 18.6587 9.23648 17.1189 11.6329C15.363 14.3408 12.0267 15.6947 8.93359 14.95Z"
                                    fill="#000000"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;