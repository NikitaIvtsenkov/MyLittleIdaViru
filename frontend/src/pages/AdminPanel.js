import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, InputGroup, Spinner, Alert, Dropdown, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PencilSquare, Trash, Plus, Search, Building, Tags, CalendarEvent } from 'react-bootstrap-icons';
import { animated, useSpring } from '@react-spring/web';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const blackMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const AnimatedCounter = ({ value }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return <animated.span>{number.to(n => Math.floor(n))}</animated.span>;
};

const AnimatedPercentage = ({ value }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 1,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return <animated.span>{number.to(n => `${Math.round(n)}%`)}</animated.span>;
};

const AdminPlacesPanel = () => {
  const { t } = useTranslation();
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [eventFilter, setEventFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeCityTab, setActiveCityTab] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [cityCategoryItemsPerPage, setCityCategoryItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: null });
  const [newCity, setNewCity] = useState({ city_name: '', latitude: '', longitude: '' });
  const [mapCenter, setMapCenter] = useState([59.358, 27.419]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('places');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [citySortOrder, setCitySortOrder] = useState('A-Z');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categorySortOrder, setCategorySortOrder] = useState('A-Z');
  const [showEditCityModal, setShowEditCityModal] = useState(false);
  const [cityToEdit, setCityToEdit] = useState(null);
  const [showDeleteCityModal, setShowDeleteCityModal] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  // Новые состояния для фильтрации событий
  const [placeFilter, setPlaceFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [dateTimeFilter, setDateTimeFilter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchCities();
    fetchPlaces();
    fetchEvents();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/categories');
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToLoadCategories'));
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/cities');
      setCities(response.data);
    } catch (err) {
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToLoadCities'));
      console.error('Error fetching cities:', err);
    }
  };

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const placesResponse = await axios.get('http://localhost:5000/places', {
        params: {
          includeCategories: 'true',
        },
      });

      let allEvents = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        try {
          const eventsResponse = await axios.get('http://localhost:5000/events', {
            params: {
              offset: Number(offset),
              limit: Number(limit),
            },
          });
          const { events = [], hasMore: moreEvents = false } = eventsResponse.data;
          allEvents = [...allEvents, ...events];
          hasMore = moreEvents;
          offset += limit;
        } catch (eventErr) {
          console.error('Error fetching events batch:', {
            status: eventErr.response?.status,
            data: eventErr.response?.data,
          });
          break;
        }
      }

      const placesWithEventsSet = new Set(allEvents.map(event => event.placeId));
      const placesWithEventFlag = placesResponse.data.map(place => ({
        ...place,
        hasEvents: placesWithEventsSet.has(place.id),
      }));

      const sortedPlaces = placesWithEventFlag.sort((a, b) => {
        const cityA = a.cityData?.city_name || '';
        const cityB = b.cityData?.city_name || '';
        return cityA.localeCompare(cityB) || a.name.localeCompare(b.name);
      });

      setPlaces(sortedPlaces);
    } catch (err) {
      console.error('Error fetching places:', {
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToLoadPlaces'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventLoading(true);
      let allEvents = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await axios.get('http://localhost:5000/events', {
            params: {
              offset: Number(offset),
              limit: Number(limit),
              includeCities: 'true',
            },
          });
          const { events = [], hasMore: moreEvents = false } = response.data;
          allEvents = [...allEvents, ...events];
          hasMore = moreEvents;
          offset += limit;
        } catch (eventErr) {
          console.error('Error fetching events batch:', {
            status: eventErr.response?.status,
            data: eventErr.response?.data,
          });
          break;
        }
      }

      setEvents(allEvents);
    } catch (err) {
      console.error('Error fetching events:', {
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToLoadEvents'));
    } finally {
      setEventLoading(false);
    }
  };

  const handleParseEvents = async () => {
    try {
      setEventLoading(true);
      await axios.post('http://localhost:5000/parse-events');
      await fetchEvents();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToParseEvents'));
      console.error('Error parsing events:', err);
    } finally {
      setEventLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!placeToDelete) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`http://localhost:5000/places/${placeToDelete.id}`);

      setPlaces(places.filter(place => place.id !== placeToDelete.id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToDeletePlace'));
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization required');

      await axios.delete(`http://localhost:5000/events/${eventToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(events.filter(event => event.id !== eventToDelete.id));
      setShowDeleteEventModal(false);
      setEventToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToDeleteEvent'));
      console.error('Delete event error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddCategory = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      if (newCategory.icon) {
        formData.append('icon', newCategory.icon);
      }

      await axios.post('http://localhost:5000/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowCategoryModal(false);
      setNewCategory({ name: '', icon: null });
      fetchCategories();
    } catch (err) {
      console.error('Add category error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('AdminPlacesPanel_ErrorFailedToAddCategory');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!categoryToEdit) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', categoryToEdit.name);
      if (categoryToEdit.icon instanceof File) {
        formData.append('icon', categoryToEdit.icon);
      }

      await axios.put(`http://localhost:5000/categories/${categoryToEdit.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowEditCategoryModal(false);
      setCategoryToEdit(null);
      fetchCategories();
    } catch (err) {
      console.error('Edit category error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('AdminPlacesPanel_ErrorFailedToEditCategory');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`http://localhost:5000/categories/${categoryToDelete.id}`);

      setCategories(categories.filter(category => category.id !== categoryToDelete.id));
      setShowDeleteCategoryModal(false);
    } catch (err) {
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToDeleteCategory'));
      console.error('Delete category error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddCity = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/cities', newCity);

      setShowCityModal(false);
      setNewCity({ city_name: '', latitude: '', longitude: '' });
      fetchCities();
    } catch (err) {
      console.error('Add city error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('AdminPlacesPanel_ErrorFailedToAddCity');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCity = async () => {
    if (!cityToEdit) return;

    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/cities/${cityToEdit.id}`, {
        city_name: cityToEdit.city_name,
        latitude: cityToEdit.latitude,
        longitude: cityToEdit.longitude,
      });

      setShowEditCityModal(false);
      setCityToEdit(null);
      fetchCities();
    } catch (err) {
      console.error('Edit city error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('AdminPlacesPanel_ErrorFailedToEditCity');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCity = async () => {
    if (!cityToDelete) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`http://localhost:5000/cities/${cityToDelete.id}`);

      setCities(cities.filter(city => city.id !== cityToDelete.id));
      setShowDeleteCityModal(false);
    } catch (err) {
      setError(err.response?.data?.message || t('AdminPlacesPanel_ErrorFailedToDeleteCity'));
      console.error('Delete city error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMapClick = (e, isEditing = false) => {
    const { lat, lng } = e.latlng;
    if (isEditing) {
      setCityToEdit(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      }));
    } else {
      setNewCity(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      }));
    }
    setMapCenter([lat, lng]);
  };

  function MapClickHandler({ isEditing }) {
    useMapEvents({
      click(e) {
        handleMapClick(e, isEditing);
      },
    });
    return null;
  }

  function MapUpdater({ latitude, longitude }) {
    const map = useMap();
    useEffect(() => {
      if (latitude && longitude) {
        map.setView([parseFloat(latitude), parseFloat(longitude)], 13);
      }
    }, [latitude, longitude]);
    return null;
  }

  const resetFilters = () => {
    setSearchTerm('');
    setSortOrder('A-Z');
    setEventFilter('All');
    setCategoryFilter('All');
    setActiveCityTab('All');
    setItemsPerPage(15);
    setCurrentPage(1);
    // Сброс новых фильтров
    setPlaceFilter('All');
    setCityFilter('All');
    setDateTimeFilter('');
  };

  const resetCityCategoryFilters = () => {
    setCitySearchTerm('');
    setCitySortOrder('A-Z');
    setCategorySearchTerm('');
    setCategorySortOrder('A-Z');
    setCityCategoryItemsPerPage(15);
  };

  const getPlacesForActiveCity = () => {
    return activeCityTab === 'All'
      ? places
      : places.filter(place => place.cityData?.city_name === activeCityTab);
  };

  const placesForActiveCity = getPlacesForActiveCity();
  const totalPlaces = placesForActiveCity.length;
  const placesWithEvents = placesForActiveCity.filter(place => place.hasEvents).length;
  const placesWithoutEvents = totalPlaces - placesWithEvents;

  const citiesList = ['All', ...new Set(places.map(place => place.cityData?.city_name).filter(Boolean))].sort();

  const filteredPlaces = placesForActiveCity.filter(place => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (place.cityData?.city_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesEvent =
      eventFilter === 'All' ||
      (eventFilter === 'WithEvents' && place.hasEvents) ||
      (eventFilter === 'WithoutEvents' && !place.hasEvents);

    const matchesCategory =
      categoryFilter === 'All' ||
      place.categories?.some(category => category.id === parseInt(categoryFilter));

    return matchesSearch && matchesEvent && matchesCategory;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    const cityA = a.cityData?.city_name || '';
    const cityB = b.cityData?.city_name || '';
    const comparison = cityA.localeCompare(cityB) || a.name.localeCompare(b.name);
    return sortOrder === 'A-Z' ? comparison : -comparison;
  });

  const totalFilteredPlaces = sortedPlaces.length;
  const paginatedPlaces = sortedPlaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredCities = cities.filter(city =>
    city.city_name.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const sortedCities = [...filteredCities].sort((a, b) => {
    const comparison = a.city_name.localeCompare(b.city_name);
    return citySortOrder === 'A-Z' ? comparison : -comparison;
  });

  const paginatedCities = sortedCities.slice(
    0,
    cityCategoryItemsPerPage
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return categorySortOrder === 'A-Z' ? comparison : -comparison;
  });

  const paginatedCategories = sortedCategories.slice(
    0,
    cityCategoryItemsPerPage
  );

  // Получаем уникальные места для фильтрации
  const uniquePlaces = [...new Set(events.map(event => event.place?.name).filter(Boolean))].sort();

  // Получаем уникальные города для фильтрации
  const uniqueCities = [...new Set(events.map(event => event.city?.city_name).filter(Boolean))].sort();

  // Фильтрация событий с учетом новых фильтров
  const filteredEvents = events.filter(event => {
    const matchesSearch =
      (event.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (event.place?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (event.city?.city_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesPlace =
      placeFilter === 'All' ||
      (event.place?.name === placeFilter);

    const matchesCity =
      cityFilter === 'All' ||
      (event.city?.city_name === cityFilter);

    const matchesDateTime =
      !dateTimeFilter ||
      (event.date_time &&
        new Date(event.date_time).toLocaleDateString().includes(dateTimeFilter));

    return matchesSearch && matchesPlace && matchesCity && matchesDateTime;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return sortOrder === 'A-Z' ? comparison : -comparison;
  });

  const paginatedEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPhotoUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/50';
    return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
  };

  const getIconUrl = (icon) => {
    if (!icon) return 'https://via.placeholder.com/16';
    return icon.startsWith('http') ? icon : `http://localhost:5000${icon}`;
  };

  const buttonStyle = {
    backgroundColor: 'rgba(0,0,0,0)',
    border: '1.5px solid rgba(0,0,0)',
    color: 'black',
    padding: '0.5rem 1.4rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'Manrope', sans-serif",
    borderRadius: '30px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const tabSwitchStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6c757d',
    padding: '0.2rem 0.2rem',
    cursor: 'pointer',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '1rem',
    borderBottom: '2px solid rgba(0,0,0,0)',
  };

  const activeTabSwitchStyle = {
    ...tabSwitchStyle,
    color: '#000',
    fontWeight: 'bold',
    borderBottom: '2px solid #000',
  };

  const tabSwitchHoverStyle = {
    ...tabSwitchStyle,
    borderBottom: 'none',
    color: '#000',
  };

  return (
    <div className="page-container">
      <div className="mt-3 mx-5">
        <div className="d-flex justify-content-between align-items-center mt-4">
          <h2 style={{ fontWeight: "bold" }}>{t('AdminPlacesPanel_Dashboard')}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              style={buttonStyle}
              onClick={() => setShowCityModal(true)}
            >
              <Building size={16} /> {t('cityModal.title')}
            </Button>
            <Button
              style={buttonStyle}
              onClick={() => setShowCategoryModal(true)}
            >
              <Tags size={16} /> {t('AdminPlacesPanel_AddNewCategory')}
            </Button>
            <Button
              style={buttonStyle}
              onClick={() => navigate('/admin/places/new')}
            >
              <Plus size={16} /> {t('AdminPlacesPanel_AddNewPlace')}
            </Button>
            <Button
              style={buttonStyle}
              onClick={() => navigate('/admin/events/new')}
            >
              <CalendarEvent size={16} /> {t('AdminPlacesPanel_AddNewEvent')}
            </Button>
          </div>
        </div>

        <div className="mb-5 mt-3 rounded">
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            <div style={{
              flex: 1,
              minWidth: '200px',
              boxShadow: '0px 4px 10px -7px rgba(34, 60, 80, 0.1)',
              padding: '30px 30px',
              borderRadius: '10px',
              backgroundColor: '#fff',
              border: "1px solid rgb(240,240,240)",
            }}>
              <h5 style={{ fontWeight: "bold" }}>{t('AdminPlacesPanel_TotalPlaces')}</h5>
              <h2 style={{ fontWeight: "bold", color: "#245491" }}>
                <AnimatedCounter value={totalPlaces} />
                <span style={{ fontWeight: "300" }}> | </span>
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {activeCityTab === 'All' ? t('AdminPlacesPanel_InAllCities') : t('AdminPlacesPanel_InCity', { city: activeCityTab })}
                </span>
              </h2>
            </div>
            <div style={{
              flex: 1,
              minWidth: '200px',
              boxShadow: '0px 4px 10px -7px rgba(34, 60, 80, 0.1)',
              padding: '30px 30px',
              borderRadius: '10px',
              backgroundColor: '#fff',
              border: "1px solid rgb(240,240,240)",
            }}>
              <h5 style={{ fontWeight: "bold" }}>{t('AdminPlacesPanel_PlacesWithEvents')}</h5>
              <h2 style={{ fontWeight: "bold", color: "#7B41A4" }}>
                <AnimatedCounter value={placesWithEvents} />
                <span style={{ fontWeight: "300" }}> | </span>
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {t('AdminPlacesPanel_AspectRatio')}{' '}
                  <AnimatedPercentage
                    value={totalPlaces > 0 ? (placesWithEvents / totalPlaces) * 100 : 0}
                  />
                </span>
              </h2>
            </div>
            <div style={{
              flex: 1,
              minWidth: '200px',
              boxShadow: '0px 4px 10px -7px rgba(34, 60, 80, 0.1)',
              padding: '30px 30px',
              borderRadius: '10px',
              backgroundColor: '#fff',
              border: "1px solid rgb(240,240,240)",
            }}>
              <h5 style={{ fontWeight: "bold" }}>{t('AdminPlacesPanel_PlacesWithoutEvents')}</h5>
              <h2 style={{ fontWeight: "bold", color: "#d16f3b" }}>
                <AnimatedCounter value={placesWithoutEvents} />
                <span style={{ fontWeight: "300" }}> | </span>
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {t('AdminPlacesPanel_AspectRatio')}{' '}
                  <AnimatedPercentage
                    value={totalPlaces > 0 ? (placesWithoutEvents / totalPlaces) * 100 : 0}
                  />
                </span>
              </h2>
            </div>
          </div>
        </div>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

        <div className="mb-3">
          <div style={{ marginBottom: '3rem' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: "bold" }}>{t('AdminPlacesPanel_ListView')}</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                style={activeTab === 'places' ? activeTabSwitchStyle : tabSwitchStyle}
                onClick={() => setActiveTab('places')}
                onMouseEnter={(e) => e.target.style.color = tabSwitchHoverStyle.color}
                onMouseLeave={(e) => e.target.style.color = activeTab === 'places' ? activeTabSwitchStyle.color : tabSwitchStyle.color}
              >
                {t('AdminPlacesPanel_Places')}
              </button>
              <button
                style={activeTab === 'cities-categories' ? activeTabSwitchStyle : tabSwitchStyle}
                onClick={() => setActiveTab('cities-categories')}
                onMouseEnter={(e) => e.target.style.color = tabSwitchHoverStyle.color}
                onMouseLeave={(e) => e.target.style.color = activeTab === 'cities-categories' ? activeTabSwitchStyle.color : tabSwitchStyle.color}
              >
                {t('AdminPlacesPanel_CitiesAndCategories')}
              </button>
              <button
                style={activeTab === 'events' ? activeTabSwitchStyle : tabSwitchStyle}
                onClick={() => setActiveTab('events')}
                onMouseEnter={(e) => e.target.style.color = tabSwitchHoverStyle.color}
                onMouseLeave={(e) => e.target.style.color = activeTab === 'events' ? activeTabSwitchStyle.color : tabSwitchStyle.color}
              >
                {t('AdminPlacesPanel_Events')}
              </button>
            </div>
          </div>

          {activeTab === 'places' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 mt-1">
                <InputGroup
                  style={{
                    width: '300px',
                    border: '1px solid rgb(240,240,240)',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                  }}
                >
                  <InputGroup.Text
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '0 8px 0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Search style={{ color: 'gray', fontSize: '1rem' }} />
                  </InputGroup.Text>
                  <Form.Control
                    className="py-2"
                    placeholder={t('AdminPlacesPanel_Searching')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: 'none',
                      color: 'black',
                      boxShadow: 'none',
                      paddingLeft: '0',
                    }}
                  />
                </InputGroup>
                <div className="d-flex gap-2">
                  <Dropdown>
                    <Dropdown.Toggle
                      className="py-2 px-3"
                      variant="outline-secondary"
                      id="sort-dropdown"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'rgb(240,240,240)',
                        color: 'gray',
                      }}
                    >
                      {t('AdminPlacesPanel_SortTitle')}: <span style={{ color: 'black' }}>{sortOrder === 'A-Z' ? t('AdminPlacesPanel_SortAZ') : t('AdminPlacesPanel_SortZA')}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setSortOrder('A-Z')}>{t('AdminPlacesPanel_SortAZ')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortOrder('Z-A')}>{t('AdminPlacesPanel_SortZA')}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Dropdown>
                    <Dropdown.Toggle
                      className="py-2 px-3"
                      variant="outline-secondary"
                      id="event-filter-dropdown"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'rgb(240,240,240)',
                        color: 'gray',
                        zIndex: 1000,
                      }}
                    >
                      {t('AdminPlacesPanel_Events')}: {' '}
                      <span style={{ color: 'black' }}>
                        {eventFilter === 'All' ? t('AdminPlacesPanel_EventsAll') : eventFilter === 'WithEvents' ? t('AdminPlacesPanel_EventsWith') : t('AdminPlacesPanel_EventsWithout')}
                      </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setEventFilter('All')}>{t('AdminPlacesPanel_EventsAll')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => setEventFilter('WithEvents')}>{t('AdminPlacesPanel_EventsWith')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => setEventFilter('WithoutEvents')}>{t('AdminPlacesPanel_EventsWithout')}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Dropdown>
                    <Dropdown.Toggle
                      className="py-2 px-3"
                      variant="outline-secondary"
                      id="category-filter-dropdown"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'rgb(240,240,240)',
                        color: 'gray',
                      }}
                    >
                      {t('AdminPlacesPanel_Categories')}: {' '}
                      <span style={{ color: 'black' }}>
                        {categoryFilter === 'All' ? t('AdminPlacesPanel_CategoryAll') : categories.find((cat) => cat.id === parseInt(categoryFilter))?.name}
                      </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setCategoryFilter('All')}>{t('AdminPlacesPanel_CategoryAll')}</Dropdown.Item>
                      {categories.map((category) => (
                        <Dropdown.Item key={category.id} onClick={() => setCategoryFilter(category.id.toString())}>
                          {category.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button
                    variant="outline-secondary"
                    onClick={resetFilters}
                    style={{
                      backgroundColor: '#fff',
                      border: "none",
                      color: '#dc3545',
                    }}
                  >
                    {t('AdminPlacesPanel_ResetFilters')}
                  </Button>
                </div>
              </div>

              <div style={{ borderRadius: '12px', border: '1px solid rgb(240,240,240)' }} className="p-4 bg-white">
                <Tabs
                  activeKey={activeCityTab}
                  onSelect={(k) => setActiveCityTab(k)}
                  className="mb-3 custom-tabs"
                >
                  {citiesList.map((city) => (
                    <Tab
                      eventKey={city}
                      title={
                        <span className="d-flex align-items-center">
                          {city}
                          {city !== 'All' && (
                            <span
                              className="d-inline-flex align-items-center justify-content-center ms-2"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#f0f0f0',
                                fontSize: '12px',
                                fontWeight: '500',
                              }}
                            >
                              {places.filter((p) => p.cityData?.city_name === city).length}
                            </span>
                          )}
                        </span>
                      }
                      key={city}
                    >
                      {loading ? (
                        <div className="text-center">
                          <Spinner animation="border" />
                        </div>
                      ) : (
                        <>
                          <Table borderless hover responsive className="mt-1">
                            <thead>
                              <tr>
                                <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_TablePhoto')}</th>
                                <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_TableName')}</th>
                                {activeCityTab === 'All' && <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_TableCity')}</th>}
                                <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_TableLocation')}</th>
                                <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_TableWorkingHours')}</th>
                                <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_TableCategories')}</th>
                                <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_TableHasEvents')}</th>
                                <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_TableActions')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedPlaces.map((place) => (
                                <tr key={place.id} className="border-top border-bottom">
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <img
                                      src={getPhotoUrl(place.photo)}
                                      alt={place.name}
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        borderRadius: '10%',
                                      }}
                                    />
                                  </td>
                                  <td style={{ verticalAlign: 'middle', color: 'black', fontWeight: '400' }}>
                                    {place.name}
                                  </td>
                                  {activeCityTab === 'All' && (
                                    <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>
                                      {place.cityData?.city_name || '-'}
                                    </td>
                                  )}
                                  <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>{place.location || '-'}</td>
                                  <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>
                                    {place.working_hours || '-'}
                                  </td>
                                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '5px',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {place.categories?.map((category) => {
                                        const categoryData = categories.find((cat) => cat.id === category.id);
                                        return (
                                          <img
                                            key={category.id}
                                            src={getIconUrl(categoryData?.icon)}
                                            alt={category.name}
                                            title={category.name}
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              objectFit: 'contain',
                                              filter: 'grayscale(100%) opacity(0.55)',
                                            }}
                                          />
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      verticalAlign: 'middle',
                                      textAlign: 'center',
                                      color: place.hasEvents ? '#28a745' : '#dc3545',
                                      fontWeight: '400',
                                    }}
                                  >
                                    {place.hasEvents ? t('AdminPlacesPanel_HasEventsYes') : t('AdminPlacesPanel_HasEventsNo')}
                                  </td>
                                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="me-1 p-0"
                                      onClick={() => navigate(`/admin/places/edit/${place.id}`)}
                                      title="Edit"
                                    >
                                      <PencilSquare className="text-secondary" style={{ fontSize: '1.1rem' }} />
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0"
                                      onClick={() => {
                                        setPlaceToDelete(place);
                                        setShowDeleteModal(true);
                                      }}
                                      title="Delete"
                                    >
                                      <Trash className="text-secondary" style={{ fontSize: '1.1rem' }} />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          <div className="d-flex align-items-center gap-2 mt-3">
                            <span>{t('AdminPlacesPanel_Showing')}</span>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                id="items-per-page-dropdown"
                                style={{
                                  backgroundColor: 'white',
                                  borderColor: 'rgb(240,240,240)',
                                  color: 'black',
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {itemsPerPage}
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => { setItemsPerPage(10); setCurrentPage(1); }}>10</Dropdown.Item>
                                <Dropdown.Item onClick={() => { setItemsPerPage(15); setCurrentPage(1); }}>15</Dropdown.Item>
                                <Dropdown.Item onClick={() => { setItemsPerPage(20); setCurrentPage(1); }}>20</Dropdown.Item>
                                <Dropdown.Item onClick={() => { setItemsPerPage(50); setCurrentPage(1); }}>50</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <span>{t('AdminPlacesPanel_OutOf')} {totalFilteredPlaces}</span>
                          </div>
                        </>
                      )}
                    </Tab>
                  ))}
                </Tabs>
              </div>
            </div>
          )}

          {activeTab === 'cities-categories' && (
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: '1', width: '50%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3 mt-1">
                  <InputGroup
                    style={{
                      width: '300px',
                      border: '1px solid rgb(240,240,240)',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      overflow: 'hidden',
                    }}
                  >
                    <InputGroup.Text
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0 8px 0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Search style={{ color: 'gray', fontSize: '1rem' }} />
                    </InputGroup.Text>
                    <Form.Control
                      className="py-2"
                      placeholder={t('AdminPlacesPanel_SearchCities')}
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      style={{
                        border: 'none',
                        color: 'black',
                        boxShadow: 'none',
                        paddingLeft: '0',
                      }}
                    />
                  </InputGroup>
                  <div className="d-flex gap-2">
                    <Dropdown>
                      <Dropdown.Toggle
                        className="py-2 px-3"
                        variant="outline-secondary"
                        id="city-sort-dropdown"
                        style={{
                          backgroundColor: 'white',
                          borderColor: 'rgb(240,240,240)',
                          color: 'gray',
                        }}
                      >
                        {t('AdminPlacesPanel_SortTitle')}: <span style={{ color: 'black' }}>{citySortOrder === 'A-Z' ? t('AdminPlacesPanel_SortAZ') : t('AdminPlacesPanel_SortZA')}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setCitySortOrder('A-Z')}>{t('AdminPlacesPanel_SortAZ')}</Dropdown.Item>
                        <Dropdown.Item onClick={() => setCitySortOrder('Z-A')}>{t('AdminPlacesPanel_SortZA')}</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>

                <div style={{ borderRadius: '12px', border: '1px solid rgb(240,240,240)' }} className="p-4 bg-white">
                  {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" />
                    </div>
                  ) : (
                    <>
                      <h5 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{t('AdminPlacesPanel_Cities')}</h5>
                      <Table borderless hover responsive className="mt-1">
                        <thead>
                          <tr>
                            <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_CityTableName')}</th>
                            <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_CityTableLatitude')}</th>
                            <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_CityTableLongitude')}</th>
                            <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_CityTableActions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedCities.map((city) => (
                            <tr key={city.id} className="border-top border-bottom">
                              <td style={{ verticalAlign: 'middle', color: 'black', fontWeight: '400' }}>
                                {city.city_name}
                              </td>
                              <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>{city.latitude}</td>
                              <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>{city.longitude}</td>
                              <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="me-1 p-0"
                                  onClick={() => {
                                    setCityToEdit({ ...city });
                                    setMapCenter([parseFloat(city.latitude), parseFloat(city.longitude)]);
                                    setShowEditCityModal(true);
                                  }}
                                  title="Edit"
                                >
                                  <PencilSquare className="text-secondary" style={{ fontSize: '1.1rem' }} />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0"
                                  onClick={() => {
                                    setCityToDelete(city);
                                    setShowDeleteCityModal(true);
                                  }}
                                  title="Delete"
                                >
                                  <Trash className="text-secondary" style={{ fontSize: '1.1rem' }} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <div className="d-flex align-items-center gap-2 mt-3">
                        <span>{t('AdminPlacesPanel_Showing')}</span>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            id="city-items-per-page-dropdown"
                            style={{
                              backgroundColor: 'white',
                              borderColor: 'rgb(240,240,240)',
                              color: 'black',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.9rem',
                            }}
                          >
                            {cityCategoryItemsPerPage}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(10)}>10</Dropdown.Item>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(15)}>15</Dropdown.Item>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(20)}>20</Dropdown.Item>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(50)}>50</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <span>{t('AdminPlacesPanel_OutOf')} {sortedCities.length}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ flex: '1', width: '50%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3 mt-1">
                  <InputGroup
                    style={{
                      width: '300px',
                      border: '1px solid rgb(240,240,240)',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      overflow: 'hidden',
                    }}
                  >
                    <InputGroup.Text
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0 8px 0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Search style={{ color: 'gray', fontSize: '1rem' }} />
                    </InputGroup.Text>
                    <Form.Control
                      className="py-2"
                      placeholder={t('AdminPlacesPanel_SearchCategories')}
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      style={{
                        border: 'none',
                        color: 'black',
                        boxShadow: 'none',
                        paddingLeft: '0',
                      }}
                    />
                  </InputGroup>
                  <div className="d-flex gap-2">
                    <Dropdown>
                      <Dropdown.Toggle
                        className="py-2 px-3"
                        variant="outline-secondary"
                        id="category-sort-dropdown"
                        style={{
                          backgroundColor: 'white',
                          borderColor: 'rgb(240,240,240)',
                          color: 'gray',
                        }}
                      >
                        {t('AdminPlacesPanel_SortTitle')}: <span style={{ color: 'black' }}>{categorySortOrder === 'A-Z' ? t('AdminPlacesPanel_SortAZ') : t('AdminPlacesPanel_SortZA')}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setCategorySortOrder('A-Z')}>{t('AdminPlacesPanel_SortAZ')}</Dropdown.Item>
                        <Dropdown.Item onClick={() => setCategorySortOrder('Z-A')}>{t('AdminPlacesPanel_SortZA')}</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>

                <div style={{ borderRadius: '12px', border: '1px solid rgb(240,240,240)' }} className="p-4 bg-white">
                  {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" />
                    </div>
                  ) : (
                    <>
                      <h5 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{t('AdminPlacesPanel_Categories')}</h5>
                      <Table borderless hover responsive className="mt-1">
                        <thead>
                          <tr>
                            <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_CategoryTableName')}</th>
                            <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_CategoryTableIcon')}</th>
                            <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_CategoryTableActions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedCategories.map((category) => (
                            <tr key={category.id} className="border-top border-bottom">
                              <td style={{ verticalAlign: 'middle', color: 'black', fontWeight: '400' }}>
                                {category.name}
                              </td>
                              <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                <img
                                  src={getIconUrl(category.icon)}
                                  alt={category.name}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </td>
                              <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="me-1 p-0"
                                  onClick={() => {
                                    setCategoryToEdit({ ...category, icon: null });
                                    setShowEditCategoryModal(true);
                                  }}
                                  title="Edit"
                                >
                                  <PencilSquare className="text-secondary" style={{ fontSize: '1.1rem' }} />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0"
                                  onClick={() => {
                                    setCategoryToDelete(category);
                                    setShowDeleteCategoryModal(true);
                                  }}
                                  title="Delete"
                                >
                                  <Trash className="text-secondary" style={{ fontSize: '1.1rem' }} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <div className="d-flex align-items-center gap-2 mt-3">
                        <span>{t('AdminPlacesPanel_Showing')}</span>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            id="category-items-per-page-dropdown"
                            style={{
                              backgroundColor: 'white',
                              borderColor: 'rgb(240,240,240)',
                              color: 'black',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.9rem',
                            }}
                          >
                            {cityCategoryItemsPerPage}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(10)}>10</Dropdown.Item>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(15)}>15</Dropdown.Item>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(20)}>20</Dropdown.Item>
                            <Dropdown.Item onClick={() => setCityCategoryItemsPerPage(50)}>50</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <span>{t('AdminPlacesPanel_OutOf')} {sortedCategories.length}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 mt-1">
                <InputGroup
                  style={{
                    width: '300px',
                    border: '1px solid rgb(240,240,240)',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                  }}
                >
                  <InputGroup.Text
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '0 8px 0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Search style={{ color: 'gray', fontSize: '1rem' }} />
                  </InputGroup.Text>
                  <Form.Control
                    className="py-2"
                    placeholder={t('AdminPlacesPanel_SearchEvents')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: 'none',
                      color: 'black',
                      boxShadow: 'none',
                      paddingLeft: '0',
                    }}
                  />
                </InputGroup>
                <div className="d-flex gap-2 flex-wrap">
                  <Dropdown>
                    <Dropdown.Toggle
                      className="py-2 px-3"
                      variant="outline-secondary"
                      id="event-sort-dropdown"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'rgb(240,240,240)',
                        color: 'gray',
                      }}
                    >
                      {t('AdminPlacesPanel_SortTitle')}: <span style={{ color: 'black' }}>{sortOrder === 'A-Z' ? t('AdminPlacesPanel_SortAZ') : t('AdminPlacesPanel_SortZA')}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setSortOrder('A-Z')}>{t('AdminPlacesPanel_SortAZ')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortOrder('Z-A')}>{t('AdminPlacesPanel_SortZA')}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Dropdown>
                    <Dropdown.Toggle
                      className="py-2 px-3"
                      variant="outline-secondary"
                      id="place-filter-dropdown"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'rgb(240,240,240)',
                        color: 'gray',
                      }}
                    >
                      {t('AdminPlacesPanel_EventsTablePlace')}: {' '}
                      <span style={{ color: 'black' }}>
                        {placeFilter === 'All' ? t('AdminPlacesPanel_EventsAll') : placeFilter}
                      </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setPlaceFilter('All')}>{t('AdminPlacesPanel_EventsAll')}</Dropdown.Item>
                      {uniquePlaces.map((place) => (
                        <Dropdown.Item key={place} onClick={() => setPlaceFilter(place)}>
                          {place}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Dropdown>
                    <Dropdown.Toggle
                      className="py-2 px-3"
                      variant="outline-secondary"
                      id="city-filter-dropdown"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'rgb(240,240,240)',
                        color: 'gray',
                      }}
                    >
                      {t('AdminPlacesPanel_EventsTableCity')}: {' '}
                      <span style={{ color: 'black' }}>
                        {cityFilter === 'All' ? t('AdminPlacesPanel_EventsAll') : cityFilter}
                      </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setCityFilter('All')}>{t('AdminPlacesPanel_EventsAll')}</Dropdown.Item>
                      {uniqueCities.map((city) => (
                        <Dropdown.Item key={city} onClick={() => setCityFilter(city)}>
                          {city}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={resetFilters}
                    style={{
                      backgroundColor: '#fff',
                      border: "none",
                      color: '#dc3545',
                    }}
                  >
                    {t('AdminPlacesPanel_ResetFilters')}
                  </Button>
                </div>
              </div>

              <div style={{ borderRadius: '12px', border: '1px solid rgb(240,240,240)' }} className="p-4 bg-white">
                {eventLoading ? (
                  <div className="text-center">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <>
                    <Table borderless hover responsive className="mt-1">
                      <thead>
                        <tr>
                          <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_EventsTableImage')}</th>
                          <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_EventsTableName')}</th>
                          <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_EventsTablePlace')}</th>
                          <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_EventsTableCity')}</th>
                          <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_EventsTableDateTime')}</th>
                          <th style={{ fontWeight: '600' }}>{t('AdminPlacesPanel_EventsTableDescription')}</th>
                          <th style={{ fontWeight: '600', textAlign: 'center' }}>{t('AdminPlacesPanel_TableActions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEvents.map((event) => (
                          <tr key={event.id} className="border-top border-bottom">
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <img
                                src={getPhotoUrl(event.image)}
                                alt={event.name}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  objectFit: 'cover',
                                  borderRadius: '10%',
                                }}
                              />
                            </td>
                            <td style={{ verticalAlign: 'middle', color: 'black', fontWeight: '400' }}>
                              {event.name}
                            </td>
                            <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>
                              {event.place?.name || '-'}
                            </td>
                            <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>
                              {event.city?.city_name || '-'}
                            </td>
                            <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>
                              {event.date_time ? new Date(event.date_time).toLocaleString() : '-'}
                            </td>
                            <td style={{ verticalAlign: 'middle', color: '#6b757d' }}>
                              {event.description || '-'}
                            </td>
                            <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                              <Button
                                variant="link"
                                size="sm"
                                className="me-1 p-0"
                                onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                                title="Edit"
                              >
                                <PencilSquare className="text-secondary" style={{ fontSize: '1.1rem' }} />
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0"
                                onClick={() => {
                                  setEventToDelete(event);
                                  setShowDeleteEventModal(true);
                                }}
                                title="Delete"
                              >
                                <Trash className="text-secondary" style={{ fontSize: '1.1rem' }} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="d-flex align-items-center gap-2 mt-3">
                      <span>{t('AdminPlacesPanel_Showing')}</span>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          id="event-items-per-page-dropdown"
                          style={{
                            backgroundColor: 'white',
                            borderColor: 'rgb(240,240,240)',
                            color: 'black',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.9rem',
                          }}
                        >
                          {itemsPerPage}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => { setItemsPerPage(10); setCurrentPage(1); }}>10</Dropdown.Item>
                          <Dropdown.Item onClick={() => { setItemsPerPage(15); setCurrentPage(1); }}>15</Dropdown.Item>
                          <Dropdown.Item onClick={() => { setItemsPerPage(20); setCurrentPage(1); }}>20</Dropdown.Item>
                          <Dropdown.Item onClick={() => { setItemsPerPage(50); setCurrentPage(1); }}>50</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <span>{t('AdminPlacesPanel_OutOf')} {sortedEvents.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Delete Place Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('AdminPlacesPanel_DeleteModalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p dangerouslySetInnerHTML={{ __html: t('AdminPlacesPanel_DeleteModalMessage', { name: placeToDelete?.name }) }} />
              <p>{t('AdminPlacesPanel_DeleteModalPhotoMessage')}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('AdminPlacesPanel_DeleteModalCancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? t('AdminPlacesPanel_DeleteModalDeleting') : t('AdminPlacesPanel_DeleteModalDelete')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Delete Event Modal */}
          <Modal show={showDeleteEventModal} onHide={() => setShowDeleteEventModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('AdminPlacesPanel_DeleteEventModalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p dangerouslySetInnerHTML={{ __html: t('AdminPlacesPanel_DeleteEventModalMessage', { name: eventToDelete?.name }) }} />
              <p>{t('AdminPlacesPanel_DeleteEventModalPhotoMessage')}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteEventModal(false)}>
                {t('AdminPlacesPanel_DeleteEventModalCancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteEvent}
                disabled={deleteLoading}
              >
                {deleteLoading ? t('AdminPlacesPanel_DeleteEventModalDeleting') : t('AdminPlacesPanel_DeleteEventModalDelete')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Add Category Modal */}
          <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('AdminPlacesPanel_AddCategoryModalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_AddCategoryModalNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_AddCategoryModalIconLabel')}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.files[0] })}
                    required
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
                {t('AdminPlacesPanel_AddCategoryModalCancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleAddCategory}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('AdminPlacesPanel_AddCategoryModalAdding') : t('AdminPlacesPanel_AddCategoryModalAdd')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Edit Category Modal */}
          <Modal show={showEditCategoryModal} onHide={() => setShowEditCategoryModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('AdminPlacesPanel_EditCategoryModalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_EditCategoryModalNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={categoryToEdit?.name || ''}
                    onChange={(e) => setCategoryToEdit({ ...categoryToEdit, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_EditCategoryModalIconLabel')}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCategoryToEdit({ ...categoryToEdit, icon: e.target.files[0] })}
                  />
                  <Form.Text>{t('AdminPlacesPanel_EditCategoryModalIconText')}</Form.Text>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditCategoryModal(false)}>
                {t('AdminPlacesPanel_EditCategoryModalCancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleEditCategory}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('AdminPlacesPanel_EditCategoryModalSaving') : t('AdminPlacesPanel_EditCategoryModalSave')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Delete Category Modal */}
          <Modal show={showDeleteCategoryModal} onHide={() => setShowDeleteCategoryModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('AdminPlacesPanel_DeleteCategoryModalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p dangerouslySetInnerHTML={{ __html: t('AdminPlacesPanel_DeleteCategoryModalMessage', { name: categoryToDelete?.name }) }} />
              <p>{t('AdminPlacesPanel_DeleteCategoryModalIconMessage')}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteCategoryModal(false)}>
                {t('AdminPlacesPanel_DeleteCategoryModalCancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCategory}
                disabled={deleteLoading}
              >
                {deleteLoading ? t('AdminPlacesPanel_DeleteCategoryModalDeleting') : t('AdminPlacesPanel_DeleteCategoryModalDelete')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Add City Modal */}
          <Modal show={showCityModal} onHide={() => setShowCityModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('cityModal.title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_EditCityModalNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCity.city_name}
                    onChange={(e) => setNewCity({ ...newCity, city_name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_EditCityModalCoordinatesLabel')}</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder={t('AdminPlacesPanel_EditCityModalLatitudePlaceholder')}
                        value={newCity.latitude}
                        onChange={(e) => setNewCity({ ...newCity, latitude: e.target.value })}
                        required
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder={t('AdminPlacesPanel_EditCityModalLongitudePlaceholder')}
                        value={newCity.longitude}
                        onChange={(e) => setNewCity({ ...newCity, longitude: e.target.value })}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Text>{t('AdminPlacesPanel_EditCityModalMapHint')}</Form.Text>
                <div style={{ height: '300px', marginTop: '1rem' }}>
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    />
                    {newCity.latitude && newCity.longitude && (
                      <Marker
                        position={[parseFloat(newCity.latitude), parseFloat(newCity.longitude)]}
                        icon={blackMarkerIcon}
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const { lat, lng } = e.target.getLatLng();
                            setNewCity({ ...newCity, latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
                            setMapCenter([lat, lng]);
                          },
                        }}
                      />
                    )}
                    <MapClickHandler isEditing={false} />
                    <MapUpdater latitude={newCity.latitude} longitude={newCity.longitude} />
                  </MapContainer>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCityModal(false)}>
                {t('AdminPlacesPanel_EditCityModalCancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleAddCity}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('AdminPlacesPanel_EditCityModalSaving') : t('AdminPlacesPanel_EditCityModalSave')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Edit City Modal */}
          <Modal show={showEditCityModal} onHide={() => setShowEditCityModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('AdminPlacesPanel_EditCityModalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_EditCityModalNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={cityToEdit?.city_name || ''}
                    onChange={(e) => setCityToEdit({ ...cityToEdit, city_name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('AdminPlacesPanel_EditCityModalCoordinatesLabel')}</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder={t('AdminPlacesPanel_EditCityModalLatitudePlaceholder')}
                        value={cityToEdit?.latitude || ''}
                        onChange={(e) => setCityToEdit({ ...cityToEdit, latitude: e.target.value })}
                        required
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder={t('AdminPlacesPanel_EditCityModalLongitudePlaceholder')}
                        value={cityToEdit?.longitude || ''}
                        onChange={(e) => setCityToEdit({ ...cityToEdit, longitude: e.target.value })}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Text>{t('AdminPlacesPanel_EditCityModalMapHint')}</Form.Text>
                <div style={{ height: '300px', marginTop: '1rem' }}>
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    />
                    {cityToEdit?.latitude && cityToEdit?.longitude && (
                      <Marker
                        position={[parseFloat(cityToEdit.latitude), parseFloat(cityToEdit.longitude)]}
                        icon={blackMarkerIcon}
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const { lat, lng } = e.target.getLatLng();
                            setCityToEdit({ ...cityToEdit, latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
                            setMapCenter([lat, lng]);
                          },
                        }}
                      />
                    )}
                    <MapClickHandler isEditing={true} />
                    <MapUpdater latitude={cityToEdit?.latitude} longitude={cityToEdit?.longitude} />
                  </MapContainer>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditCityModal(false)}>
                {t('AdminPlacesPanel_EditCityModalCancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleEditCity}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('AdminPlacesPanel_EditCityModalSaving') : t('AdminPlacesPanel_EditCityModalSave')}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Delete City Modal */}
          <Modal show={showDeleteCityModal} onHide={() => setShowDeleteCityModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('AdminPlacesPanel_DeleteCityModalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p dangerouslySetInnerHTML={{ __html: t('AdminPlacesPanel_DeleteCityModalMessage', { name: cityToDelete?.city_name }) }} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteCityModal(false)}>
                {t('AdminPlacesPanel_DeleteCityModalCancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCity}
                disabled={deleteLoading}
              >
                {deleteLoading ? t('AdminPlacesPanel_DeleteCityModalDeleting') : t('AdminPlacesPanel_DeleteCityModalDelete')}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminPlacesPanel;