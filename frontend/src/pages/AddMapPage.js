import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from "react-router-dom";
import { Button, Form, Card, Container, Row, Col, ListGroup } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AddMapPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    photo: '',
    working_hours: '',
    location: '',
    web: '',
    city:'',
  });
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [markersWithImages, setMarkersWithImages] = useState([]);
  const [previewMarker, setPreviewMarker] = useState(null);
  const [isPhotoUrlValid, setIsPhotoUrlValid] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const getCategoryImage = useCallback((categoryId) => {
    const category = categories.find(cat => cat.id === Number(categoryId));
    return category ? `/assets/categories/${categoryId}.png` : '/assets/categories/default.png';
  }, [categories]);

  // const getImageUrl = (photo) => {
  //   return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
  // };
  const getImageUrl = (photo) => {
    return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
  };
  // Fetch categories and places
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, placesRes] = await Promise.all([
          axios.get('http://localhost:5000/categories'),
          axios.get('http://localhost:5000/places')
        ]);
        setCategories(categoriesRes.data);
        setPlaces(placesRes.data);
        setMarkersWithImages(placesRes.data.map(() => true));
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить начальные данные");
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if ((formData.photo || selectedFile) && clickedPosition) {
      const photoUrl = selectedFile ? URL.createObjectURL(selectedFile) : formData.photo;
      const customIcon = createCustomIcon(photoUrl, true);
      setPreviewMarker({
        position: clickedPosition,
        icon: customIcon
      });
    }
  }, [formData.photo, selectedFile, clickedPosition]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate photo URL when it changes
    if (name === 'photo') {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      setIsPhotoUrlValid(urlPattern.test(value));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleAddPlace = async () => {
    if (!clickedPosition) {
      setError("Пожалуйста, выберите местоположение на карте");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Пожалуйста, выберите хотя бы одну категорию");
      return;
    }

    if (!formData.name || !formData.description || (!formData.photo && !selectedFile) || 
        !formData.working_hours || !formData.location) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      let data;

      if (selectedFile) {
        data = new FormData();
        data.append('photoFile', selectedFile);
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('latitude', parseFloat(formData.latitude));
        data.append('longitude', parseFloat(formData.longitude));
        data.append('working_hours', formData.working_hours);
        data.append('location', formData.location);
        data.append('web', formData.web);
        data.append('categoryIds', JSON.stringify(selectedCategories));
        data.append('city', formData.city);

      } else {
        data = {
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          categoryIds: selectedCategories
        };
      }

      const response = await axios.post("http://localhost:5000/places", data, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      setPlaces(prev => [...prev, response.data.place]);
      navigate("/MapPage", { state: { successMessage: "Место успешно добавлено!" } });
    } catch (err) {
      console.error("Ошибка при добавлении места:", err);
      setError(
        err.response?.status === 403 
          ? "Ошибка авторизации: пожалуйста, войдите снова" 
          : err.response?.data?.message || "Ошибка при добавлении места"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRightClick = (e) => {
    if (!isPhotoUrlValid && !selectedFile) return;
    
    const { lat, lng } = e.latlng;
    setClickedPosition([lat, lng]);
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
  };

  const MapEvents = () => {
    useMapEvents({
      contextmenu: handleRightClick,
    });
    return null;
  };

  const defaultPosition = [59.358, 27.419];

  const createCustomIcon = useCallback((photoUrl, hasImage) => {
    if (hasImage && photoUrl) {
      return L.divIcon({
        className: 'custom-icon',
        html: `<img src="${photoUrl}" alt="Place" style="width: 60px; height: 50px; border-radius: 10px; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2); object-fit: cover;" />`,
        iconSize: [60, 50],
        iconAnchor: [30, 50],
      });
    }
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="width: 15px; height: 15px; background-color: #144F7B; border-radius: 50%; outline: 4px solid rgba(0,0,150,0.2)"></div>`,
      iconSize: [15, 15],
      iconAnchor: [7.5, 7.5],
    });
  }, []);

  const leftBox = {
    height: '32.5rem',
    overflow: 'auto',
    zIndex: 2,
    backgroundColor: "#F8F8F8"
  };

  return (
    <div className="d-flex gap-0" style={{ height: '38.4em', backgroundColor: "#F8F8F8", fontFamily: "Manrope" }}>
      {/* Левая панель с формой */}
      <div style={{ width: '45%', height: '100%' }}>
        <div className='' style={{height: "100%", padding: "0vh"}}>
          <div className='p-3' style={{ 
            backgroundColor: "#fff", 
            borderRadius: "0px", 
            borderBottom: "1px solid #F3F3F3", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            gap: "10px"
          }}>
            <h2>Добавить новое место</h2>
          </div>
          
          <SimpleBar className="p-3" style={leftBox}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form onSubmit={(e) => { e.preventDefault(); handleAddPlace(); }}>
              <Form.Group className="mb-3">
                <Form.Label>URL фотографии*</Form.Label>
                <Form.Control 
                  type="url" 
                  name="photo"
                  value={formData.photo} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/photo.jpg"
                  isInvalid={formData.photo && !isPhotoUrlValid}
                />
                {formData.photo && !isPhotoUrlValid && (
                  <Form.Control.Feedback type="invalid">
                    Пожалуйста, введите корректный URL
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Или загрузите фото*</Form.Label>
                <Form.Control 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                  accept="image/*"
                />
                {selectedFile && (
                  <div className="mt-2">
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Предпросмотр" 
                      style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '5px' }}
                    />
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Название места*</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Введите название места"
                  disabled={!isPhotoUrlValid && !selectedFile}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Описание*</Form.Label>
                <Form.Control 
                  as="textarea"
                  name="description"
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  rows={3}
                  placeholder="Опишите это место"
                  disabled={!isPhotoUrlValid && !selectedFile}
                />
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Широта*</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="latitude"
                      value={formData.latitude} 
                      onChange={handleInputChange} 
                      required 
                      step="0.000001"
                      placeholder="Выберите на карте"
                      readOnly
                      disabled={!isPhotoUrlValid && !selectedFile}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Долгота*</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="longitude"
                      value={formData.longitude} 
                      onChange={handleInputChange} 
                      required 
                      step="0.000001"
                      placeholder="Выберите на карте"
                      readOnly
                      disabled={!isPhotoUrlValid && !selectedFile}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Часы работы*</Form.Label>
                <Form.Control 
                  type="text" 
                  name="working_hours"
                  value={formData.working_hours} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Например: 09:00-18:00, Пн-Пт"
                  disabled={!isPhotoUrlValid && !selectedFile}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Адрес*</Form.Label>
                <Form.Control 
                  type="text" 
                  name="location"
                  value={formData.location} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Укажите точный адрес"
                  disabled={!isPhotoUrlValid && !selectedFile}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Веб-сайт</Form.Label>
                <Form.Control 
                  type="url" 
                  name="web"
                  value={formData.web} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com"
                  disabled={!isPhotoUrlValid && !selectedFile}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Категории*</Form.Label>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {categories.map((category) => (
                    <div key={category.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <Form.Check
                        type="checkbox"
                        id={`category-${category.id}`}
                        label={category.name}
                        value={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onChange={handleCategoryChange}
                        disabled={!isPhotoUrlValid && !selectedFile}
                      />
                    </div>
                  ))}
                </div>
              </Form.Group>
          
              <Form.Group className="mb-3">
                <Form.Label>Название города</Form.Label>
                <Form.Control 
                  type="text" 
                  name="city"
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="Введите название города"
                  disabled={!isPhotoUrlValid && !selectedFile}
                />
              </Form.Group>
              
              <div className="text-muted mb-3">* Обязательные поля</div>
              <div className="text-muted mb-3">Сначала выберите фото или введите URL фотографии, затем остальные поля станут доступными</div>

              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting || (!isPhotoUrlValid && !selectedFile)}
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Добавление...' : 'Добавить место'}
              </Button>
            </Form>
          </SimpleBar>
        </div>
      </div>

      {/* Правая панель с картой */}
      <div className='px-4 py-2' style={{ 
        width: '55%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem',
        overflow: 'hidden',
        backgroundColor: "red",
        borderLeft: "1px solid #F3F3F3"
      }}>
        <div style={{ 
          height: '100%',
          backgroundColor: 'white', 
        }}>
          <MapContainer
            center={defaultPosition}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '10px' }}
            attributionControl={false}
            maxBounds={[[59.31, 27.3], [59.41, 27.53]]}
            maxBoundsViscosity={1.0}
            minZoom={12}
            maxZoom={17}
            zoomControl={false}
            className={!isPhotoUrlValid && !selectedFile ? "map-disabled" : ""}
          >
            <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" />
            
            {previewMarker && (
              <Marker
                position={previewMarker.position}
                icon={previewMarker.icon}
              >
                <Popup>
                  <div style={{ width: '200px' }}>
                    <h4>{formData.name || 'Новое место'}</h4>
                    {(formData.photo || selectedFile) && (
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : getImageUrl(formData.photo)}
                        alt={formData.name}
                        style={{ width: '100%', height: '100px', borderRadius: '6px', objectFit: 'cover', marginBottom: '10px' }}
                      />
                    )}
                    {selectedCategories.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '5px' }}>
                        {selectedCategories.map(catId => {
                          const cat = categories.find(c => c.id === catId);
                          return (
                            <span 
                              key={catId}
                              style={{ 
                                backgroundColor: 'rgba(20, 79, 123, 0.1)', 
                                fontSize: '10px', 
                                color: '#144F7B', 
                                borderRadius: '20px', 
                                padding: '2px 8px', 
                                margin: '2px 2px 0px 0px' 
                              }}
                            >
                              {cat?.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {places.map((place, index) => {
              const hasImage = markersWithImages[index];
              const customIcon = createCustomIcon(getImageUrl(place.photo), hasImage);
              
              return (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={customIcon}
                >
                  <Popup>
                    <div style={{ width: '200px' }}>
                      {place.photo && (
                        <img
                          src={getImageUrl(place.photo)}
                          alt={place.name}
                          style={{ width: '100%', height: '100px', borderRadius: '6px', objectFit: 'cover', marginBottom: '10px' }}
                        />
                      )}
                      <h4 style={{ margin: '0 0 5px 0' }}>{place.name}</h4>
                      {place.working_hours && (
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>
                          <strong>Часы работы:</strong> {place.working_hours}
                        </p>
                      )}
                      {place.web && (
                        <a href={place.web} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px' }}>
                          Посетить сайт
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            <MapEvents />
          </MapContainer>
          </div>
          <div style={{ 
          height: '100%',
          backgroundColor: 'white', 
        }}>
          {(!isPhotoUrlValid && !selectedFile) && (
            <div 
              className="modal-overlay" 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '55%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                pointerEvents: 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                pointerEvents: 'auto',
                textAlign: 'center',
                maxWidth: '80%'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '16px',
                  color: '#333',
                  fontWeight: 500
                }}>
                  Сначала выберите фото или введите URL фотографии
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMapPage;