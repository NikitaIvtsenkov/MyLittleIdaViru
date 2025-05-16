import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import leftArrowIcon from "../assets/carouselCities/arrows/ArrowLeft.svg";
import rightArrowIcon from "../assets/carouselCities/arrows/ArrowRight.svg";

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

// Styles for match cards
const cardStyle = {
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  aspectRatio: "1 / 1.45",
  color: "white",
  fontFamily: "Manrope",
  textShadow: "0 2px 2px rgba(0, 0, 0, 0.2)",
  backgroundColor: "#f0f0f0",
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

function CarouselSport({ placeName }) {
  const sliderRef = useRef(null);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:3000/api/parse-football-matches");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const parsedMatches = data.matches;

        if (parsedMatches.length === 0) {
          setError("No upcoming matches found");
        }

        setMatches(parsedMatches);
        setIsStart(true);
        setIsEnd(parsedMatches.length <= 5);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(err.message || "Failed to load matches. Please try again later.");
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const settings = {
    dots: false,
    infinite: false,
    speed: 800,
    slidesToShow: 5,
    slidesToScroll: 5,
    arrows: false,
    afterChange: (current) => {
      setIsStart(current === 0);
      setIsEnd(current >= matches.length - 5);
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
          <p>Загрузка матчей...</p>
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

  if (matches.length === 0) {
    return (
      <div className="relative px-5 my-4">
        <div className="flex justify-center items-center h-64">
          Нет предстоящих матчей
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
          {matches.map((match, index) => (
            <div key={index} className="h-[450px] p-1">
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px",
                  overflow: "hidden",
                }}
                className="rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow duration-300"
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                  <img
                    src={match.homeLogo}
                    alt={match.homeTeam}
                    style={{ width: "50px", height: "50px", objectFit: "contain" }}
                  />
                  <img
                    src={match.awayLogo}
                    alt={match.awayTeam}
                    style={{ width: "50px", height: "50px", objectFit: "contain" }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: "Manrope",
                    fontSize: "14px",
                    color: "#000",
                    textAlign: "center",
                    margin: "5px 0",
                  }}
                >
                  {match.displayDateTime.split(' ')[0]} {match.displayDateTime.split(' ')[1]}
                </p>
                <p
                  style={{
                    fontFamily: "Manrope",
                    fontSize: "14px",
                    color: "#000",
                    textAlign: "center",
                    margin: "5px 0",
                  }}
                >
                  {match.displayDateTime.split(' ')[2]}
                </p>
                <p
                  style={{
                    fontFamily: "Manrope",
                    fontSize: "14px",
                    color: "#000",
                    textAlign: "center",
                    margin: "5px 0",
                  }}
                >
                  {match.homeTeam} vs {match.awayTeam}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default CarouselSport;