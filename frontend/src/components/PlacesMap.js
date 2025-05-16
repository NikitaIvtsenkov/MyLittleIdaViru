
// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { Button, Dropdown, Form, NavDropdown, Modal } from 'react-bootstrap';
// import { useTranslation } from 'react-i18next';
// import SimpleBar from 'simplebar-react';
// import 'simplebar-react/dist/simplebar.min.css';
// import axios from 'axios';
// import _ from 'lodash';
// import { parseConfig } from '../components/parseConfigs.js';
// import leftArrowIcon from "../assets/carouselCities/arrows/ArrowLeft.svg";
// import rightArrowIcon from "../assets/carouselCities/arrows/ArrowRight.svg";

// // Fix for leaflet markers
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//   iconUrl: icon,
//   shadowUrl: iconShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41],
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// const CLUSTER_RADIUS = 30;
// const MapUpdater = ({ center, zoom }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (map && center && center[0] && center[1]) {
//       map.setView(center, zoom);
//     }
//   }, [center, zoom, map]);
//   return null;
// };
// const clusterIcon = (count) =>
//   L.divIcon({
//     className: 'cluster-marker',
//     html: `<div style="
//       width: 40px; 
//       height: 40px;
//       background:rgb(19, 108, 50);
//       border-radius: 50%;
//       color: white;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-weight: bold;
//       font-size: 16px;
//       outline: 4px solid rgba(19, 108, 50, 0.3);
//       box-shadow: 0 0 5px rgba(0,0,0,0.3);
//     ">${count}</div>`,
//     iconSize: [40, 40],
//     iconAnchor: [20, 40],
//   });

// const getImageUrl = (photo) => {
//   if (!photo) return 'https://via.placeholder.com/100';
//   return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
// };

// const createCustomIcon = (photoUrl, place) => {
//   const imageUrl = getImageUrl(photoUrl);
//   return L.divIcon({
//     className: 'custom-marker',
//     html: `
//       <div style="
//         width: 50px;
//         height: 50px;
//         border: 2px solid white;
//         border-radius: 50%;
//         box-shadow: 0 0 5px rgba(0,0,0,0.3);
//         overflow: hidden;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         background: ${photoUrl ? '#fff' : '#144F7B'};
//       ">
//         ${photoUrl
//           ? `<img src="${imageUrl}" alt="Marker" style="width:100%;height:100%;object-fit:cover;" />`
//           : `<span style="color:white;font-weight:bold;">${place?.name?.charAt(0) || '?'}</span>`}
//       </div>
//     `,
//     iconSize: [50, 50],
//     iconAnchor: [25, 50],
//   });
// };

// const MarkerClusters = ({ places, onPlaceClick }) => {
//   const map = useMap();
//   const [clusters, setClusters] = useState([]);

//   const calculateClusters = () => {
//     if (!places.length || !map) return [];

//     const clusters = [];
//     const processed = new Set();

//     places.forEach((place, index) => {
//       if (processed.has(index)) return;

//       const markersInCluster = [place];
//       const position = L.latLng(place.latitude, place.longitude);
//       const point = map.latLngToLayerPoint(position);

//       for (let i = index + 1; i < places.length; i++) {
//         if (processed.has(i)) continue;

//         const neighborPos = L.latLng(places[i].latitude, places[i].longitude);
//         const neighborPoint = map.latLngToLayerPoint(neighborPos);

//         if (point.distanceTo(neighborPoint) < CLUSTER_RADIUS) {
//           markersInCluster.push(places[i]);
//           processed.add(i);
//         }
//       }

//       const avgLat = markersInCluster.reduce((sum, p) => sum + p.latitude, 0) / markersInCluster.length;
//       const avgLng = markersInCluster.reduce((sum, p) => sum + p.longitude, 0) / markersInCluster.length;

//       clusters.push({
//         position: [avgLat, avgLng],
//         count: markersInCluster.length,
//         places: markersInCluster,
//       });
//     });

//     return clusters;
//   };

//   const updateClusters = () => {
//     const newClusters = calculateClusters();
//     setClusters(newClusters);
//   };

//   useEffect(() => {
//     if (!map) return;

//     const debounceUpdate = _.debounce(updateClusters, 100);
//     map.on('moveend zoomend', debounceUpdate);
//     updateClusters();

//     return () => {
//       map.off('moveend zoomend', debounceUpdate);
//     };
//   }, [map, places]);

//   return clusters.map((cluster, index) => (
//     <Marker
//       key={`cluster-${index}`}
//       position={cluster.position}
//       icon={
//         cluster.count > 1 
//         ? clusterIcon(cluster.count) 
//         : createCustomIcon(cluster.places[0].photo, cluster.places[0])
//       }
//       eventHandlers={{
//         click: () => {
//           if (cluster.count === 1) {
//             onPlaceClick(cluster.places[0]);
//           } else {
//             map.flyTo(cluster.position, map.getZoom() + 2);
//           }
//         },
//       }}
//     >
//       {cluster.count > 1 && (
//         <Popup>
//           <div style={{ maxWidth: 200 }}>
//             {cluster.places.map((place) => (
//               <div
//                 key={place.id}
//                 style={{ margin: '5px 0', cursor: 'pointer' }}
//                 onClick={() => onPlaceClick(place)}
//               >
//                 {place.name}
//               </div>
//             ))}
//           </div>
//         </Popup>
//       )}
//     </Marker>
//   ));
// };

// // Helper function to format date and time
// const formatDate = (dateTimeStr) => {
//   if (!dateTimeStr) return "Нет даты";
//   try {
//     const date = new Date(dateTimeStr);
//     if (isNaN(date.getTime())) return "Неверная дата";
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const datePart = `${day}.${month}.${year}`;
//     const timePart = (hours !== "00" || minutes !== "00") ? `, ${hours}:${minutes}` : "";
//     return datePart + timePart;
//   } catch (e) {
//     console.error("Error formatting date:", dateTimeStr, e);
//     return "Ошибка даты";
//   }
// };

// // Styles for buttons
// const buttonStyle = {
//   borderRadius: "100%",
//   border: "1px solid rgba(150, 150, 150, 0.6)",
//   width: "45px",
//   height: "45px",
//   backgroundColor: "white",
//   cursor: "pointer",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   transition: "box-shadow 0.3s ease, opacity 0.3s ease",
// };

// const PlacesMap = ({ 
//   city = 'Jõhvi', 
//   center: initialCenter = [59.35812597130304, 27.41197179331706], 
//   zoom: initialZoom = 13,
//   onClose
// }) => {
//   const { t } = useTranslation();
//   const [places, setPlaces] = useState([]);
//   const [filteredPlaces, setFilteredPlaces] = useState([]);
//   const [mapFilteredPlaces, setMapFilteredPlaces] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [selectedCity, setSelectedCity] = useState(city);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [mapReady, setMapReady] = useState(false);
//   const [selectedPlace, setSelectedPlace] = useState(null);
//   const [showPlacesList, setShowPlacesList] = useState(false);
//   const [showDetailsPanel, setShowDetailsPanel] = useState(false);
//   const [events, setEvents] = useState([]);
//   const [eventsCount, setEventsCount] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [center, setCenter] = useState(initialCenter);
//   const [zoom, setZoom] = useState(initialZoom);
//   const [cityData, setCityData] = useState(null);
//   const [eventFilter, setEventFilter] = useState('all');
//   const [isLeftAnimating, setIsLeftAnimating] = useState(false);
//   const [isRightAnimating, setIsRightAnimating] = useState(false);
//   const [showModal, setShowModal] = useState(false); // State for modal
//   const today = new Date();
//   const thisWeekEnd = new Date(today);
//   thisWeekEnd.setDate(today.getDate() + 7);
//   const thisMonthEnd = new Date(today);
//   thisMonthEnd.setMonth(today.getMonth() + 1);

