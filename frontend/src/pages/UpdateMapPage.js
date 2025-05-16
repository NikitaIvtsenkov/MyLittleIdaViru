import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import debounce from 'lodash.debounce';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const UpdateMapPage = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [zoom, setZoom] = useState(13);
  const [lastZoom, setLastZoom] = useState(13);
  const [error, setError] = useState(null);
  const [isPhotoUrlValid, setIsPhotoUrlValid] = useState(false);
  const [previousPhotoType, setPreviousPhotoType] = useState(null); // 'url' или 'file'

  const getImageUrl = (photo) => {
    return photo?.startsWith('http') ? photo : `http://localhost:5000${photo}`;
  };

  const createCustomIcon = useCallback((photoUrl) => {
    if (photoUrl) {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, placesRes] = await Promise.all([
          axios.get('http://localhost:5000/categories'),
          axios.get('http://localhost:5000/places'),
        ]);
        console.log('Загруженные места:', placesRes.data); // Логирование
        setCategories(categoriesRes.data);
        setPlaces(placesRes.data);
        // ...
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные');
      }
    };
    fetchData();
  }, []);

  const debouncedSave = useCallback(
    debounce(async (place, file, removeOldPhoto) => {
      try {
        const token = localStorage.getItem('token');
        let data;

        if (file) {
          data = new FormData();
          data.append('photoFile', file);
          Object.entries(place).forEach(([key, value]) => {
            if (key !== 'photoFile') data.append(key, value);
          });
          if (removeOldPhoto) data.append('removeOldPhoto', 'true');
        } else {
          data = { ...place };
          if (removeOldPhoto) data.removeOldPhoto = true;
        }

        const response = await axios.patch(
          `http://localhost:5000/places/${place.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPlaces((prev) =>
          prev.map((p) => (p.id === place.id ? response.data.place : p))
        );
        setPreviousPhotoType(file ? 'file' : place.photo ? 'url' : null);
      } catch (err) {
        console.error('Ошибка автосохранения:', err);
        setError(err.response?.data?.message || 'Ошибка при автосохранении');
      }
    }, 1000),
    []
  );

  const handleMarkerClick = async (place) => {
    try {
      console.log('Выбрано место:', place); // Логирование
      if (!place?.id || isNaN(place.id)) {
        throw new Error('Некорректный ID места');
      }

      console.log(`[DEBUG] Запрос места ID: ${place.id}`);
      const placeRes = await axios.get(`http://localhost:5000/places/${place.id}`);

      console.log(`[DEBUG] Запрос категорий для места ID: ${place.id}`);
      const categoriesRes = await axios.get(
        `http://localhost:5000/places/${place.id}/categories`
      );

      if (!placeRes.data || !categoriesRes.data) {
        throw new Error('Некорректный ответ сервера');
      }

      setLastZoom(zoom);
      setSelectedPlace(placeRes.data);
      setSelectedCategories(categoriesRes.data.map((c) => c.id));
      setIsPhotoUrlValid(
        placeRes.data.photo &&
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
            placeRes.data.photo
          )
      );
      setPreviousPhotoType(
        placeRes.data.photo?.startsWith('http') ? 'url' : placeRes.data.photo ? 'file' : null
      );
      setSelectedFile(null);
    } catch (err) {
      console.error('Полная ошибка:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки');
      setSelectedPlace(null);
      setSelectedCategories([]);
    }
  };

  const handleFieldChange = (field, value) => {
    if (!selectedPlace) return;

    const updatedPlace = { ...selectedPlace, [field]: value };
    setSelectedPlace(updatedPlace);
    setPlaces((prev) =>
      prev.map((p) => (p.id === updatedPlace.id ? updatedPlace : p))
    );

    let removeOldPhoto = false;
    if (field === 'photo' && previousPhotoType === 'file') {
      removeOldPhoto = true; // Удаляем старое локальное фото, если вводится URL
    }

    debouncedSave(updatedPlace, selectedFile, removeOldPhoto);

    if (field === 'photo') {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      setIsPhotoUrlValid(urlPattern.test(value));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const updatedPlace = { ...selectedPlace, photo: URL.createObjectURL(file) };
      setSelectedPlace(updatedPlace);
      setPlaces((prev) =>
        prev.map((p) => (p.id === updatedPlace.id ? updatedPlace : p))
      );
      const removeOldPhoto = previousPhotoType === 'file' || previousPhotoType === 'url';
      debouncedSave(updatedPlace, file, removeOldPhoto);
    }
  };

  const handleMarkerDrag = async (event, place) => {
    const { lat, lng } = event.target.getLatLng();

    try {
      const token = localStorage.getItem('token');
      const updatedPlace = {
        ...place,
        latitude: lat,
        longitude: lng,
      };

      setPlaces((prev) =>
        prev.map((p) => (p.id === place.id ? updatedPlace : p))
      );

      if (selectedPlace?.id === place.id) {
        setSelectedPlace(updatedPlace);
      }

      await axios.patch(
        `http://localhost:5000/places/${place.id}`,
        { latitude: lat, longitude: lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Ошибка обновления координат:', err);
      setError('Не удалось обновить координаты');
      setPlaces((prev) => [...prev]);
    }
  };

  const handleZoomEnd = (map) => {
    const currentZoom = map.getZoom();
    setZoom(currentZoom);
    setLastZoom(currentZoom);
    localStorage.setItem('mapZoom', currentZoom);
  };

  const handleCategoryChange = async (categoryId) => {
    try {
      if (!selectedPlace?.id) {
        throw new Error('Место не выбрано');
      }

      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/places/${selectedPlace.id}/categories/${categoryId}`;
      const isAdding = !selectedCategories.includes(categoryId);

      const response = isAdding
        ? await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });

      setSelectedCategories((prev) =>
        isAdding ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
      );

      const updatedPlaces = places.map((p) =>
        p.id === selectedPlace.id ? { ...p, categories: response.data } : p
      );
      setPlaces(updatedPlaces);
    } catch (err) {
      console.error('Ошибка обновления категорий:', {
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(`Ошибка: ${err.response?.data?.message || err.message}`);
      setSelectedCategories([...selectedCategories]);
    }
  };

  function CenterMapOnChange() {
    const map = useMap();

    useEffect(() => {
      if (selectedPlace) {
        map.setView([selectedPlace.latitude, selectedPlace.longitude], lastZoom);
      }
    }, [selectedPlace, lastZoom]);

    return null;
  }

  const position = selectedPlace
    ? [selectedPlace.latitude, selectedPlace.longitude]
    : [59.358, 27.419];

  const leftBox = {
    height: '32.5rem',
    overflow: 'auto',
    zIndex: 2,
    backgroundColor: '#F8F8F8',
  };

  return (
    <div className="d-flex gap-0" style={{ height: '38.4em', backgroundColor: '#F8F8F8', fontFamily: 'Manrope' }}>
      <div style={{ width: '45%', height: '100%' }}>
        <div style={{ height: '100%', padding: '0vh' }}>
          <div
            className="p-3"
            style={{
              backgroundColor: '#fff',
              borderRadius: '0px',
              borderBottom: '1px solid #F3F3F3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <h2>Редактировать место</h2>
          </div>

          <SimpleBar className="p-3" style={leftBox}>
            {error && <div className="alert alert-danger">{error}</div>}

            {selectedPlace ? (
              <div>
                <Form.Group className="mb-3">
                  <Form.Label>URL фотографии</Form.Label>
                  <Form.Control
                    type="url"
                    name="photo"
                    value={selectedPlace.photo?.startsWith('http') ? selectedPlace.photo : '' || ''}
                    onChange={(e) => handleFieldChange('photo', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    isInvalid={selectedPlace.photo && !isPhotoUrlValid && !selectedFile}
                  />
                  {selectedPlace.photo && !isPhotoUrlValid && !selectedFile && (
                    <Form.Control.Feedback type="invalid">
                      Пожалуйста, введите корректный URL
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Или загрузите фото</Form.Label>
                  <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
                  {(selectedPlace.photo || selectedFile) && (
                    <div className="mt-2">
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : getImageUrl(selectedPlace.photo)
                        }
                        alt="Предпросмотр"
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '5px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/placeholder-image.png';
                        }}
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Название места</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={selectedPlace.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Название места"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Описание</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={selectedPlace.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={3}
                    placeholder="Описание места"
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Широта</Form.Label>
                      <Form.Control
                        type="number"
                        name="latitude"
                        value={selectedPlace.latitude || ''}
                        onChange={(e) =>
                          handleFieldChange('latitude', parseFloat(e.target.value))
                        }
                        step="0.000001"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Долгота</Form.Label>
                      <Form.Control
                        type="number"
                        name="longitude"
                        value={selectedPlace.longitude || ''}
                        onChange={(e) =>
                          handleFieldChange('longitude', parseFloat(e.target.value))
                        }
                        step="0.000001"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Часы работы</Form.Label>
                  <Form.Control
                    type="text"
                    name="working_hours"
                    value={selectedPlace.working_hours || ''}
                    onChange={(e) => handleFieldChange('working_hours', e.target.value)}
                    placeholder="09:00-18:00, Пн-Пт"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Адрес</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={selectedPlace.location || ''}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    placeholder="Адрес места"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Веб-сайт</Form.Label>
                  <Form.Control
                    type="url"
                    name="web"
                    value={selectedPlace.web || ''}
                    onChange={(e) => handleFieldChange('web', e.target.value)}
                    placeholder="https://example.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Категории</Form.Label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}
                  >
                    {categories.map((category) => (
                      <div key={category.id} style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Check
                          type="checkbox"
                          id={`category-${category.id}`}
                          label={category.name}
                          value={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
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
                    value={selectedPlace.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="Название города"
                  />
                </Form.Group>

              </div>
            ) : (
              <div className="text-center p-4">
                <p>Выберите место на карте для редактирования</p>
              </div>
            )}
          </SimpleBar>
        </div>
      </div>

      <div
        className="px-4 py-2"
        style={{
          width: '55%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflow: 'hidden',
          backgroundColor: 'white',
          borderLeft: '1px solid #F3F3F3',
        }}
      >
        <div style={{ height: '100%', backgroundColor: 'white' }}>
          <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '10px' }}
            attributionControl={false}
            maxBounds={[[59.31, 27.3], [59.41, 27.53]]}
            maxBoundsViscosity={1.0}
            minZoom={12}
            maxZoom={17}
            zoomControl={false}
            whenCreated={(map) => map.on('zoomend', () => handleZoomEnd(map))}
          >
            <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" />

            <CenterMapOnChange />

            {places.map((place) => {
              const customIcon = createCustomIcon(getImageUrl(place.photo));

              return (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={customIcon}
                  draggable={selectedPlace?.id === place.id}
                  eventHandlers={{
                    click: () => handleMarkerClick(place),
                    dragend: (e) => handleMarkerDrag(e, place),
                  }}
                >
                  <Popup>
                    <div style={{ width: '200px' }}>
                      <h4>{place.name}</h4>
                      {place.photo && (
                        <img
                          src={getImageUrl(place.photo)}
                          alt={place.name}
                          style={{
                            width: '100%',
                            height: '100px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            marginBottom: '10px',
                          }}
                        />
                      )}
                      <p>
                        <strong>Часы работы:</strong> {place.working_hours}
                      </p>
                      {place.web && (
                        <a href={place.web} target="_blank" rel="noopener noreferrer">
                          Посетить сайт
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default UpdateMapPage;