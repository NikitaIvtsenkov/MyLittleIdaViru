import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
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

// Custom black marker icon
const blackMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
  gap: '0.5rem'
};

const PlaceCreatePage = () => {
  const navigate = useNavigate();
  const [place, setPlace] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    working_hours: '',
    location: '',
    web: '',
    city: ''
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([59.358, 27.419]);
  const [zoom, setZoom] = useState(13);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, citiesRes] = await Promise.all([
          axios.get('http://localhost:5000/categories'),
          axios.get('http://localhost:5000/cities')
        ]);

        setCategories(categoriesRes.data);
        setCities(citiesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load categories or cities');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlace(prev => ({ ...prev, [name]: value }));

    if (name === 'city') {
      const selectedCity = cities.find(city => city.id === parseInt(value));
      if (selectedCity && selectedCity.latitude && selectedCity.longitude) {
        setMapCenter([parseFloat(selectedCity.latitude), parseFloat(selectedCity.longitude)]);
      }
    }
  };
const { t } = useTranslation();
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setPreviewImage(url);
      setSelectedFile(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImageUrl('');
    setPreviewImage('');
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setPlace(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
    setMapCenter([lat, lng]);
  };

  const getIconUrl = (icon) => {
    if (!icon) return 'https://via.placeholder.com/16';
    return icon.startsWith('http') ? icon : `http://localhost:5000${icon}`;
  };

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        handleMapClick(e);
      },
    });
    return null;
  }

  function MapUpdater() {
    const map = useMap();
    
    useEffect(() => {
      if (place.latitude && place.longitude) {
        map.setView([parseFloat(place.latitude), parseFloat(place.longitude)], zoom);
      }
    }, [place.latitude, place.longitude, zoom]);

    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization required');

      const formData = new FormData();
      formData.append('name', place.name);
      formData.append('description', place.description);
      formData.append('latitude', place.latitude);
      formData.append('longitude', place.longitude);
      formData.append('working_hours', place.working_hours);
      formData.append('location', place.location);
      formData.append('web', place.web);
      formData.append('city', place.city);
      formData.append('categoryIds', JSON.stringify(selectedCategories));

      if (selectedFile) {
        formData.append('photoFile', selectedFile);
      } else if (imageUrl) {
        formData.append('photo', imageUrl);
      }

      const response = await axios.post('http://localhost:5000/places', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/adminpanel', { 
        state: { success: 'Place created successfully!' } 
      });
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.message || 'Failed to create place');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div className="page-container">
      <style>
        {`
          .category-checkbox input[type="checkbox"]:checked {
            background-color: black;
            border-color: black;
          }
          .category-checkbox input[type="checkbox"]:checked + .form-check-label::before {
            background-color: black;
            border-color: black;
          }
        `}
      </style>
      <div className="mt-4 mx-5">
        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <h2 style={{fontWeight: "bold"}}>{t('placeEdit.title2')}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button style={buttonStyle} onClick={() => navigate('/adminpanel')}>
               {t('placeEdit.cancel')}
            </Button>
            <Button 
              style={{
                ...buttonStyle,
                backgroundColor: isSubmitting ? 'rgba(0,0,0,0.1)' : 'black',
                color: 'white',
                border: '1.5px solid black'
              }} 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Creating...</span>
                </>
              ) : (
                 t('placeEdit.Create')
              )}
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <div className="d-flex mb-4" style={{ gap: '20px' }}>
            {/* Left Block - Place Information */}
            <div style={{ 
              flex: '0 0 60%',
              maxWidth: '60%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden'
            }}>
              {/* General Information Block */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                flex: '1 0 auto'
              }}>
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('placeEdit.generalInfo')}</h5>
                <Form.Group className="mb-3">
                  <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.name')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={place.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.description')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={place.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </Form.Group>
              </div>

              {/* Details Block */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                flex: '1 0 auto'
              }}>
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('placeEdit.details')}</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.workingHours')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="working_hours"
                        value={place.working_hours}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.location')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={place.location}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.website')}</Form.Label>
                      <Form.Control
                        type="url"
                        name="web"
                        value={place.web}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.city')}</Form.Label>
                      <Form.Select
                        name="city"
                        value={place.city}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">{t('placeEdit.selectCity')}</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.city_name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Categories Block */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                flex: '1 0 auto'
              }}>
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('placeEdit.categories')}</h5>
                <Form.Group className="mb-3">
                  <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.categories')}</Form.Label>
                  {categories.length === 0 ? (
                    <Alert variant="warning">{t('placeEdit.noCategories')}</Alert>
                  ) : (
                    <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                      {categories.map((category) => (
                        <Form.Check
                          key={category.id}
                          type="checkbox"
                          id={`category-${category.id}`}
                          label={
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <img
                                src={getIconUrl(category.icon)}
                                alt={category.name}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  objectFit: 'contain',
                                  filter: "grayscale(100%) opacity(0.55)",
                                }}
                                onError={(e) => {
                                  console.error(`Failed to load icon for category ${category.name}: ${getIconUrl(category.icon)}`);
                                  e.target.src = 'https://via.placeholder.com/16';
                                }}
                              />
                              {category.name}
                            </span>
                          }
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="category-checkbox"
                        />
                      ))}
                    </div>
                  )}
                </Form.Group>
              </div>
            </div>

            {/* Right Block - Location & Photo */}
            <div className="p-0" style={{
              width: '40%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden',
              backgroundColor: 'transparent',
              borderLeft: '1px solid #F3F3F3',
            }}>
              {/* Map Block */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                flex: '1 0 auto',
              }}>
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('placeEdit.mapSection')}</h5>
                <Form.Group className="mb-3">
                  <Form.Label style={{color: '#6b757d'}}>{t('placeEdit.coordinates')}</Form.Label>
                  <Row>
                    <Col md={6}>
                      <Form.Control
                        type="number"
                        name="latitude"
                        value={place.latitude}
                        onChange={handleInputChange}
                        step="0.000001"
                        required
                        placeholder={t('placeEdit.latitude')}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        type="number"
                        name="longitude"
                        value={place.longitude}
                        onChange={handleInputChange}
                        step="0.000001"
                        required
                        placeholder={t('placeEdit.longitude')} 
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                  <MapContainer 
                    center={mapCenter} 
                    zoom={zoom} 
                    attributionControl={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    />
                    {place.latitude && place.longitude && (
                      <Marker 
                        position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
                        icon={blackMarkerIcon}
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const { lat, lng } = e.target.getLatLng();
                            setPlace(prev => ({
                              ...prev,
                              latitude: lat.toFixed(6),
                              longitude: lng.toFixed(6)
                            }));
                            setMapCenter([lat, lng]);
                          }
                        }}
                      >
                        <Popup>Current location</Popup>
                      </Marker>
                    )}
                    <MapUpdater />
                    <MapClickHandler />
                  </MapContainer>
                  <div className="text-muted small mt-2">{t('placeEdit.mapHint')}</div>
                </div>
              </div>

              {/* Photo Block */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                flex: '1 0 auto',
              }}>
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('placeEdit.photo')}</h5>
                <Form.Group className="mb-3">
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                  >
                    <Tab eventKey="upload" title={t('placeEdit.uploadTab')}>
                      <Form.Control 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*"
                        className="mt-2"
                      />
                    </Tab>
                    <Tab eventKey="url" title={t('placeEdit.urlTab')}>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={handleUrlChange}
                        className="mt-2"
                      />
                    </Tab>
                  </Tabs>

                  <div className="mt-2" style={{ 
                    minHeight: '200px', 
                    border: '1px dashed #ddd', 
                    borderRadius: '5px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    backgroundColor: previewImage ? 'transparent' : '#f8f9fa'
                  }}>
                    {previewImage ? (
                      <div style={{ width: '100%' }}>
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            objectFit: 'contain', 
                            borderRadius: '5px' 
                          }}
                          className="img-thumbnail"
                        />
                        <Button 
                          style={buttonStyle}
                          className="mt-2"
                          onClick={handleRemoveImage}
                        >
                          Remove Photo
                        </Button>
                      </div>
                    ) : (
                      <div 
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.querySelector('input[type="file"]')?.click()}
                      >
                        <span className="text-muted">{t('placeEdit.imagePlaceholder')}</span>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div></div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button style={buttonStyle} onClick={() => navigate('/adminpanel')}>
                {t('placeEdit.cancel')}
              </Button>
              <Button 
                style={{
                  ...buttonStyle,
                  backgroundColor: isSubmitting ? 'rgba(0,0,0,0.1)' : 'black',
                  color: 'white',
                  border: '1.5px solid black'
                }} 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Creating...</span>
                  </>
                ) : (
                    t('placeEdit.Create')
                )}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PlaceCreatePage;