//   useEffect(() => {
//     const fetchCities = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/cities');
//         setCities(response.data);
//       } catch (error) {
//         console.error(t('placesMap.errorLoadingCities'), error);
//         setCities([]);
//       }
//     };

//     // const fetchCityData = async () => {
//     //   try {
//     //     const response = await axios.get('http://localhost:5000/cities');
//     //     const cities = response.data;
//     //     const currentCity = cities.find(c => c.city_name.toLowerCase() === selectedCity.toLowerCase());
        
//     //     if (currentCity) {
//     //       setCityData(currentCity);
//     //       if (currentCity.latitude && currentCity.longitude) {
//     //         setCenter([currentCity.latitude, currentCity.longitude]);
//     //         setZoom(13);
//     //       }
//     //     } else {
//     //       console.warn(`City ${selectedCity} not found in database`);
//     //       setCenter(initialCenter);
//     //       setZoom(initialZoom);
//     //     }
//     //   } catch (error) {
//     //     console.error(t('placesMap.errorLoadingCity'), error);
//     //     setCenter(initialCenter);
//     //     setZoom(initialZoom);
//     //   }
//     // };
//     const fetchCityData = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/cities');
//         const cities = response.data;
//         console.log('Cities from server:', cities);
//         const currentCity = cities.find(c => c.city_name.toLowerCase() === selectedCity.toLowerCase());
//         console.log('Selected city data:', currentCity);
//         if (currentCity) {
//           setCityData(currentCity);
//           if (currentCity.latitude && currentCity.longitude) {
//             setCenter([currentCity.latitude, currentCity.longitude]);
//             console.log('New center:', [currentCity.latitude, currentCity.longitude]);
//             setZoom(13);
//           }
//         } else {
//           console.warn(`City ${selectedCity} not found in database`);
//           setCenter(initialCenter);
//           setZoom(initialZoom);
//         }
//       } catch (error) {
//         console.error(t('placesMap.errorLoadingCity'), error);
//         setCenter(initialCenter);
//         setZoom(initialZoom);
//       }
//     };

//     const fetchPlaces = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/places`);
//         const normalizedCity = selectedCity.toLowerCase();
//         const cityPlaces = response.data.filter(
//           place => place.cityData && place.cityData.city_name.toLowerCase() === normalizedCity
//         );
//         setPlaces(cityPlaces);
//         setFilteredPlaces(cityPlaces);
//         setMapFilteredPlaces(cityPlaces);
//         setMapReady(true);

//         const counts = {};
//         for (const place of cityPlaces) {
//           try {
//             const eventsResponse = await axios.get(`http://localhost:5000/events`, {
//               params: { place_id: place.id, limit: 50 },
//             });
//             const eventsData = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
//             counts[place.id] = eventsData.length;
//           } catch (error) {
//             counts[place.id] = 0;
//           }
//         }
//         setEventsCount(counts);
//       } catch (error) {
//         console.error(t('placesMap.errorLoadingPlaces'), error);
//         setPlaces([]);
//         setFilteredPlaces([]);
//         setMapFilteredPlaces([]);
//         setEventsCount({});
//       }
//     };

//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/categories');
//         setCategories(response.data);
//       } catch (error) {
//         console.error(t('placesMap.errorLoadingCategories'), error);
//         setCategories([]);
//       }
//     };

//     fetchCities();
//     fetchCityData();
//     fetchPlaces();
//     fetchCategories();
//   }, [selectedCity, t]);

//   useEffect(() => {
//     let filtered = places;
    
//     if (selectedCategories.length > 0) {
//       filtered = filtered.filter(place => 
//         place.categories?.some(cat => selectedCategories.includes(cat.id)));
//     }
    
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(place => 
//         place.name.toLowerCase().includes(query) || 
//         place.location?.toLowerCase().includes(query));
//     }

//     setFilteredPlaces(filtered);

//     let mapFiltered = filtered;
//     if (eventFilter === 'withEvents') {
//       mapFiltered = filtered.filter(place => eventsCount[place.id] > 0);
//     } else if (eventFilter !== 'all') {
//       mapFiltered = mapFiltered.filter(place => {
//         return eventsCount[place.id] > 0;
//       }).filter(async place => {
//         const eventsResponse = await axios.get(`http://localhost:5000/events`, {
//           params: { place_id: place.id, limit: 50 },
//         });
//         const eventsData = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
//         return eventsData.some(event => {
//           const eventDate = new Date(event.date);
//           if (eventFilter === 'today') {
//             return eventDate.toDateString() === today.toDateString();
//           } else if (eventFilter === 'thisWeek') {
//             return eventDate >= today && eventDate <= thisWeekEnd;
//           } else if (eventFilter === 'thisMonth') {
//             return eventDate >= today && eventDate <= thisMonthEnd;
//           }
//           return true;
//         });
//       });
//     }
    
//     setMapFilteredPlaces(mapFiltered);
//   }, [places, selectedCategories, searchQuery, eventFilter, eventsCount]);

//   const fetchEvents = async (placeId) => {
//     setLoading(true);
//     try {
//       let response;
//       let eventsData = [];

//       if (selectedPlace?.name === 'FC Phoenix' && selectedPlace.web) {
//         const webUrl = selectedPlace.web;
//         if (!webUrl || typeof webUrl !== 'string') {
//           throw new Error(t('placesMap.invalidUrl'));
//         }

//         let parsedUrl;
//         try {
//           parsedUrl = new URL(webUrl);
//           if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
//             throw new Error(t('placesMap.invalidProtocol'));
//           }
//         } catch (e) {
//           throw new Error(t('placesMap.urlParsingError'));
//         }

//         const siteConfig = parseConfig[parsedUrl.origin];
//         if (!siteConfig) {
//           throw new Error(t('placesMap.configNotFound'));
//         }

//         response = await axios.post(
//           'http://localhost:5000/places/parse-events',
//           {
//             url: webUrl,
//             config: siteConfig,
//           },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               Accept: 'application/json',
//             },
//           }
//         );

//         if (!response.data || typeof response.data !== 'object' || !('events' in response.data) || !Array.isArray(response.data.events)) {
//           throw new Error(t('placesMap.noEventsInResponse'));
//         }

//         eventsData = response.data.events;
//       } else {
//         response = await axios.get(`http://localhost:5000/events`, {
//           params: {
//             place_id: placeId,
//             limit: 50, // Fetch all events
//           },
//         });

//         if (Array.isArray(response.data)) {
//           eventsData = response.data;
//         } else if (response.data && typeof response.data === 'object' && 'events' in response.data && Array.isArray(response.data.events)) {
//           eventsData = response.data.events;
//         } else {
//           throw new Error(t('placesMap.noEventsInResponse'));
//         }
//       }

//       eventsData = eventsData.sort((a, b) => {
//         const dateA = a.date ? new Date(a.date) : new Date(0);
//         const dateB = b.date ? new Date(b.date) : new Date(0);
//         return dateA - dateB;
//       });

//       setEvents(eventsData);
//       setError(null);
//     } catch (error) {
//       console.error(t('placesMap.eventsLoadError'), error);
//       setError(error.response?.data?.message || error.message || t('placesMap.unknownError'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePlaceClick = (place) => {
//     setSelectedPlace(place);
//     setShowDetailsPanel(true);
//     setIsLeftAnimating(true);
//     fetchEvents(place.id);
//   };

//   const toggleCategory = (categoryId) => {
//     setSelectedCategories(prev => 
//       prev.includes(categoryId)
//         ? prev.filter(id => id !== categoryId)
//         : [...prev, categoryId]
//     );
//   };

//   const resetFilters = () => {
//     setSelectedCategories([]);
//     setSearchQuery('');
//     setEventFilter('all');
//   };

//   const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
//     <button
//       ref={ref}
//       onClick={(e) => {
//         e.preventDefault();
//         onClick(e);
//       }}
//       style={{
//         cursor: 'pointer',
//         borderRadius: '8px',
//         border: '1px solid #DEE2E6',
//         backgroundColor: 'white',
//         color: '#4F4F4F',
//         height: '40px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '0 10px',
//         outline: 'none',
//       }}
//     >
//       {children}
//     </button>
//   ));

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '90.5vh' }}>
//       <style>
//         {`
//           @keyframes slideInFromLeft {
//             from { transform: translateX(-100%); opacity: 0; }
//             to { transform: translateX(0); opacity: 1; }
//           }
//           @keyframes slideOutToLeft {
//             from { transform: translateX(0); opacity: 1; }
//             to { transform: translateX(-100%); opacity: 0; }
//           }
//           @keyframes slideInFromRight {
//             from { transform: translateX(100%); opacity: 0; }
//             to { transform: translateX(0); opacity: 1; }
//           }
//           @keyframes slideOutToRight {
//             from { transform: translateX(0); opacity: 1; }
//             to { transform: translateX(100%); opacity: 0; }
//           }
//           .slide-in-left {
//             animation: slideInFromLeft 0.3s ease-out forwards;
//           }
//           .slide-out-left {
//             animation: slideOutToLeft 0.3s ease-out forwards;
//           }
//           .slide-in-right {
//             animation: slideInFromRight 0.3s ease-out forwards;
//           }
//           .slide-out-right {
//             animation: slideOutToRight 0.3s ease-out forwards;
//           }
//           .details-panel {
//             transition: width 0.3s ease-out;
//           }
//           .truncate-3-5-lines {
//             display: -webkit-box;
//             -webkit-line-clamp: 3;
//             -webkit-box-orient: vertical;
//             overflow: hidden;
//             text-overflow: ellipsis;
//             max-height: 5em;
//           }
//           .category-button {
//             display: inline-flex;
//             align-items: center;
//             padding: 4px 8px;
//             margin-right: 8px;
//             border: 1px solid #ccc;
//             border-radius: 12px;
//             background-color: #fff;
//             font-size: 12px;
//             color: #333;
//           }
//           .category-button img {
//             margin-right: 4px;
//             width: 16px;
//             height: 16px;
//           }
//         `}
//       </style>
          
