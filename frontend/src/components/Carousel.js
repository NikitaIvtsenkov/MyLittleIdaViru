import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import leftArrowIcon from "../assets/carouselCities/arrows/ArrowLeft.svg";
import rightArrowIcon from "../assets/carouselCities/arrows/ArrowRight.svg";
import axios from "axios";

const getPhotoUrl = (photo) => {
  if (!photo) return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/495px-No-Image-Placeholder.svg.png?20200912122019";
  
  if (photo.startsWith('http')) return photo;
  
  if (photo.startsWith('/assets')) {
    return `http://localhost:5000${photo}`;
  }
  
  return photo;
};

const getIconUrl = (icon) => {
  if (!icon) return 'https://via.placeholder.com/16';
  
  if (icon.startsWith('http')) return icon;
  
  if (icon.startsWith('/assets')) {
    return `http://localhost:5000${icon}`;
  }
  
  return icon;
};

const buttonStyle = {
  borderRadius: "100%",
  border: "1px solid black",
  width: "45px",
  height: "45px",
  backgroundColor: "#F9F9F9",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 0 0 10px",
  padding: 0,
};

const cardStyle = {
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  aspectRatio: "1 / 1",
  color: "white",
  fontFamily: "Manrope",
  textShadow: "0 2px 2px rgba(0, 0, 0, 0.2)",
};

const textStyle = {
  fontFamily: "Manrope",
  fontSize: "20px",
  lineHeight: "1.2",
  fontWeight: "bold",
};

const CustomArrows = ({ next, prev, isStart, isEnd }) => {
  return (
    <div style={{ display: "flex", marginLeft: "auto" }}>
      <button
        style={{ 
          ...buttonStyle,
        }}
        onClick={prev}
      >
        <img src={leftArrowIcon} alt="Previous" style={{ width: "20px", height: "20px" }} />
      </button>
      <button
        style={{ 
          ...buttonStyle,
        }}
        onClick={next}
      >
        <img src={rightArrowIcon} alt="Next" style={{ width: "20px", height: "20px" }} />
      </button>
    </div>
  );
};

function Carousel({ city }) {
  const sliderRef = useRef(null);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем все категории один раз
        const categoriesResponse = await axios.get('http://localhost:5000/categories');
        setAllCategories(categoriesResponse.data);

        // Получаем места
        const response = await axios.get('http://localhost:5000/places');
        const data = response.data;

        // Если передан город — фильтруем
        if (city && city.trim() !== "") {
          const normalize = (str) => str?.toLowerCase().trim();
          const normalizedCity = normalize(city);

          const filtered = data.filter(
            (place) => place.cityData && normalize(place.cityData.city_name) === normalizedCity
          );

          setPlaces(filtered);
          setIsStart(true);
          setIsEnd(filtered.length <= 3);
        } else {
          // Если город не передан — показываем всё
          setPlaces(data);
          setIsStart(true);
          setIsEnd(data.length <= 3);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    afterChange: (current) => {
      setIsStart(current === 0);
      setIsEnd(current >= places.length - 3);
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const next = () => {
    sliderRef.current?.slickNext();
  };

  const prev = () => {
    sliderRef.current?.slickPrev();
  };

  // Функция для получения полных данных категории по ID
  const getCategoryData = (categoryId) => {
    return allCategories.find(cat => cat.id === categoryId) || {};
  };

  if (loading) {
    return (
      <div className="relative px-5 my-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading places in {city || "all cities"}...</p>
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

  if (places.length === 0) {
    return (
      <div className="relative px-5 my-4">
        <div className="flex justify-center items-center h-64">
          No places found in {city || "all cities"}
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-4 my-5">
      <div className="relative">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div className="mb-2 p-1" style={{ marginLeft: "auto" }}>
            <CustomArrows
              next={next}
              prev={prev}
              isStart={isStart}
              isEnd={isEnd}
            />
          </div>
        </div>
        <Slider ref={sliderRef} {...settings}>
          {places.map((place) => (
            <div key={place.id} className="h-[450px] p-1">
              <div
                style={{
                  ...cardStyle,
                  backgroundImage: `url(${getPhotoUrl(place.photo)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                }}
                className="rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Нижний градиент */}
                <div
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
                    padding: "16px",
                    borderBottomLeftRadius: "20px",
                    borderBottomRightRadius: "20px",
                  }}
                >
                  <div className="my-2 mx-1">
                    <p style={{ ...textStyle, marginBottom: "10px", color: "white" }}>
                      {place.name}
                    </p>

                    {place.categories?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {place.categories.map((cat) => {
                          const fullCategory = getCategoryData(cat.id);
                          return (
                            <span
                              key={cat.id}
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                color: "white",
                                borderRadius: "12px",
                                padding: "6px 18px 6px 16px",
                                fontSize: "14px",
                                fontWeight: "normal",
                                display: "flex",
                                alignItems: "center",
                                backdropFilter: "blur(5px)",
                              }}
                            >
                              {fullCategory.icon && (
                                <img
                                  src={getIconUrl(fullCategory.icon)}
                                  alt={fullCategory.name}
                                  style={{
                                    width: "15px",
                                    height: "15px",
                                    marginRight: "5px",
                                    filter: "brightness(0) invert(1)",
                                  }}
                                  onError={(e) => {
                                    console.error(`Failed to load icon for category ${fullCategory.name}: ${getIconUrl(fullCategory.icon)}`);
                                    e.target.src = 'https://via.placeholder.com/16';
                                    e.target.style.filter = "brightness(0) invert(1)";
                                  }}
                                />
                              )}
                              {fullCategory.name || cat.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default Carousel;