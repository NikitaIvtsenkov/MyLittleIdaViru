// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Form, Button, Container, Spinner, Alert, Tabs, Tab, Row, Col } from 'react-bootstrap';

// import axios from 'axios';
// import 'leaflet/dist/leaflet.css';
// import { useTranslation } from 'react-i18next';

// const buttonStyle = {
//   backgroundColor: 'rgba(0,0,0,0)',
//   border: '1.5px solid rgba(0,0,0)',
//   color: 'black',
//   padding: '0.5rem 1.4rem',
//   cursor: 'pointer',
//   transition: 'all 0.3s ease',
//   fontFamily: "'Manrope', sans-serif",
//   borderRadius: '30px',
//   fontSize: '0.9rem',
//   display: 'flex',
//   alignItems: 'center',
//   gap: '0.5rem'
// };

// const EventCreatePage = () => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const [event, setEvent] = useState({
//     name: '',
//     description: '',
//     date_time: '',
//     url: '',
//     placeId: '',
//     cityId: ''
//   });
//   const [places, setPlaces] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [imageUrl, setImageUrl] = useState('');
//   const [previewImage, setPreviewImage] = useState('');
//   const [activeTab, setActiveTab] = useState('upload');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [placesRes, citiesRes] = await Promise.all([
//           axios.get('http://localhost:5000/places'),
//           axios.get('http://localhost:5000/cities')
//         ]);

//         setPlaces(placesRes.data);
//         setCities(citiesRes.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load places or cities');
//         setLoading(false);
//         console.error('Error fetching data:', err);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEvent(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setPreviewImage(URL.createObjectURL(file));
//       setImageUrl('');
//     }
//   };

//   const handleUrlChange = (e) => {
//     const url = e.target.value;
//     setImageUrl(url);
//     if (url) {
//       setPreviewImage(url);
//       setSelectedFile(null);
//     }
//   };

//   const handleRemoveImage = () => {
//     setSelectedFile(null);
//     setImageUrl('');
//     setPreviewImage('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('Authorization required');

//       const formData = new FormData();
//       formData.append('name', event.name);
//       formData.append('description', event.description);
//       formData.append('date_time', event.date_time);
//       formData.append('url', event.url);
//       formData.append('placeId', event.placeId);
//       formData.append('cityId', event.cityId);

//       if (selectedFile) {
//         formData.append('photoFile', selectedFile);
//       } else if (imageUrl) {
//         formData.append('image', imageUrl);
//       }

//       const response = await axios.post('http://localhost:5000/events', formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       navigate('/adminpanel', {
//         state: { success: 'Event created successfully!' }
//       });
//     } catch (err) {
//       console.error('Create error:', err);
//       setError(err.response?.data?.message || 'Failed to create event');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Container className="d-flex justify-content-center mt-5">
//         <Spinner animation="border" />
//       </Container>
//     );
//   }

//   return (
//     <div className="page-container">
//       <style>
//         {`
//           .form-control:focus {
//             border-color: #000;
//             box-shadow: 0 0 0 0.2rem rgba(0,0,0,0.25);
//           }
//         `}
//       </style>
//       <div className="mt-4 mx-5">
//         <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
//           <h2 style={{fontWeight: "bold"}}>{t('eventEdittitle')}</h2>
//           <div style={{ display: 'flex', gap: '0.5rem' }}>
//             <Button style={buttonStyle} onClick={() => navigate('/adminpanel')}>
//               {t('eventEditcancel')}
//             </Button>
//             <Button 
//               style={{
//                 ...buttonStyle,
//                 backgroundColor: isSubmitting ? 'rgba(0,0,0,0.1)' : 'black',
//                 color: 'white',
//                 border: '1.5px solid black'
//               }} 
//               onClick={handleSubmit} 
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                   <span className="ms-2">Creating...</span>
//                 </>
//               ) : (
//                 t('eventEditcreate')
//               )}
//             </Button>
//           </div>
//         </div>

//         {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