//       {mapReady && (
//   //       <MapContainer
//   //         center={center}
//   //         zoom={zoom}
//   //         style={{ height: '100%', width: '100%' }}
//   //         attributionControl={false}
//   //         maxBounds={cityData ? [
//   //           [cityData.latitude - 0.1, cityData.longitude - 0.1], // ±11 км вокруг города
//   // [cityData.latitude + 0.1, cityData.longitude + 0.1],
//   //         ] : [
//   //           [59.1, 26.9], // Юго-западный угол (Ида-Вирумаа, включая Кохтла-Ярве)
//   //   [59.5, 28.2], // Северо-восточный угол (включает Нарву)
//   //         ]}
//   //         maxBoundsViscosity={1}
//   //         minZoom={12}
//   //         maxZoom={17}
//   //         zoomControl={false}
//   //       >
//   //         <TileLayer
//   //           url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
//   //         />
//   //         <MarkerClusters 
//   //           places={mapFilteredPlaces} 
//   //           onPlaceClick={handlePlaceClick} 
//   //         />
//   //       </MapContainer>
//   <MapContainer
//     center={center}
//     zoom={zoom}
//     style={{ height: '100%', width: '100%' }}
//     attributionControl={false}
//     maxBounds={cityData ? [
//       [cityData.latitude - 0.1, cityData.longitude - 0.1],
//       [cityData.latitude + 0.1, cityData.longitude + 0.1],
//     ] : [
//       [59.1, 26.9],
//       [59.5, 28.2],
//     ]}
//     maxBoundsViscosity={1}
//     minZoom={12}
//     maxZoom={17}
//     zoomControl={false}
//   >
//     <MapUpdater center={center} zoom={zoom} />
//     <TileLayer
//       url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
//     />

//     {/* <TileLayer
//   url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
//   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
// /> */}
//     <MarkerClusters 
//       places={mapFilteredPlaces} 
//       onPlaceClick={handlePlaceClick} 
//     />
//   </MapContainer>
//       )}

//       {/* Top-left filter and city dropdowns */}
//       <div style={{ 
//         position: 'absolute', 
//         top: '8px', 
//         left: showDetailsPanel ? '620px' : '10px', 
//         zIndex: 1000,
//         transition: 'left 0.3s ease-out',
//         display: 'flex',
//         gap: '10px',
//         alignItems: 'center',
//       }}>
//         {/* Settings Dropdown */}
//         <Dropdown className='mt-2' style={{boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',}}>
//           <Dropdown.Toggle as={CustomToggle} id="dropdown-filters">
//             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//             <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 50 50">
//               <path d="M47.16,21.221l-5.91-0.966c-0.346-1.186-0.819-2.326-1.411-3.405l3.45-4.917c0.279-0.397,0.231-0.938-0.112-1.282 l-3.889-3.887c-0.347-0.346-0.893-0.391-1.291-0.104l-4.843,3.481c-1.089-0.602-2.239-1.08-3.432-1.427l-1.031-5.886 C28.607,2.35,28.192,2,27.706,2h-5.5c-0.49,0-0.908,0.355-0.987,0.839l-0.956,5.854c-1.2,0.345-2.352,0.818-3.437,1.412l-4.83-3.45 c-0.399-0.285-0.942-0.239-1.289,0.106L6.82,10.648c-0.343,0.343-0.391,0.883-0.112,1.28l3.399,4.863 c-0.605,1.095-1.087,2.254-1.438,3.46l-5.831,0.971c-0.482,0.08-0.836,0.498-0.836,0.986v5.5c0,0.485,0.348,0.9,0.825,0.985 l5.831,1.034c0.349,1.203,0.831,2.362,1.438,3.46l-3.441,4.813c-0.284,0.397-0.239,0.942,0.106,1.289l3.888,3.891 c0.343,0.343,0.884,0.391,1.281,0.112l4.87-3.411c1.093,0.601,2.248,1.078,3.445,1.424l0.976,5.861C21.3,47.647,21.717,48,22.206,48 h5.5c0.485,0,0.9-0.348,0.984-0.825l1.045-5.89c1.199-0.353,2.348-0.833,3.43-1.435l4.905,3.441 c0.398,0.281,0.938,0.232,1.282-0.111l3.888-3.891c0.346-0.347,0.391-0.894,0.104-1.292l-3.498-4.857 c0.593-1.08,1.064-2.222,1.407-3.408l5.918-1.039c0.479-0.084,0.827-0.5,0.827-0.985v-5.5C47.999,21.718,47.644,21.3,47.16,21.221z M25,32c-3.866,0-7-3.134-7-7c0-3.866,3.134-7,7-7s7,3.134,7,7C32,28.866,28.866,32,25,32z"></path>
//             </svg>
//               <p className='m-0' style={{ color: 'black' }}>{t('Settings')}</p>
//             </div>
//           </Dropdown.Toggle>
//           <Dropdown.Menu className='mt-1' style={{ 
//             width: '380px',
//             padding: '15px',
//             backgroundColor: 'white',
//             borderRadius: '8px',
//             border: 'none',
//             boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
//           }}>
//             <p className='mb-2 mt-0' style={{ fontSize: '16px', fontWeight: '600' }}>Filters</p>
//             <Form.Control
//               type="text"
//               placeholder={t('Search place...')}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{
//                 marginBottom: '0px',
//                 marginTop: '10px',
//                 padding: '8px 12px',
//                 borderRadius: '6px',
//                 // border: '1px solid #555',
//                 boxShadow: 'none',
//               }}
//             />
//             <p className='mb-2 mt-3' style={{ fontSize: '16px', fontWeight: '600' }}>Categories</p>
//             <div style={{ 
//               display: 'flex',
//               flexWrap: 'wrap',
//               gap: '6px 10px',
//               alignItems: 'center',
//             }}>
//               {categories.map((category) => (
//                 <div key={category.id} style={{ display: 'flex', alignItems: 'center' }}>
//                   <Form.Check
//                     type="checkbox"
//                     id={`category-${category.id}`}
//                     label={category.name}
//                     checked={selectedCategories.includes(category.id)}
//                     onChange={() => toggleCategory(category.id)}
//                   />
//                 </div>
//               ))}
//             </div>
//             <Button
//               variant="secondary"
//               onClick={resetFilters}
//               style={{ marginTop: '10px', width: '100%' }}
//             >
//               {t('Reset Filters')}
//             </Button>
//           </Dropdown.Menu>
//         </Dropdown>

