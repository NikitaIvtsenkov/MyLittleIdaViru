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