//         <Form onSubmit={handleSubmit}>
//           <div className="d-flex mb-4" style={{ gap: '20px' }}>
//             {/* Left Block - Event Information */}
//             <div style={{ 
//               flex: '0 0 60%',
//               maxWidth: '60%',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '1rem',
//               overflow: 'hidden'
//             }}>
//               {/* General Information Block */}
//               <div style={{
//                 backgroundColor: 'white',
//                 borderRadius: '8px',
//                 padding: '2rem',
//                 flex: '1 0 auto'
//               }}>
//                 <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.generalInfo')}</h5>
//                 <Form.Group className="mb-3">
//                   <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.name')}</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="name"
//                     value={event.name}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.description')}</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     name="description"
//                     value={event.description}
//                     onChange={handleInputChange}
//                     rows={4}
//                   />
//                 </Form.Group>
//               </div>

//               {/* Details Block */}
//               <div style={{
//                 backgroundColor: 'white',
//                 borderRadius: '8px',
//                 padding: '2rem',
//                 flex: '1 0 auto'
//               }}>
//                 <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.details')}</h5>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.dateTime')}</Form.Label>
//                       <Form.Control
//                         type="datetime-local"
//                         name="date_time"
//                         value={event.date_time}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.url')}</Form.Label>
//                       <Form.Control
//                         type="url"
//                         name="url"
//                         value={event.url}
//                         onChange={handleInputChange}
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>

//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.place')}</Form.Label>
//                       <Form.Select
//                         name="placeId"
//                         value={event.placeId}
//                         onChange={handleInputChange}
//                         required
//                       >
//                         <option value="">{t('eventEdit.selectPlace')}</option>
//                         {places.map(place => (
//                           <option key={place.id} value={place.id}>{place.name}</option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.city')}</Form.Label>
//                       <Form.Select
//                         name="cityId"
//                         value={event.cityId}
//                         onChange={handleInputChange}
//                         required
//                       >
//                         <option value="">{t('eventEdit.selectCity')}</option>
//                         {cities.map(city => (
//                           <option key={city.id} value={city.id}>{city.city_name}</option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </div>
//             </div>

//             {/* Right Block - Photo */}
//             <div className="p-0" style={{
//               width: '40%',
//               height: '100%',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '1rem',
//               overflow: 'hidden',
//               backgroundColor: 'transparent',
//               borderLeft: '1px solid #F3F3F3',
//             }}>
//               {/* Photo Block */}
//               <div style={{
//                 backgroundColor: 'white',
//                 borderRadius: '8px',
//                 padding: '2rem',
//                 flex: '1 0 auto',
//               }}>
//                 <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.photo')}</h5>
//                 <Form.Group className="mb-3">
//                   <Tabs
//                     activeKey={activeTab}
//                     onSelect={(k) => setActiveTab(k)}
//                     className="mb-3"
//                   >
//                     <Tab eventKey="upload" title={t('eventEdit.uploadTab')}>
//                       <Form.Control 
//                         type="file" 
//                         onChange={handleFileChange} 
//                         accept="image/*"
//                         className="mt-2"
//                       />
//                     </Tab>
//                     <Tab eventKey="url" title={t('eventEdit.urlTab')}>
//                       <Form.Control
//                         type="url"
//                         placeholder="https://example.com/image.jpg"
//                         value={imageUrl}
//                         onChange={handleUrlChange}
//                         className="mt-2"
//                       />
//                     </Tab>
//                   </Tabs>

