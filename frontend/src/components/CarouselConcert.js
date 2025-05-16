import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import leftArrowIcon from "../assets/carouselCities/arrows/ArrowLeft.svg";
import rightArrowIcon from "../assets/carouselCities/arrows/ArrowRight.svg";
import axios from "axios";

// Helper function to get the correct photo URL
const getPhotoUrl = (photo) => {
  if (!photo) return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/495px-No-Image-Placeholder.svg.png?20200912122019";
  
  if (photo.startsWith("http")) return photo;
  
  if (photo.startsWith("/assets")) {
    return `http://localhost:5000${photo}`;
  }
  
  return photo;
};

// Helper function to format date (only date, no time)
const formatDate = (dateTimeStr) => {
  if (!dateTimeStr) {
    return "Нет даты";
  }

  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
      return "Неверная дата";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch (e) {
    console.error("Error formatting date:", dateTimeStr, e);
    return "Ошибка даты";
  }
};

// Styles for buttons
const buttonStyle = {
  borderRadius: "100%",
  border: "1px solid rgba(150, 150, 150, 0.6)",
  width: "45px",
  height: "45px",
  backgroundColor: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 0 0 10px",
  padding: 0,
  transition: "box-shadow 0.3s ease, opacity 0.3s ease",
};

// Styles for event cards
const cardStyle = {
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  aspectRatio: "1 / 1.45",
  color: "white",
  fontFamily: "Manrope",
  textShadow: "0 2px 2px rgba(0, 0, 0, 0.2)",
};

// Custom arrows for the carousel
const CustomArrows = ({ next, prev, isStart, isEnd }) => {
  return (
    <div style={{ display: "flex", marginLeft: "auto" }}>
      <button
        style={{
          ...buttonStyle,
          opacity: isStart ? 0.4 : 1,
          cursor: isStart ? "not-allowed" : "pointer",
        }}
        onClick={prev}
        disabled={isStart}
        onMouseEnter={(e) => {
          if (!isStart) {
            e.currentTarget.style.boxShadow = "inset 0 0 8px rgba(150, 150, 150, 0.35)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <img src={leftArrowIcon} alt="Previous" style={{ width: "20px", height: "20px" }} />
      </button>
      <button
        style={{
          ...buttonStyle,
          opacity: isEnd ? 0.4 : 1,
          cursor: isEnd ? "not-allowed" : "pointer",
        }}
        onClick={next}
        disabled={isEnd}
        onMouseEnter={(e) => {
          if (!isEnd) {
            e.currentTarget.style.boxShadow = "inset 0 0 8px rgba(150, 150, 150, 0.35)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <img src={rightArrowIcon} alt="Next" style={{ width: "20px", height: "20px" }} />
      </button>
    </div>
  );
};

function EventConcert({ placeIds, placeName }) {
  const sliderRef = useRef(null);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const eventPromises = placeIds.map((id) =>
          axios.get("http://localhost:5000/events", {
            params: { place_id: id, offset: 0, limit: 50 },
          })
        );
        const eventResponses = await Promise.all(eventPromises);
        const allEvents = eventResponses.flatMap((res) => res.data.events || []);

        const placesResponse = await axios.get("http://localhost:5000/places");

        const placesMap = placesResponse.data.reduce((acc, place) => {
          acc[place.id] = place;
          return acc;
        }, {});

        setPlaces(placesMap);

        const now = new Date();
        let filteredEvents = allEvents.filter((event) => {
          const eventDate = event.date_time ? new Date(event.date_time) : null;
          if (!eventDate || isNaN(eventDate.getTime())) {
            console.warn(`Skipping event with invalid date_time: ${event.name}, DateTime: ${event.date_time}`);
            return false; // Skip events with invalid date_time
          }
          const isFuture = eventDate >= now;
          console.log(
            `Event: ${event.name}, URL: ${event.url}, DateTime: ${event.date_time}, Parsed: ${eventDate.toISOString()}, Now: ${now.toISOString()}, IsFuture: ${isFuture}`
          );
          return isFuture;
        });

        filteredEvents = filteredEvents.sort((a, b) => {
          const dateA = a.date_time ? new Date(a.date_time) : new Date(0);
          const dateB = b.date_time ? new Date(b.date_time) : new Date(0);
          return dateA - dateB;
        });

        setEvents(filteredEvents);
        setIsStart(true);
        setIsEnd(filteredEvents.length <= 5);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load data");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (placeIds && placeIds.length > 0) {
      fetchData();
    } else {
      setLoading(false);
      setError("No place IDs provided");
    }
  }, [placeIds]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 800,
    slidesToShow: 5,
    slidesToScroll: 5,
    arrows: false,
    afterChange: (current) => {
      setIsStart(current === 0);
      setIsEnd(current >= events.length - 5);
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const next = () => {
    sliderRef.current?.slickNext();
  };

  const prev = () => {
    sliderRef.current?.slickPrev();
  };

  if (loading) {
    return (
      <div className="relative px-5 my-4">
        <div className="flex justify-center items-center h-64">
          <p>Загрузка событий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative px-5 my-4">
        <div className="flex justify-center items-center h-64 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="relative px-5 my-4">
        <div className="flex justify-center items-center h-64">
          Нет предстоящих событий для выбранных мест
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-4 my-5">
      <div className="relative">
        <div
          className="mb-2"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <h2 style={{ fontFamily: "Manrope", fontSize: "32px", fontWeight: "bold" }}>
            {placeName}
          </h2>
          <div>
            <CustomArrows next={next} prev={prev} isStart={isStart} isEnd={isEnd} />
          </div>
        </div>
        <Slider ref={sliderRef} {...settings}>
          {events.map((event) => {
            const place = places[event.placeId];
            const city = event.place?.cityData; // Исправлено: доступ к городу через place.cityData

            return (
              <div key={event.id} className="h-[450px] p-1">
                <div
                  style={{
                    ...cardStyle,
                    backgroundImage: `url(${getPhotoUrl(event.image)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    overflow: "hidden",
                  }}
                  className="rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Пустой div для изображения */}
                </div>
                <div className="mt-3">
                  <h3 style={{ fontFamily: "Manrope", fontSize: "18px", fontWeight: "600" }}>
                    {event.name}
                  </h3>
                  <p
                    className="mb-1"
                    style={{
                      fontFamily: "Manrope",
                      fontSize: "14px",
                      color: "#555",
                    }}
                  >
                    {formatDate(event.date_time)}
                  </p>
                  <p
                    className="mb-1"
                    style={{
                      fontFamily: "Manrope",
                      fontSize: "14px",
                      color: "#555",
                    }}
                  >
                    {city?.city_name}
                    {place?.name && `, ${place.name}`}
                  </p>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}

export default EventConcert;