//         {/* City Selection Dropdown
//         <Dropdown className='mt-2'>
//           <Dropdown.Toggle as={CustomToggle} id="dropdown-city">
//             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//             <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48">
//               <path d="M39.5,43h-9c-1.381,0-2.5-1.119-2.5-2.5v-9c0-1.105-0.895-2-2-2h-4c-1.105,0-2,0.895-2,2v9c0,1.381-1.119,2.5-2.5,2.5h-9	C7.119,43,6,41.881,6,40.5V21.413c0-2.299,1.054-4.471,2.859-5.893L23.071,4.321c0.545-0.428,1.313-0.428,1.857,0L39.142,15.52	C40.947,16.942,42,19.113,42,21.411V40.5C42,41.881,40.881,43,39.5,43z"></path>
//             </svg>
//               <p className='m-0' style={{ color: 'black' }}>{selectedCity}</p>
//             </div>
//           </Dropdown.Toggle>
//           <Dropdown.Menu style={{border: "none", boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',}}>
//             {cities.map(city => (
//               <NavDropdown.Item 
//                 key={city.id} 
//                 href={`/MapPage?city=${encodeURIComponent(city.city_name)}`}
//                 onClick={() => {
//                   setSelectedCity(city.city_name);
//                   if (city.latitude && city.longitude) {
//                     setCenter([city.latitude, city.longitude]);
//                     setZoom(13);
//                   }
//                 }}
//               >
//                 {city.city_name}
//               </NavDropdown.Item>
//             ))}
//           </Dropdown.Menu>
//         </Dropdown> */}
//       </div>

//       {/* Top-right buttons */}
//       <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         {/* <Button
//           onClick={() => {
//             window.location.href = 'http://localhost:3000';
//           }}
//           style={{...buttonStyle, color: "black", fontWeight: "600"}}
//         >
//           ✕
//         </Button> */}
//         <Button className='mt-2'
//           onClick={() => {
//             if (showPlacesList) {
//               setIsRightAnimating(true);
//               setTimeout(() => {
//                 setShowPlacesList(false);
//                 setIsRightAnimating(false);
//               }, 300);
//             } else {
//               setShowPlacesList(true);
//               setIsRightAnimating(true);
//             }
//           }}
//           style={buttonStyle}
//         >
//           <img src={showPlacesList ? rightArrowIcon : leftArrowIcon} alt="Toggle List" style={{ width: '20px', height: '20px' }} />
//         </Button>
//       </div>

//       {/* Places list panel (right panel) */}
//       {showPlacesList && (
//         <div className={isRightAnimating && !showPlacesList ? 'slide-out-right' : 'slide-in-right mt-3 px-4 pt-4 pb-1'} style={{
//           position: 'absolute',
//           top: '0',
//           right: '0',
//           width: '500px',
//           height: '94%',
//           backgroundColor: '#fff',
//           borderRadius: '8px',
//           padding: '16px',
//           zIndex: 1000,
//           overflow: 'hidden',
//           boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
//         }}>
//           <Button
//             onClick={() => {
//               setIsRightAnimating(true);
//               setTimeout(() => {
//                 setShowPlacesList(false);
//                 setIsRightAnimating(false);
//               }, 300);
//             }}
//             style={{
//               ...buttonStyle,
//               marginBottom: '16px',
//             }}
//           >
//             <img src={rightArrowIcon} alt="Close" style={{ width: '20px', height: '20px' }} />
//           </Button>
//           <SimpleBar style={{ height: 'calc(100% - 80px)' }}>
//             <h2 style={{
//               fontSize: '24px',
//               fontWeight: 'bold',
//               color: '#000',
//               marginBottom: '4px',
//             }}>
//               {t('Map of')} {selectedCity}
//             </h2>
//             <p style={{
//               fontSize: '14px',
//               color: '#555',
//               marginBottom: '16px',
//             }}>
//               {filteredPlaces.length} {t('places found all over')} {selectedCity}
//             </p>
//             <div style={{
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '16px',
//               fontFamily: "Manrope",
//             }}>
//               {filteredPlaces.map(place => (
//                 <div
//                   key={place.id}
//                   style={{
//                     border: 'none',
//                     backgroundColor: 'white',
//                     borderRadius: '8px',
//                     padding: '8px',
//                     cursor: 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '12px',
//                   }}
//                   onClick={() => handlePlaceClick(place)}
//                 >
//                   <div style={{
//                     width: '140px',
//                     height: '110px',
//                     borderRadius: '6px',
//                     backgroundImage: `url(${getImageUrl(place.photo)})`,
//                     backgroundSize: 'cover',
//                     backgroundPosition: 'center',
//                     backgroundColor: '#F5F6F7',
//                     flexShrink: 0,
//                   }} />
//                   <div style={{ flex: 1 }}>
//                     <p style={{
//                       fontSize: '16px',
//                       fontWeight: 'bold',
//                       color: '#000',
//                       marginBottom: '0px',
//                     }}>
//                       {place.name}
//                     </p>
//                     <p style={{
//                       fontSize: '14px',
//                       color: '#555',
//                       marginBottom: '0px',
//                     }}>
//                       {eventsCount[place.id] > 0 && `${t('Events')}: ${eventsCount[place.id]}  `}
//                       {t('Working hours')}: {place.working_hours || 'Not specified'}  
//                     </p>
//                     <p style={{
//                       fontSize: '14px',
//                       color: '#555',
//                       marginBottom: '4px',
//                     }}>
//                       {eventsCount[place.id] > 0 && `${t('Events')}: ${eventsCount[place.id]}  `}
//                        {t('Location')}: {place.location || 'Not specified'}
//                     </p>
//                     {place.categories?.length > 0 && (
//                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
//                         {place.categories.map(cat => (
//                           <span
//                             key={cat.id}
//                             style={{
//                               fontSize: '14px',
//                               color: '#fff',
//                               borderRadius: '5px',
//                               padding: "3px 8px",
//                               backgroundColor: "rgba(19, 108, 50)"
//                             }}
//                           >
//                             {cat.name}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </SimpleBar>
//         </div>
//       )}