//                   <div className="mt-2" style={{ 
//                     minHeight: '200px', 
//                     border: '1px dashed #ddd', 
//                     borderRadius: '5px', 
//                     display: 'flex', 
//                     justifyContent: 'center', 
//                     alignItems: 'center',
//                     backgroundColor: previewImage ? 'transparent' : '#f8f9fa'
//                   }}>
//                     {previewImage ? (
//                       <div style={{ width: '100%' }}>
//                         <img
//                           src={previewImage}
//                           alt="Preview"
//                           style={{ 
//                             maxWidth: '100%', 
//                             maxHeight: '200px', 
//                             objectFit: 'contain', 
//                             borderRadius: '5px' 
//                           }}
//                           className="img-thumbnail"
//                         />
//                         <Button 
//                           style={buttonStyle}
//                           className="mt-2"
//                           onClick={handleRemoveImage}
//                         >
//                           {t('eventEdit.removePhoto')}
//                         </Button>
//                       </div>
//                     ) : (
//                       <div 
//                         style={{ 
//                           width: '100%', 
//                           height: '200px', 
//                           display: 'flex', 
//                           justifyContent: 'center', 
//                           alignItems: 'center',
//                           cursor: 'pointer'
//                         }}
//                         onClick={() => document.querySelector('input[type="file"]')?.click()}
//                       >
//                         <span className="text-muted">{t('eventEdit.imagePlaceholder')}</span>
//                       </div>
//                     )}
//                   </div>
//                 </Form.Group>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Buttons */}
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <div></div>
//             <div style={{ display: 'flex', gap: '0.5rem' }}>
//               <Button style={buttonStyle} onClick={() => navigate('/adminpanel')}>
//                 {t('eventEditcancel')}
//               </Button>
//               <Button 
//                 style={{
//                   ...buttonStyle,
//                   backgroundColor: isSubmitting ? 'rgba(0,0,0,0.1)' : 'black',
//                   color: 'white',
//                   border: '1.5px solid black'
//                 }} 
//                 type="submit" 
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                     <span className="ms-2">Creating...</span>
//                   </>
//                 ) : (
//                   t('eventEditcreate')
//                 )}
//               </Button>
//             </div>
//           </div>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default EventCreatePage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Form, Button, Container, Spinner, Alert, Tabs, Tab, Row, Col } from 'react-bootstrap';
// import axios from 'axios';
// import 'leaflet/dist/leaflet.css';
// import { useTranslation } from 'react-i18next';

// const buttonStyle = {
//   backgroundColor: 'rgba(0,0,0,0)',
//   border: '1.5px solid rgba(0,0,0)',
//   color: 'black',
//   padding: '0.5rem 1.4rem',
//   cursor: 'pointer',
//   transition: 'all 0.3s ease',
//   fontFamily: "'Manrope', sans-serif",
//   borderRadius: '30px',
//   fontSize: '0.9rem',
//   display: 'flex',
//   alignItems: 'center',
//   gap: '0.5rem'
// };

// const EventCreatePage = () => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const [event, setEvent] = useState({
//     name: '',
//     description: '',
//     date_time: '',
//     url: '',
//     placeId: '',
//     cityId: ''
//   });
//   const [places, setPlaces] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [imageUrl, setImageUrl] = useState('');
//   const [previewImage, setPreviewImage] = useState('');
//   const [activeTab, setActiveTab] = useState('upload');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [placesLoading, setPlacesLoading] = useState(false);

//   const fetchCities = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/cities');
//       setCities(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError(t('eventEdit.noCities'));
//       setLoading(false);
//       console.error('Error fetching cities:', err);
//     }
//   };

//   const fetchPlacesByCity = async (cityId) => {
//     if (!cityId) {
//       setPlaces([]);
//       return;
//     }

//     setPlacesLoading(true);
//     try {
//       const response = await axios.get(`http://localhost:5000/places/city/${cityId}`);
//       setPlaces(response.data || []);
//     } catch (err) {
//       console.error('Error fetching places:', err);
//       setPlaces([]);
//       setError(t('eventEdit.noPlaces'));
//     } finally {
//       setPlacesLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCities();
//   }, [t]);

//   useEffect(() => {
//     if (event.cityId) {
//       fetchPlacesByCity(event.cityId);
//     } else {
//       setPlaces([]);
//     }
//   }, [event.cityId]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEvent(prev => {
//       const newEvent = { ...prev, [name]: value };
//       if (name === 'cityId') {
//         newEvent.placeId = '';
//       }
//       return newEvent;
//     });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setPreviewImage(URL.createObjectURL(file));
//       setImageUrl('');
//     }
//   };

//   const handleUrlChange = (e) => {
//     const url = e.target.value;
//     setImageUrl(url);
//     if (url) {
//       setPreviewImage(url);
//       setSelectedFile(null);
//     }
//   };

//   const handleRemoveImage = () => {
//     setSelectedFile(null);
//     setImageUrl('');
//     setPreviewImage('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('Authorization required');

//       const formData = new FormData();
//       formData.append('name', event.name);
//       formData.append('description', event.description);
//       formData.append('date_time', event.date_time);
//       formData.append('url', event.url);
//       formData.append('placeId', event.placeId);
//       formData.append('cityId', event.cityId);

