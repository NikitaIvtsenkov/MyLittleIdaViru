// import React from 'react'
// import BannerBoxCities from '../components/BannerBoxCities';
// import Carousel from '../components/Carousel';
// import EventConcert from '../components/CarouselConcert';
// import EventCinema from '../components/CarouselCinema';
// import EventSport from '../components/CarouselSport';
// import homeImage from "../assets/main/HomeImage.jpg";

// function Home() {
//     return (
//         <div className="page-container">
//             <BannerBoxCities
//                   title="Ida-Viru is a Land of Contrasts, Beautiful and Endless stories"
//                   description="Get inspired for adventures in Estonia! Discover charming cities and stunning nature. Explore the top places to see and things to do in Ida-Viru!"
//                   image={homeImage}
//                   className="full-width"
//                 />
//             <div className="main-container">
                
//                 {/* <Carousel/> */}
                
//                 {/* Примеры использования нового компонента */}
//                 <EventConcert placeIds={[1, 50]} placeName="Concerts and Performances"></EventConcert>
//                 <EventCinema placeIds={[2, 51]} placeName="Cinema"></EventCinema>
//                 {/* <EventSport placeName="Cinema"></EventSport> */}
//             </div>
//        </div>
//     );
// }

// export default Home;
import React from 'react';
import { useTranslation } from 'react-i18next';
import BannerBoxCities from '../components/BannerBoxCities';
import EventConcert from '../components/CarouselConcert';
import EventCinema from '../components/CarouselCinema';
import homeImage from "../assets/main/HomeImage.jpg";

function Home() {
    const { t } = useTranslation();

    return (
        <div className="page-container">
            <BannerBoxCities
                title={t("home.bannerTitle")}
                description={t("home.bannerDescription")}
                image={homeImage}
                className="full-width"
            />
            <div className="main-container">
                <EventConcert placeIds={[1, 50]} placeName={t("home.concertsTitle")} />
                <EventCinema placeIds={[2, 51]} placeName={t("home.cinemaTitle")} />
            </div>
        </div>
    );
}

export default Home;