//       {/* Details and Events panel (left panel) */}
//       {showDetailsPanel && selectedPlace && (
//         <div
//           className={`details-panel ${isLeftAnimating && !showDetailsPanel ? "slide-out-left" : "slide-in-left"} px-4 pt-4 pb-0 mt-3`}
//           style={{
//             position: "absolute",
//             top: "0",
//             left: "0",
//             width: "600px",
//             height: "94%",
//             backgroundColor: "#fff",
//             borderRadius: "8px",
//             padding: "16px",
//             zIndex: 1000,
//             overflow: "hidden",
//             boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Button
//             onClick={() => {
//               setIsLeftAnimating(true);
//               setTimeout(() => {
//                 setShowDetailsPanel(false);
//                 setSelectedPlace(null);
//                 setEvents([]);
//                 setIsLeftAnimating(false);
//               }, 300);
//             }}
//             style={{
//               ...buttonStyle,
//               marginBottom: "16px",
//             }}
//           >
//             <img
//               src={leftArrowIcon}
//               alt="Close"
//               style={{ width: "20px", height: "20px" }}
//             />
//           </Button>
//           <SimpleBar style={{ height: "calc(100% - 80px)" }}>
//             <div className='mt-1'
//               style={{
//                 display: "flex",
//                 gap: "16px",
//                 marginBottom: "16px",
//               }}
//             >
//               <div
//                 style={{
//                   width: "240px",
//                   height: "280px",
//                   borderRadius: "8px",
//                   backgroundImage: `url(${getImageUrl(selectedPlace.photo)})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                   backgroundColor: "#F5F6F7",
//                   flexShrink: 0,
//                 }}
//               />
//               <div
//                 style={{
//                   flex: 1,
//                   height: "280px",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <div>
//                   <h2 className='mt-2'
//                     style={{
//                       fontSize: "24px",
//                       fontWeight: "bold",
//                       color: "#000",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     {selectedPlace.name}
//                   </h2>
//                   {selectedPlace.description && (
//                     <p
//                       style={{
//                         fontSize: "14px",
//                         color: "#555",
//                         marginBottom: "8px",
//                         lineHeight: "1.5",
//                       }}
//                     >
//                       {selectedPlace.description.length > 150
//                         ? `${selectedPlace.description.substring(0, 150)}... `
//                         : selectedPlace.description}
//                       {selectedPlace.description.length > 150 && (
//                         <span
//                           style={{
//                             color: "#007bff",
//                             cursor: "pointer",
//                           }}
//                           onClick={() => setShowModal(true)}
//                         >
//                           See more
//                         </span>
//                       )}
//                     </p>
//                   )}
//                   <p
//                     style={{
//                       fontSize: "14px",
//                       color: "#555",
//                       marginBottom: "4px",
//                       display: "flex",
//                       alignItems: "center",
//                     }}
//                   >
//                     <span style={{ marginRight: "4px" }}>Location:</span>
//                     <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.location || "Not specified"}</span>
//                   </p>
//                   <p
//                     style={{
//                       fontSize: "14px",
//                       color: "#555",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     <span style={{ marginRight: "4px" }}>Working Hours:</span>
//                     <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.working_hours || "Not specified"}</span>
//                   </p>
//                 </div>
//                 {selectedPlace.web && (
//                   <Button
//                     onClick={() => window.open(selectedPlace.web, "_blank")}
//                     style={{
//                       backgroundColor: "#136C32",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "6px",
//                       padding: "8px 16px",
//                       fontSize: "14px",
//                       fontWeight: "bold",
//                       width: "100%",
//                     }}
//                   >
//                     Visit Website
//                   </Button>
//                 )}
//               </div>
//             </div>
//             {events.length > 0 && (
//               <div style={{ marginTop: "16px", fontFamily: "Manrope", }}>
//                 {loading ? (
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       padding: "20px",
//                     }}
//                   >
//                     <p>{t("placesMap.loadingEvents")}</p>
//                   </div>
//                 ) : error ? (
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       padding: "20px",
//                       color: "red",
//                     }}
//                   >
//                     <p>
//                       {t("placesMap.errorLoading")} {error}
//                     </p>
//                   </div>
//                 ) : (
//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       gap: "16px",
//                     }}
//                   >
//                     <hr className="mt-4 mb-0" style={{ color: "#555" }} />
//                     {events.map((event) => (
//                       <div key={event.id}>
//                         <div
//                           style={{
//                             display: "flex",
//                             flexDirection: "row",
//                             justifyContent: "space-around",
//                             alignItems: "center",
//                             gap: "12px",
//                             borderRadius: "8px",
//                           }}
//                         >
//                           <div
//                             style={{
//                               width: "120px",
//                               height: "100px",
//                               borderRadius: "6px",
//                               overflow: "hidden",
//                               backgroundColor: "#F5F6F7",
//                               flexShrink: 0,
//                             }}
//                           >
//                             <img
//                               src={getImageUrl(event.image)}
//                               alt={event.name || t("placesMap.eventNamePlaceholder")}
//                               style={{
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                                 objectPosition: "center center",
//                               }}
//                             />
//                           </div>
//                           <div
//                             style={{
//                               display: "flex",
//                               flexDirection: "column",
//                               flex: 1,
//                               gap: "4px",
//                             }}
//                           >
//                             <p className='mb-0'
//                               style={{
//                                 fontSize: "16px",
//                                 fontWeight: "bold",
//                                 color: "#000",
//                                 lineHeight: "1.2",
//                               }}
//                             >
//                               {event.name || t("placesMap.eventNamePlaceholder")}
//                             </p>
//                             <div className='mb-0'
//                               style={{
//                                 display: "flex",
//                                 flexDirection: "row",
//                                 gap: "12px",
//                                 color: "#555",
//                               }}
//                             >
//                               <p className='mb-0' style={{fontSize: "14px",}}>
//                                 {t("Date")}: {formatDate(event.date_time)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <hr className="mb-0" style={{ color: "#555" }} />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </SimpleBar>
//         </div>
//       )}

//       {/* Modal for full place information */}
//       {showModal && selectedPlace && (
//         <Modal 
//           show={showModal}
//           onHide={() => setShowModal(false)}
//           centered
//           size="lg"
//         >
//           <Modal.Header className='m-2' closeButton>
//           </Modal.Header>
//           <Modal.Body className='p-4'> 
//             <div
//               style={{
//                 display: "flex",
//                 gap: "24px",
//                 marginBottom: "24px",
//               }}
//             >
//               <div className='my-2'
//                 style={{
//                   width: "260px",
//                   height: "300px",
//                   borderRadius: "8px",
//                   overflow: "hidden",
//                   backgroundColor: "#F5F6F7",
//                   flexShrink: 0,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <img
//                   src={getImageUrl(selectedPlace.photo)}
//                   alt={selectedPlace.name}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                     objectPosition: "center",
//                   }}
//                 />
//               </div>
//               <div
//                 style={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <div>
//                   <h2
//                     className='mt-2 mb-3'
//                     style={{
//                       fontSize: "28px",
//                       fontWeight: "bold",
//                       color: "#000",
//                     }}
//                   >
//                     {selectedPlace.name}
//                   </h2>
//                   {selectedPlace.description && (
//                     <p
//                       style={{
//                         fontSize: "14px",
//                         color: "#555",
//                         marginBottom: "8px",
//                         lineHeight: "1.5",
//                       }}
//                     >
//                       {selectedPlace.description}
//                     </p>
//                   )}
//                   <p
//                     style={{
//                       fontSize: "14px",
//                       color: "#555",
//                       marginBottom: "4px",
//                       display: "flex",
//                       alignItems: "center",
//                     }}
//                   >
//                     <span style={{ marginRight: "4px" }}>Location:</span>
//                     <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.location || "Not specified"}</span>
//                   </p>
//                   <p
//                     style={{
//                       fontSize: "14px",
//                       color: "#555",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     <span style={{ marginRight: "4px" }}>Working Hours:</span>
//                     <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.working_hours || "Not specified"}</span>
//                   </p>
//                 </div>
//                 {selectedPlace.web && (
//                   <Button
//                     className='mt-4'
//                     onClick={() => window.open(selectedPlace.web, "_blank")}
//                     style={{
//                       backgroundColor: "#136C32",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "6px",
//                       padding: "8px 16px",
//                       fontSize: "14px",
//                       fontWeight: "bold",
//                       width: "100%",
//                     }}
//                   >
//                     Visit Website
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </Modal.Body>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default PlacesMap;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button, Dropdown, Form, NavDropdown, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import axios from 'axios';
import _ from 'lodash';
import { parseConfig } from '../components/parseConfigs.js';
import leftArrowIcon from "../assets/carouselCities/arrows/ArrowLeft.svg";
import rightArrowIcon from "../assets/carouselCities/arrows/ArrowRight.svg";