//       if (selectedFile) {
//         formData.append('photoFile', selectedFile);
//       } else if (imageUrl) {
//         formData.append('image', imageUrl);
//       }

//       await axios.post('http://localhost:5000/events', formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       navigate('/adminpanel', {
//         state: { success: t('eventEdit.create') }
//       });
//     } catch (err) {
//       console.error('Create error:', err);
//       setError(err.response?.data?.message || t('eventEdit.notFound'));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Container className="d-flex justify-content-center mt-5">
//         <Spinner animation="border" />
//       </Container>
//     );
//   }

//   return (
//     <div className="page-container">
//       <style>
//         {`
//           .form-control:focus {
//             border-color: #000;
//             box-shadow: 0 0 0 0.2rem rgba(0,0,0,0.25);
//           }
//         `}
//       </style>
//       <div className="mt-4 mx-5">
//         <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
//           <h2 style={{fontWeight: "bold"}}>{t('eventEdit.title')}</h2>
//           <div style={{ display: 'flex', gap: '0.5rem' }}>
//             <Button style={buttonStyle} onClick={() => navigate('/adminpanel')}>
//               {t('eventEdit.cancel')}
//             </Button>
//             <Button 
//               style={{
//                 ...buttonStyle,
//                 backgroundColor: isSubmitting ? 'rgba(0,0,0,0.1)' : 'black',
//                 color: 'white',
//                 border: '1.5px solid black'
//               }} 
//               onClick={handleSubmit} 
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                   <span className="ms-2">{t('eventEdit.saving')}</span>
//                 </>
//               ) : (
//                 t('eventEdit.create')
//               )}
//             </Button>
//           </div>
//         </div>

//         {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

//         <Form onSubmit={handleSubmit}>
//           <div className="d-flex mb-4" style={{ gap: '20px' }}>
//             {/* Left Block - Event Information */}
//             <div style={{ 
//               flex: '0 0 60%',
//               maxWidth: '60%',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '1rem',
//               overflow: 'hidden'
//             }}>
//               {/* General Information Block */}
//               <div style={{
//                 backgroundColor: 'white',
//                 borderRadius: '8px',
//                 padding: '2rem',
//                 flex: '1 0 auto'
//               }}>
//                 <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.generalInfo')}</h5>
//                 <Form.Group className="mb-3">
//                   <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.name')}</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="name"
//                     value={event.name}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.description')}</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     name="description"
//                     value={event.description}
//                     onChange={handleInputChange}
//                     rows={4}
//                   />
//                 </Form.Group>
//               </div>

//               {/* Details Block */}
//               <div style={{
//                 backgroundColor: 'white',
//                 borderRadius: '8px',
//                 padding: '2rem',
//                 flex: '1 0 auto'
//               }}>
//                 <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.details')}</h5>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.dateTime')}</Form.Label>
//                       <Form.Control
//                         type="datetime-local"
//                         name="date_time"
//                         value={event.date_time}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.url')}</Form.Label>
//                       <Form.Control
//                         type="url"
//                         name="url"
//                         value={event.url}
//                         onChange={handleInputChange}
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>

//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.city')}</Form.Label>
//                       <Form.Select
//                         name="cityId"
//                         value={event.cityId}
//                         onChange={handleInputChange}
//                         required
//                       >
//                         <option value="">{t('eventEdit.selectCity')}</option>
//                         {cities.map(city => (
//                           <option key={city.id} value={city.id}>{city.city_name}</option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.place')}</Form.Label>
//                       <Form.Select
//                         name="placeId"
//                         value={event.placeId}
//                         onChange={handleInputChange}
//                         required
//                         disabled={places.length === 0 || !event.cityId || placesLoading}
//                       >
//                         <option value="">
//                           {!event.cityId ? t('eventEdit.selectCity') : placesLoading ? t('eventEdit.loading') : places.length === 0 ? t('eventEdit.noPlaces') : t('eventEdit.selectPlace')}
//                         </option>
//                         {places.map(place => (
//                           <option key={place.id} value={place.id}>{place.name}</option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </div>
//             </div>

//             {/* Right Block - Photo */}
//             <div className="p-0" style={{
//               width: '40%',
//               height: '100%',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '1rem',
//               overflow: 'hidden',
//               backgroundColor: 'transparent',
//               borderLeft: '1px solid #F3F3F3',
//             }}>
//               {/* Photo Block */}
//               <div style={{
//                 backgroundColor: 'white',
//                 borderRadius: '8px',
//                 padding: '2rem',
//                 flex: '1 0 auto',
//               }}>
//                 <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.photo')}</h5>
//                 <Form.Group className="mb-3">
//                   <Tabs
//                     activeKey={activeTab}
//                     onSelect={(k) => setActiveTab(k)}
//                     className="mb-3"
//                   >
//                     <Tab eventKey="upload" title={t('eventEdit.uploadTab')}>
//                       <Form.Control 
//                         type="file" 
//                         onChange={handleFileChange} 
//                         accept="image/*"
//                         className="mt-2"
//                       />
//                     </Tab>
//                     <Tab eventKey="url" title={t('eventEdit.urlTab')}>
//                       <Form.Control
//                         type="url"
//                         placeholder="https://example.com/image.jpg"
//                         value={imageUrl}
//                         onChange={handleUrlChange}
//                         className="mt-2"
//                       />
//                     </Tab>
//                   </Tabs>

//                   <div className="mt-2" style={{ 
//                     minHeight: '200px', 
//                     border: '1px dashed #ddd', 
//                     borderRadius: '5px', 
//                     display: 'flex', 
//                     justifyContent: 'center', 
//                     alignItems: 'center',
//                     backgroundColor: previewImage ? 'transparent' : '#f8f9fa'
//                   }}>
//                     {previewImage ? (
//                       <div style={{ width: '100%' }}>
//                         <img
//                           src={previewImage}
//                           alt="Preview"
//                           style={{ 
//                             maxWidth: '100%', 
//                             maxHeight: '200px', 
//                             objectFit: 'contain', 
//                             borderRadius: '5px' 
//                           }}
//                           className="img-thumbnail"
//                         />
//                         <Button 
//                           style={buttonStyle}
//                           className="mt-2"
//                           onClick={handleRemoveImage}
//                         >
//                           {t('eventEdit.removePhoto')}
//                         </Button>
//                       </div>
//                     ) : (
//                       <div 
//                         style={{ 
//                           width: '100%', 
//                           height: '200px', 
//                           display: 'flex', 
//                           justifyContent: 'center', 
//                           alignItems: 'center',
//                           cursor: 'pointer'
//                         }}
//                         onClick={() => document.querySelector('input[type="file"]')?.click()}
//                       >
//                         <span className="text-muted">{t('eventEdit.imagePlaceholder')}</span>
//                       </div>
//                     )}
//                   </div>
//                 </Form.Group>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Buttons */}
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <div></div>
//             <div style={{ display: 'flex', gap: '0.5rem' }}>
//               <Button style={buttonStyle} onClick={() => navigate('/adminpanel')}>
//                 {t('eventEdit.cancel')}
//               </Button>
//               <Button 
//                 style={{
//                   ...buttonStyle,
//                   backgroundColor: isSubmitting ? 'rgba(0,0,0,0.1)' : 'black',
//                   color: 'white',
//                   border: '1.5px solid black'
//                 }} 
//                 type="submit" 
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                     <span className="ms-2">{t('eventEdit.saving')}</span>
//                   </>
//                 ) : (
//                   t('eventEdit.create')
//                 )}
//               </Button>
//             </div>
//           </div>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default EventCreatePage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Spinner, Alert, Tabs, Tab, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

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

const EventCreatePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [event, setEvent] = useState({
    name: '',
    description: '',
    date_time: '',
    url: '',
    placeId: '',
    cityId: ''
  });
  const [places, setPlaces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placesLoading, setPlacesLoading] = useState(false);

  const fetchCities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/cities');
      setCities(response.data);
      setLoading(false);
    } catch (err) {
      setError(t('eventEdit.noCities'));
      setLoading(false);
      console.error('Error fetching cities:', err);
    }
  };

  const fetchPlacesByCity = async (cityId) => {
    if (!cityId) {
      setPlaces([]);
      return;
    }

    setPlacesLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/places/city/${cityId}`);
      setPlaces(response.data || []);
    } catch (err) {
      console.error('Error fetching places:', err);
      setPlaces([]);
      setError(t('eventEdit.noPlaces'));
    } finally {
      setPlacesLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [t]);

  useEffect(() => {
    if (event.cityId) {
      fetchPlacesByCity(event.cityId);
    } else {
      setPlaces([]);
    }
  }, [event.cityId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => {
      const newEvent = { ...prev, [name]: value };
      if (name === 'cityId') {
        newEvent.placeId = '';
        newEvent.url = ''; // Сбрасываем url при смене города
      } else if (name === 'placeId' && value) {
        const selectedPlace = places.find(place => place.id === parseInt(value));
        if (selectedPlace && selectedPlace.web) {
          newEvent.url = selectedPlace.web; // Устанавливаем url из place.web, если оно есть
        }
      }
      return newEvent;
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization required');

      const formData = new FormData();
      formData.append('name', event.name);
      formData.append('description', event.description);
      formData.append('date_time', event.date_time);
      formData.append('url', event.url);
      formData.append('placeId', event.placeId);
      formData.append('cityId', event.cityId);

      if (selectedFile) {
        formData.append('photoFile', selectedFile);
      } else if (imageUrl) {
        formData.append('image', imageUrl);
      }

      await axios.post('http://localhost:5000/events', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/adminpanel', {
        state: { success: t('eventEdit.create') }
      });
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.message || t('eventEdit.notFound'));
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
          .form-control:focus {
            border-color: #000;
            box-shadow: 0 0 0 0.2rem rgba(0,0,0,0.25);
          }
        `}
      </style>
      <div className="mt-4 mx-5">
        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <h2 style={{fontWeight: "bold"}}>{t('eventEdit.title')}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button style={buttonStyle} onClick={() => navigate('/adminpanel')}>
              {t('eventEdit.cancel')}
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
                  <span className="ms-2">{t('eventEdit.saving')}</span>
                </>
              ) : (
                t('eventEdit.create')
              )}
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <div className="d-flex mb-4" style={{ gap: '20px' }}>
            {/* Left Block - Event Information */}
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
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.generalInfo')}</h5>
                <Form.Group className="mb-3">
                  <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.name')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={event.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.description')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={event.description}
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
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.details')}</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.dateTime')}</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="date_time"
                        value={event.date_time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.url')}</Form.Label>
                      <Form.Control
                        type="url"
                        name="url"
                        value={event.url}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.city')}</Form.Label>
                      <Form.Select
                        name="cityId"
                        value={event.cityId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">{t('eventEdit.selectCity')}</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.city_name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{color: '#6b757d'}}>{t('eventEdit.place')}</Form.Label>
                      <Form.Select
                        name="placeId"
                        value={event.placeId}
                        onChange={handleInputChange}
                        required
                        disabled={places.length === 0 || !event.cityId || placesLoading}
                      >
                        <option value="">
                          {!event.cityId ? t('eventEdit.selectCity') : placesLoading ? t('eventEdit.loading') : places.length === 0 ? t('eventEdit.noPlaces') : t('eventEdit.selectPlace')}
                        </option>
                        {places.map(place => (
                          <option key={place.id} value={place.id}>{place.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Right Block - Photo */}
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
              {/* Photo Block */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                flex: '1 0 auto',
              }}>
                <h5 className="mb-4" style={{ fontWeight: 600 }}>{t('eventEdit.photo')}</h5>
                <Form.Group className="mb-3">
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                  >
                    <Tab eventKey="upload" title={t('eventEdit.uploadTab')}>
                      <Form.Control 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*"
                        className="mt-2"
                      />
                    </Tab>
                    <Tab eventKey="url" title={t('eventEdit.urlTab')}>
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
                          {t('eventEdit.removePhoto')}
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
                        <span className="text-muted">{t('eventEdit.imagePlaceholder')}</span>
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
                {t('eventEdit.cancel')}
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
                    <span className="ms-2">{t('eventEdit.saving')}</span>
                  </>
                ) : (
                  t('eventEdit.create')
                )}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default EventCreatePage;