// Fix for leaflet markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const CLUSTER_RADIUS = 30;
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map && center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};
const clusterIcon = (count) =>
  L.divIcon({
    className: 'cluster-marker',
    html: `<div style="
      width: 40px; 
      height: 40px;
      background:rgb(19, 108, 50);
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      outline: 4px solid rgba(19, 108, 50, 0.3);
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    ">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

const getImageUrl = (photo) => {
  if (!photo) return 'https://via.placeholder.com/100';
  return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
};

const createCustomIcon = (photoUrl, place) => {
  const imageUrl = getImageUrl(photoUrl);
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 50px;
        height: 50px;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 5px rgba(0,0,0,0.3);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${photoUrl ? '#fff' : '#144F7B'};
      ">
        ${photoUrl
          ? `<img src="${imageUrl}" alt="Marker" style="width:100%;height:100%;object-fit:cover;" />`
          : `<span style="color:white;font-weight:bold;">${place?.name?.charAt(0) || '?'}</span>`}
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
};

const MarkerClusters = ({ places, onPlaceClick }) => {
  const map = useMap();
  const [clusters, setClusters] = useState([]);

  const calculateClusters = () => {
    if (!places.length || !map) return [];

    const clusters = [];
    const processed = new Set();

    places.forEach((place, index) => {
      if (processed.has(index)) return;

      const markersInCluster = [place];
      const position = L.latLng(place.latitude, place.longitude);
      const point = map.latLngToLayerPoint(position);

      for (let i = index + 1; i < places.length; i++) {
        if (processed.has(i)) continue;

        const neighborPos = L.latLng(places[i].latitude, places[i].longitude);
        const neighborPoint = map.latLngToLayerPoint(neighborPos);

        if (point.distanceTo(neighborPoint) < CLUSTER_RADIUS) {
          markersInCluster.push(places[i]);
          processed.add(i);
        }
      }

      const avgLat = markersInCluster.reduce((sum, p) => sum + p.latitude, 0) / markersInCluster.length;
      const avgLng = markersInCluster.reduce((sum, p) => sum + p.longitude, 0) / markersInCluster.length;

      clusters.push({
        position: [avgLat, avgLng],
        count: markersInCluster.length,
        places: markersInCluster,
      });
    });

    return clusters;
  };

  const updateClusters = () => {
    const newClusters = calculateClusters();
    setClusters(newClusters);
  };

  useEffect(() => {
    if (!map) return;

    const debounceUpdate = _.debounce(updateClusters, 100);
    map.on('moveend zoomend', debounceUpdate);
    updateClusters();

    return () => {
      map.off('moveend zoomend', debounceUpdate);
    };
  }, [map, places]);

  return clusters.map((cluster, index) => (
    <Marker
      key={`cluster-${index}`}
      position={cluster.position}
      icon={
        cluster.count > 1 
        ? clusterIcon(cluster.count) 
        : createCustomIcon(cluster.places[0].photo, cluster.places[0])
      }
      eventHandlers={{
        click: () => {
          if (cluster.count === 1) {
            onPlaceClick(cluster.places[0]);
          } else {
            map.flyTo(cluster.position, map.getZoom() + 2);
          }
        },
      }}
    >
      {cluster.count > 1 && (
        <Popup>
          <div style={{ maxWidth: 200 }}>
            {cluster.places.map((place) => (
              <div
                key={place.id}
                style={{ margin: '5px 0', cursor: 'pointer' }}
                onClick={() => onPlaceClick(place)}
              >
                {place.name}
              </div>
            ))}
          </div>
        </Popup>
      )}
    </Marker>
  ));
};

// Helper function to format date and time
const formatDate = (dateTimeStr, t) => {
  if (!dateTimeStr) return t("PlacesMap_noDate");
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return t("PlacesMap_invalidDate");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const datePart = `${day}.${month}.${year}`;
    const timePart = (hours !== "00" || minutes !== "00") ? `, ${hours}:${minutes}` : "";
    return datePart + timePart;
  } catch (e) {
    console.error("Error formatting date:", dateTimeStr, e);
    return t("PlacesMap_dateError");
  }
};

// Styles for buttons
const buttonStyle = {
  borderRadius: "100%",
  border: "1px solid rgba(150, 150, 150, 0.6)",
  width: "45px",
  height: "45px",
  backgroundColor: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "box-shadow 0.3s ease, opacity 0.3s ease",
};

const PlacesMap = ({ 
  city = 'Jõhvi', 
  center: initialCenter = [59.35812597130304, 27.41197179331706], 
  zoom: initialZoom = 13,
  onClose
}) => {
  const { t } = useTranslation();
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [mapFilteredPlaces, setMapFilteredPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(city);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlacesList, setShowPlacesList] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsCount, setEventsCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [cityData, setCityData] = useState(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [isLeftAnimating, setIsLeftAnimating] = useState(false);
  const [isRightAnimating, setIsRightAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal
  const today = new Date();
  const thisWeekEnd = new Date(today);
  thisWeekEnd.setDate(today.getDate() + 7);
  const thisMonthEnd = new Date(today);
  thisMonthEnd.setMonth(today.getMonth() + 1);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cities');
        setCities(response.data);
      } catch (error) {
        console.error(t('PlacesMap_errorLoadingCities'), error);
        setCities([]);
      }
    };

    const fetchCityData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cities');
        const cities = response.data;
        console.log('Cities from server:', cities);
        const currentCity = cities.find(c => c.city_name.toLowerCase() === selectedCity.toLowerCase());
        console.log('Selected city data:', currentCity);
        if (currentCity) {
          setCityData(currentCity);
          if (currentCity.latitude && currentCity.longitude) {
            setCenter([currentCity.latitude, currentCity.longitude]);
            console.log('New center:', [currentCity.latitude, currentCity.longitude]);
            setZoom(13);
          }
        } else {
          console.warn(`City ${selectedCity} not found in database`);
          setCenter(initialCenter);
          setZoom(initialZoom);
        }
      } catch (error) {
        console.error(t('PlacesMap_errorLoadingCity'), error);
        setCenter(initialCenter);
        setZoom(initialZoom);
      }
    };

        const fetchPlaces = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/places`);
        const normalizedCity = selectedCity.toLowerCase();
        const cityPlaces = response.data.filter(
          place => place.cityData && place.cityData.city_name.toLowerCase() === normalizedCity
        );
        setPlaces(cityPlaces);
        setFilteredPlaces(cityPlaces);
        setMapFilteredPlaces(cityPlaces);
        setMapReady(true);

        const counts = {};
        for (const place of cityPlaces) {
          try {
            const eventsResponse = await axios.get(`http://localhost:5000/events`, {
              params: { place_id: place.id, limit: 50 },
            });
            const eventsData = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
            counts[place.id] = eventsData.length;
          } catch (error) {
            counts[place.id] = 0;
          }
        }
        setEventsCount(counts);
      } catch (error) {
        console.error(t('placesMap.errorLoadingPlaces'), error);
        setPlaces([]);
        setFilteredPlaces([]);
        setMapFilteredPlaces([]);
        setEventsCount({});
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories');
        setCategories(response.data);
      } catch (error) {
        console.error(t('PlacesMap_errorLoadingCategories'), error);
        setCategories([]);
      }
    };

    fetchCities();
    fetchCityData();
    fetchPlaces();
    fetchCategories();
  }, [selectedCity, t]);

  useEffect(() => {
    let filtered = places;
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(place => 
        place.categories?.some(cat => selectedCategories.includes(cat.id)));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(query) || 
        place.location?.toLowerCase().includes(query));
    }

    setFilteredPlaces(filtered);

    let mapFiltered = filtered;
    if (eventFilter === 'withEvents') {
      mapFiltered = filtered.filter(place => eventsCount[place.id] > 0);
    } else if (eventFilter !== 'all') {
      mapFiltered = mapFiltered.filter(place => {
        return eventsCount[place.id] > 0;
      }).filter(async place => {
        const eventsResponse = await axios.get(`http://localhost:5000/events`, {
          params: { place_id: place.id, limit: 50 },
        });
        const eventsData = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
        return eventsData.some(event => {
          const eventDate = new Date(event.date);
          if (eventFilter === 'today') {
            return eventDate.toDateString() === today.toDateString();
          } else if (eventFilter === 'thisWeek') {
            return eventDate >= today && eventDate <= thisWeekEnd;
          } else if (eventFilter === 'thisMonth') {
            return eventDate >= today && eventDate <= thisMonthEnd;
          }
          return true;
        });
      });
    }
    
    setMapFilteredPlaces(mapFiltered);
  }, [places, selectedCategories, searchQuery, eventFilter, eventsCount]);

  const fetchEvents = async (placeId) => {
    setLoading(true);
    try {
      let response;
      let eventsData = [];

      if (selectedPlace?.name === 'FC Phoenix' && selectedPlace.web) {
        const webUrl = selectedPlace.web;
        if (!webUrl || typeof webUrl !== 'string') {
          throw new Error(t('PlacesMap_invalidUrl'));
        }

        let parsedUrl;
        try {
          parsedUrl = new URL(webUrl);
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error(t('PlacesMap_invalidProtocol'));
          }
        } catch (e) {
          throw new Error(t('PlacesMap_urlParsingError'));
        }

        const siteConfig = parseConfig[parsedUrl.origin];
        if (!siteConfig) {
          throw new Error(t('PlacesMap_configNotFound'));
        }

        response = await axios.post(
          'http://localhost:5000/places/parse-events',
          {
            url: webUrl,
            config: siteConfig,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        if (!response.data || typeof response.data !== 'object' || !('events' in response.data) || !Array.isArray(response.data.events)) {
          throw new Error(t('PlacesMap_noEventsInResponse'));
        }

        eventsData = response.data.events;
      } else {
        response = await axios.get(`http://localhost:5000/events`, {
          params: {
            place_id: placeId,
            limit: 50, // Fetch all events
          },
        });

        if (Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (response.data && typeof response.data === 'object' && 'events' in response.data && Array.isArray(response.data.events)) {
          eventsData = response.data.events;
        } else {
          throw new Error(t('PlacesMap_noEventsInResponse'));
        }
      }

      eventsData = eventsData.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });

      setEvents(eventsData);
      setError(null);
    } catch (error) {
      console.error(t('PlacesMap_eventsLoadError'), error);
      setError(error.response?.data?.message || error.message || t('PlacesMap_unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setShowDetailsPanel(true);
    setIsLeftAnimating(true);
    fetchEvents(place.id);
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setEventFilter('all');
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{
        cursor: 'pointer',
        borderRadius: '8px',
        border: '1px solid #DEE2E6',
        backgroundColor: 'white',
        color: '#4F4F4F',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px',
        outline: 'none',
      }}
    >
      {children}
    </button>
  ));

  return (
    <div style={{ position: 'relative', width: '100%', height: '90.5vh' }}>
      <style>
        {`
          @keyframes slideInFromLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutToLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
          }
          @keyframes slideInFromRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutToRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
          .slide-in-left {
            animation: slideInFromLeft 0.3s ease-out forwards;
          }
          .slide-out-left {
            animation: slideOutToLeft 0.3s ease-out forwards;
          }
          .slide-in-right {
            animation: slideInFromRight 0.3s ease-out forwards;
          }
          .slide-out-right {
            animation: slideOutToRight 0.3s ease-out forwards;
          }
          .details-panel {
            transition: width 0.3s ease-out;
          }
          .truncate-3-5-lines {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 5em;
          }
          .category-button {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            margin-right: 8px;
            border: 1px solid #ccc;
            border-radius: 12px;
            background-color: #fff;
            font-size: 12px;
            color: #333;
          }
          .category-button img {
            margin-right: 4px;
            width: 16px;
            height: 16px;
          }
        `}
      </style>
          
      {mapReady && (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
          maxBounds={cityData ? [
            [cityData.latitude - 0.1, cityData.longitude - 0.1],
            [cityData.latitude + 0.1, cityData.longitude + 0.1],
          ] : [
            [59.1, 26.9],
            [59.5, 28.2],
          ]}
          maxBoundsViscosity={1}
          minZoom={12}
          maxZoom={17}
          zoomControl={false}
        >
          <MapUpdater center={center} zoom={zoom} />
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          />
          <MarkerClusters 
            places={mapFilteredPlaces} 
            onPlaceClick={handlePlaceClick} 
          />
        </MapContainer>
      )}

      {/* Top-left filter and city dropdowns */}
      <div style={{ 
        position: 'absolute', 
        top: '8px', 
        left: showDetailsPanel ? '620px' : '10px', 
        zIndex: 1000,
        transition: 'left 0.3s ease-out',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}>
        {/* Settings Dropdown */}
        <Dropdown className='mt-2' style={{boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',}}>
          <Dropdown.Toggle as={CustomToggle} id="dropdown-filters">
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 50 50">
              <path d="M47.16,21.221l-5.91-0.966c-0.346-1.186-0.819-2.326-1.411-3.405l3.45-4.917c0.279-0.397,0.231-0.938-0.112-1.282 l-3.889-3.887c-0.347-0.346-0.893-0.391-1.291-0.104l-4.843,3.481c-1.089-0.602-2.239-1.08-3.432-1.427l-1.031-5.886 C28.607,2.35,28.192,2,27.706,2h-5.5c-0.49,0-0.908,0.355-0.987,0.839l-0.956,5.854c-1.2,0.345-2.352,0.818-3.437,1.412l-4.83-3.45 c-0.399-0.285-0.942-0.239-1.289,0.106L6.82,10.648c-0.343,0.343-0.391,0.883-0.112,1.28l3.399,4.863 c-0.605,1.095-1.087,2.254-1.438,3.46l-5.831,0.971c-0.482,0.08-0.836,0.498-0.836,0.986v5.5c0,0.485,0.348,0.9,0.825,0.985 l5.831,1.034c0.349,1.203,0.831,2.362,1.438,3.46l-3.441,4.813c-0.284,0.397-0.239,0.942,0.106,1.289l3.888,3.891 c0.343,0.343,0.884,0.391,1.281,0.112l4.87-3.411c1.093,0.601,2.248,1.078,3.445,1.424l0.976,5.861C21.3,47.647,21.717,48,22.206,48 h5.5c0.485,0,0.9-0.348,0.984-0.825l1.045-5.89c1.199-0.353,2.348-0.833,3.43-1.435l4.905,3.441 c0.398,0.281,0.938,0.232,1.282-0.111l3.888-3.891c0.346-0.347,0.391-0.894,0.104-1.292l-3.498-4.857 c0.593-1.08,1.064-2.222,1.407-3.408l5.918-1.039c0.479-0.084,0.827-0.5,0.827-0.985v-5.5C47.999,21.718,47.644,21.3,47.16,21.221z M25,32c-3.866,0-7-3.134-7-7c0-3.866,3.134-7,7-7s7,3.134,7,7C32,28.866,28.866,32,25,32z"></path>
             </svg>
              <p className='m-0' style={{ color: 'black' }}>{t('PlacesMap_Settings')}</p>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu className='mt-1' style={{ 
            width: '380px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          }}>
            <p className='mb-2 mt-0' style={{ fontSize: '16px', fontWeight: '600' }}>{t('PlacesMap_Filters')}</p>
            <Form.Control
              type="text"
              placeholder={t('PlacesMap_SearchPlace')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                marginBottom: '0px',
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                boxShadow: 'none',
              }}
            />
            <p className='mb-2 mt-3' style={{ fontSize: '16px', fontWeight: '600' }}>{t('PlacesMap_Categories')}</p>
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 10px',
              alignItems: 'center',
            }}>
              {categories.map((category) => (
                <div key={category.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <Form.Check
                    type="checkbox"
                    id={`category-${category.id}`}
                    label={category.name}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              onClick={resetFilters}
              style={{ marginTop: '10px', width: '100%' }}
            >
              {t('PlacesMap_ResetFilters')}
            </Button>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Top-right buttons */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Button className='mt-2'
          onClick={() => {
            if (showPlacesList) {
              setIsRightAnimating(true);
              setTimeout(() => {
                setShowPlacesList(false);
                setIsRightAnimating(false);
              }, 300);
            } else {
              setShowPlacesList(true);
              setIsRightAnimating(true);
            }
          }}
          style={buttonStyle}
        >
          <img src={showPlacesList ? rightArrowIcon : leftArrowIcon} alt="Toggle List" style={{ width: '20px', height: '20px' }} />
        </Button>
      </div>

      {/* Places list panel (right panel) */}
      {showPlacesList && (
        <div className={isRightAnimating && !showPlacesList ? 'slide-out-right' : 'slide-in-right mt-3 px-4 pt-4 pb-1'} style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '500px',
          height: '94%',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '16px',
          zIndex: 1000,
          overflow: 'hidden',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        }}>
          <Button
            onClick={() => {
              setIsRightAnimating(true);
              setTimeout(() => {
                setShowPlacesList(false);
                setIsRightAnimating(false);
              }, 300);
            }}
            style={{
              ...buttonStyle,
              marginBottom: '16px',
            }}
          >
            <img src={rightArrowIcon} alt="Close" style={{ width: '20px', height: '20px' }} />
          </Button>
          <SimpleBar style={{ height: 'calc(100% - 80px)' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '4px',
            }}>
              {t('PlacesMap_MapOf')} {selectedCity}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#555',
              marginBottom: '16px',
            }}>
              {filteredPlaces.length} {t('PlacesMap_PlacesFound')} {selectedCity}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              fontFamily: "Manrope",
            }}>
              {filteredPlaces.map(place => (
                <div
                  key={place.id}
                  style={{
                    border: 'none',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onClick={() => handlePlaceClick(place)}
                >
                  <div style={{
                    width: '140px',
                    height: '110px',
                    borderRadius: '6px',
                    backgroundImage: `url(${getImageUrl(place.photo)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#F5F6F7',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#000',
                      marginBottom: '0px',
                    }}>
                      {place.name}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#555',
                      marginBottom: '0px',
                    }}>
                      {eventsCount[place.id] > 0 && `${t('PlacesMap_Events')}: ${eventsCount[place.id]}  `}
                      {t('PlacesMap_WorkingHours')}: {place.working_hours || 'Not specified'}  
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#555',
                      marginBottom: '4px',
                    }}>
                      {eventsCount[place.id] > 0 && `${t('PlacesMap_Events')}: ${eventsCount[place.id]}  `}
                      {t('PlacesMap_Location')}: {place.location || 'Not specified'}
                    </p>
                    {place.categories?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {place.categories.map(cat => (
                          <span
                            key={cat.id}
                            style={{
                              fontSize: '14px',
                              color: '#fff',
                              borderRadius: '5px',
                              padding: "3px 8px",
                              backgroundColor: "rgba(19, 108, 50)"
                            }}
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SimpleBar>
        </div>
      )}

      {/* Details and Events panel (left panel) */}
      {showDetailsPanel && selectedPlace && (
        <div
          className={`details-panel ${isLeftAnimating && !showDetailsPanel ? "slide-out-left" : "slide-in-left"} px-4 pt-4 pb-0 mt-3`}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "600px",
            height: "94%",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "16px",
            zIndex: 1000,
            overflow: "hidden",
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            onClick={() => {
              setIsLeftAnimating(true);
              setTimeout(() => {
                setShowDetailsPanel(false);
                setSelectedPlace(null);
                setEvents([]);
                setIsLeftAnimating(false);
              }, 300);
            }}
            style={{
              ...buttonStyle,
              marginBottom: "16px",
            }}
          >
            <img
              src={leftArrowIcon}
              alt="Close"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
          <SimpleBar style={{ height: "calc(100% - 80px)" }}>
            <div className='mt-1'
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "240px",
                  height: "280px",
                  borderRadius: "8px",
                  backgroundImage: `url(${getImageUrl(selectedPlace.photo)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "#F5F6F7",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: "280px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2 className='mt-2'
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#000",
                      marginBottom: "8px",
                    }}
                  >
                    {selectedPlace.name}
                  </h2>
                  {selectedPlace.description && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555",
                        marginBottom: "8px",
                        lineHeight: "1.5",
                      }}
                    >
                      {selectedPlace.description.length > 150
                        ? `${selectedPlace.description.substring(0, 150)}... `
                        : selectedPlace.description}
                      {selectedPlace.description.length > 150 && (
                        <span
                          style={{
                            color: "#007bff",
                            cursor: "pointer",
                          }}
                          onClick={() => setShowModal(true)}
                        >
                          {t('PlacesMap_SeeMore')}
                        </span>
                      )}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "4px" }}>{t('PlacesMap_LocationLabel')}</span>
                    <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.location || "Not specified"}</span>
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ marginRight: "4px" }}>{t('PlacesMap_WorkingHoursLabel')}</span>
                    <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.working_hours || "Not specified"}</span>
                  </p>
                </div>
                {selectedPlace.web && (
                  <Button
                    onClick={() => window.open(selectedPlace.web, "_blank")}
                    style={{
                      backgroundColor: "#136C32",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      width: "100%",
                    }}
                  >
                    {t('PlacesMap_VisitWebsite')}
                  </Button>
                )}
              </div>
            </div>
            {events.length > 0 && (
              <div style={{ marginTop: "16px", fontFamily: "Manrope", }}>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "20px",
                    }}
                  >
                    <p>{t("PlacesMap_loadingEvents")}</p>
                  </div>
                ) : error ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "20px",
                      color: "red",
                    }}
                  >
                    <p>
                      {t("PlacesMap_errorLoading")} {error}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <hr className="mt-4 mb-0" style={{ color: "#555" }} />
                    {events.map((event) => (
                      <div key={event.id}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-around",
                            alignItems: "center",
                            gap: "12px",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "120px",
                              height: "100px",
                              borderRadius: "6px",
                              overflow: "hidden",
                              backgroundColor: "#F5F6F7",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={getImageUrl(event.image)}
                              alt={event.name || t("PlacesMap_eventNamePlaceholder")}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center center",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                              gap: "4px",
                            }}
                          >
                            <p className='mb-0'
                              style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "#000",
                                lineHeight: "1.2",
                              }}
                            >
                              {event.name || t("PlacesMap_eventNamePlaceholder")}
                            </p>
                            <div className='mb-0'
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "12px",
                                color: "#555",
                              }}
                            >
                              <p className='mb-0' style={{fontSize: "14px",}}>
                                {t("PlacesMap_Date")}: {formatDate(event.date_time, t)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <hr className="mb-0" style={{ color: "#555" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </SimpleBar>
        </div>
      )}

      {/* Modal for full place information */}
      {showModal && selectedPlace && (
        <Modal 
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="lg"
        >
          <Modal.Header className='m-2' closeButton>
          </Modal.Header>
          <Modal.Body className='p-4'> 
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div className='my-2'
                style={{
                  width: "260px",
                  height: "300px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#F5F6F7",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={getImageUrl(selectedPlace.photo)}
                  alt={selectedPlace.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2
                    className='mt-2 mb-3'
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {selectedPlace.name}
                  </h2>
                  {selectedPlace.description && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555",
                        marginBottom: "8px",
                        lineHeight: "1.5",
                      }}
                    >
                      {selectedPlace.description}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "4px" }}>{t('PlacesMap_LocationLabel')}</span>
                    <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.location || "Not specified"}</span>
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ marginRight: "4px" }}>{t('PlacesMap_WorkingHoursLabel')}</span>
                    <span style={{ color: "#000", fontWeight: "500"}}>{selectedPlace.working_hours || "Not specified"}</span>
                  </p>
                </div>
                {selectedPlace.web && (
                  <Button
                    className='mt-4'
                    onClick={() => window.open(selectedPlace.web, "_blank")}
                    style={{
                      backgroundColor: "#136C32",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      width: "100%",
                    }}
                  >
                    {t('PlacesMap_VisitWebsite')}
                  </Button>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default PlacesMap;