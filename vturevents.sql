-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 02 2025 г., 23:54
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `vturevents`
--

-- --------------------------------------------------------

--
-- Структура таблицы `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`id`, `name`, `icon`) VALUES
(1, 'Shopping', '/assets/uploads/categoriesIcons/Shopping.svg'),
(2, 'Sport avctivity', '/assets/uploads/categoriesIcons/Sport.svg'),
(3, 'Restaurant', '/assets/uploads/categoriesIcons/Restaurant.svg'),
(4, 'Church', '/assets/uploads/categoriesIcons/Church.svg'),
(5, 'Monuments', '/assets/uploads/categoriesIcons/Monument.svg'),
(6, 'Museum', '/assets/uploads/categoriesIcons/Museum.svg'),
(7, 'Park', '/assets/uploads/categoriesIcons/Park.svg'),
(8, 'Squares and Streets', '/assets/uploads/categoriesIcons/Squares.svg'),
(9, 'Entertainment', '/assets/uploads/categoriesIcons/Entertainment.svg');

-- --------------------------------------------------------

--
-- Структура таблицы `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL,
  `city_name` varchar(255) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `cities`
--

INSERT INTO `cities` (`id`, `city_name`, `latitude`, `longitude`) VALUES
(1, 'Jõhvi', 59.359, 27.421),
(2, 'Kohtla-Järve', 59.396, 27.275),
(3, 'Narva', 59.379, 28.179),
(4, 'Sillamäe', 59.396, 27.762),
(11, 'Narva-Jõesuu', 59.454411, 28.040117);

-- --------------------------------------------------------

--
-- Структура таблицы `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `placeId` int(11) NOT NULL,
  `cityId` int(11) NOT NULL,
  `hash` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `date_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `events`
--

INSERT INTO `events` (`id`, `url`, `name`, `description`, `image`, `placeId`, `cityId`, `hash`, `created_at`, `updated_at`, `date_time`) VALUES
(3964, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Lemmikromansi õhtu', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/af4fc4e25b1bbd66e6c6c23350cbef9a-1_ac4cda107a6f3c361c3192740d6f69da.jpeg', 50, 2, '9290680fc990d09b58b86ece7e253369', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-10-11 14:00:00'),
(3965, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Ida-Virumaa VÄÄRIKATE KEVADPIDU \"Hei, lustime veel...\"', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/49331500610559510232230164761230614074995308n-1_3a2dcebc68fd6f6b3c8ba0d376e11057.jpeg', 50, 2, '04e537f037ef571a27632aa596db4f17', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-05-25 10:00:00'),
(3966, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Tantsustuudio VIIS TÄHTE kevadkontsert \"AINULAADNE\"', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename49184249910551611566353369004100428542274462n201_704dd5465f7798f89a326b05c7924728.jpeg', 50, 2, '6571a9bf63581eaadc6b1659c9c1eefa', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-05-24 14:00:00'),
(3967, 'https://www.kjkk.ee/et/syndmused/kontsert', 'XXII Mudilaste laulu-ja tantsupidu', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/4907756611049112943906824804921513423729768n-1_10f7e048788cdc60cdc8844dd55512e5.jpeg', 50, 2, '6497acdcdf99e5305993ba4fa71a1e90', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-05-22 07:00:00'),
(3968, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Kontsert \"Frédéric Chopin 215\"', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename49351213110590376695810182920578214206431823n201_ae550ec024eaa2d1a19b5c987ac3b37d.jpeg', 50, 2, '3edfd33290b2d8c5a7697ad1ec8c9cd5', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-05-14 15:00:00'),
(3969, 'https://www.kjkk.ee/et/syndmused/kontsert', 'EMADEPÄEVA KONTSERT JA KOHTLA-JÄRVE AASTA EMA AUTASUSTAMINE', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/49422542110598883561626165531970904297627506n-1_442c9f9ab0d1305c87348aade59b5e74.jpeg', 50, 2, 'fa8ce839f896ffcb945a20728e182330', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-05-11 10:00:00'),
(3970, 'https://www.kjkk.ee/et/syndmused/kontsert', 'MUSIC STAR STUDIO kontsert “TIME TO SHINE“', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename49054661510623951125894946578643429944982464n201_2df30742b36bdcffe163f67af241cc60.jpeg', 50, 2, 'dbe6efcb97aaac5ac1b6efb24d6fd544', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-05-10 10:00:00'),
(3971, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Tantsukollektiivi \"Zagadka\" kevadkontsert', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename484899721184877502580441849205891719343924875n201_5bd7464ddf7a0fe355a0f39420c2bcb0.jpeg', 50, 2, '3049d3c4af44d4776a35079be76861e6', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-05-04 10:00:00'),
(3972, 'https://www.kjkk.ee/et/syndmused/kontsert', 'KEVADINE KANTRIMOSAIIK', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/49023308510459329475581573703308842366417426n-1_fc6022294b2e85d696066ec4dc44bcd1.jpeg', 50, 2, '3dc4111440e101d51497bccea8c88758', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-04-27 10:00:00'),
(3973, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Vene Kultuuriühingu 30. aastapäeva kontsert', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename48625301010338028521045002374484049563286038n201_9691d070eabfc16e51fa4d4c9f247791.jpeg', 50, 2, 'f535a6cdc1810ded1d1080d4cffec982', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-04-26 12:00:00'),
(3974, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Seltskonnatantsurühma REVERANSS kevadkontsert', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename48450543710242969197217603514125642862640302n201_bfed8f44dc6904b034d2a81fe40bffc6.jpeg', 50, 2, 'e11efcf879987923e6c2a225ec5d24af', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-04-05 10:00:00'),
(3975, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Kontsert BACH vs HÄNDEL', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/48485485610266321261549064540751462314491387n-1_eec231075d9f560ebab541eabf118ebc.jpeg', 50, 2, 'b99599dc5f59c697724dc5c453d2a9ad', '2025-05-01 19:32:44', '2025-05-01 19:32:44', NULL),
(3976, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Naiskoori LADA kevadkontsert', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename48438004010227233665457828931966404892769248n201_c65fb83a7568fc892fe26b2cfc2c5e57.jpeg', 50, 2, '572889511946119a5abf549565c714d3', '2025-05-01 19:32:44', '2025-05-01 19:32:44', NULL),
(3977, 'https://www.kjkk.ee/et/syndmused/kontsert', 'KONTSERT \"Pilet kinno\"', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename48060934310059449782236213876807034985300638n201_478afe22bc6b4f7d60deb3aad52e16b6.jpeg', 50, 2, 'e31ade2694fb688650e296d8e3cd8371', '2025-05-01 19:32:44', '2025-05-01 19:32:44', NULL),
(3978, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Ida-Virumaa laste- ja noorte rahvatantsupäev', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename48212931110172698137578045955687988154930043n201_7753d8126835bbc37ac42554e66fef78.jpeg', 50, 2, '3fead8a5234ade22c5b2ffac2985491f', '2025-05-01 19:32:44', '2025-05-01 19:32:44', NULL),
(3979, 'https://www.kjkk.ee/et/syndmused/kontsert', 'III Kontsert- festival NAINE ja TANTS', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename48225014410180161936831666549843438265587924n201_b7af89743a130003113842d027c5d02c.jpeg', 50, 2, 'f4249c9ee9085478a6d4d60f76408ba1', '2025-05-01 19:32:44', '2025-05-01 19:32:44', NULL),
(3980, 'https://www.kjkk.ee/et/syndmused/kontsert', 'NAISTEPÄEVA KEVADKONTSERT', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename48115679510156944572486733879694123850297689n201_4b2af548dc8031a576f621e3868e6ec3.jpeg', 50, 2, '7affc0e4a2c60a1a669b47e017aec7d1', '2025-05-01 19:32:44', '2025-05-01 19:32:44', NULL),
(3981, 'https://www.kjkk.ee/et/syndmused/kontsert', 'XIX vanade seltskonnatantsude pidu MINJOON', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename4746233779867453668102496909209063368587109n201_3bf56c58d1a172acb8a78d6fb82f5eff.jpeg', 50, 2, '8df3b69c0b2a62eab0376f306eb5d9a6', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-02-23 11:00:00'),
(3982, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Eesti Vabariigi 107. aastapäevale pühendatud kontsert-aktus', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/attachmentfilename476098652996484162503036900563944284688405n201_8bd148debad668b282341c9f220cf9c9.jpeg', 50, 2, '9a42870b5b2c5e1c21974448815cd3cf', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-02-22 16:00:00'),
(3983, 'https://www.kjkk.ee/et/syndmused/kontsert', 'Naiskoori LADA kontsert', 'Нет описания', 'https://www.kjkk.ee/media/zoo/images/472925458977611917723594346513726596505838n-1_0e2a9e3bf006828bedbe1f9a6694efd6.jpeg', 50, 2, '4b15392341140afc7f8f67b3fdffbcd6', '2025-05-01 19:32:44', '2025-05-01 19:32:44', '2025-01-18 13:00:00'),
(3984, 'https://johvi.concert.ee', 'Etendus “Bankett Pariisis”', 'Etendus “Bankett Pariisis”\nEsmaspäev, 5.05\n19:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/02/df82b8665638f46439a0778f149f91bd.jpg', 1, 1, 'b963cc0fdd839c133426c452604096aa', '2025-05-01 19:32:59', '2025-05-01 19:32:59', '2025-05-04 21:00:00'),
(3985, 'https://johvi.concert.ee', 'Lasteetendus “Printsess ja väike lohe”', 'Lasteetendus “Printsess ja väike lohe”\nLaupäev, 10.05\n11:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/01/medium-3.jpg', 1, 1, '265034598a25f84c9af923702e3bd90b', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-05-09 21:00:00'),
(3986, 'https://johvi.concert.ee', 'Jubilate Olav Ehala', 'Jubilate Olav Ehala\nKolmapäev, 14.05\n19:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2024/08/ERMK-Ehala_PL_555x800.jpg', 1, 1, '07acc1beb61f8eaa0527f1be836ecb4f', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-05-13 21:00:00'),
(3987, 'https://johvi.concert.ee', 'Hooaja avakontsert • Elemendid', 'Hooaja avakontsert • Elemendid\nLaupäev, 20.09\n18:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/04/2025_09_18_TheElemets_Jarvi-833x1200.jpg', 1, 1, 'aa064bbd4ece336ca7da6711c3bec8f2', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-09-19 21:00:00'),
(3988, 'https://johvi.concert.ee', 'Kelmikas suhtekomöödia ”Läbikäidav magamistuba”', 'Kelmikas suhtekomöödia ”Läbikäidav magamistuba”\nKolmapäev, 24.09\n19:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/02/093e4cb3814933c22a67a8fa151b3882.jpg', 1, 1, 'bb4c350ecca1d3dacc27ac145f1ec1b9', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-09-23 21:00:00'),
(3989, 'https://johvi.concert.ee', 'Lotte, Bruno ja pillide lugu', 'Lotte, Bruno ja pillide lugu\nTeisipäev, 14.10\n12:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/04/2025_10_12_LotteBruno-833x1200.jpg', 1, 1, '871a145aab8b13c6a5a1987efbcfdb48', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-10-13 21:00:00'),
(3990, 'https://johvi.concert.ee', 'Via Legenda. Heade Laulude Planeet.', 'Via Legenda. Heade Laulude Planeet.\nReede, 17.10\n19:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/03/4155b3a3ee0c6a21838d4b2e0e9c181d.jpg', 1, 1, '63684896cc73ef63a7f3c97990f1909e', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-10-16 21:00:00'),
(3991, 'https://johvi.concert.ee', 'Original Enigma Voices', 'Original Enigma Voices\nPühapäev, 19.10\n18:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/03/4a505814834a7d574e431185b015e886.jpg', 1, 1, 'c275e84dd68ae4a1355b9e2a8c314d5e', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-10-18 21:00:00'),
(3992, 'https://johvi.concert.ee', 'Itaalia Legend Gazebo', 'Itaalia Legend Gazebo\nPühapäev, 26.10\n19:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/02/dff3079491692437b0c71ca6343a5663.jpg', 1, 1, '93672098a5087e9ecc4921b80f48bb02', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-10-25 21:00:00'),
(3993, 'https://johvi.concert.ee', 'Prime Orchestra. Rock Sympho Show IV', 'Prime Orchestra. Rock Sympho Show IV\nReede, 31.10\n19:00\nJõhvi, Jõhvi kontserdimaja\nLoe lähemalt', 'https://concert.ee/wp-content/uploads/2025/03/481906434_1064954312107885_3040568458013436567_n.jpg', 1, 1, '5251a1c20deaadf747faab2cb6518580', '2025-05-01 19:33:00', '2025-05-01 19:33:00', '2025-10-30 22:00:00');

-- --------------------------------------------------------

--
-- Структура таблицы `many_to_many_categories`
--

CREATE TABLE `many_to_many_categories` (
  `place_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `many_to_many_categories`
--

INSERT INTO `many_to_many_categories` (`place_id`, `category_id`) VALUES
(1, 6),
(1, 9),
(2, 9),
(3, 2),
(4, 3),
(5, 4),
(6, 5),
(7, 2),
(7, 9),
(8, 5),
(41, 1),
(41, 9),
(50, 9),
(51, 9);

-- --------------------------------------------------------

--
-- Структура таблицы `places`
--

CREATE TABLE `places` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `working_hours` varchar(255) DEFAULT NULL,
  `location` text NOT NULL,
  `web` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `city` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `places`
--

INSERT INTO `places` (`id`, `name`, `photo`, `working_hours`, `location`, `web`, `description`, `latitude`, `longitude`, `city`) VALUES
(1, 'Concert Hall', 'https://concert.ee/static/GLaak_07Jun17Nr0004-maja-800x504.jpg', '10:00-18:00', 'Pargi st 40', 'https://johvi.concert.ee/en/', 'Jõhvi Concert House opened its doors on October 8, 2005 under the management of Aivar Mäe, acting at the time as the Director of Estonian Concert. The architects of the concert house are Ra Luhse and Tanel Tuhal. Linda Madalik created the concert hall’s excellent acoustics.\r\n\r\nCinema Amadeus, Jõhvi City Gallery, Jõhvi Music School, Jõhvi Hobby Centre and Café Noot reside in the building. Jõhvi Concert House is an excellent choice for organising various events. Conferences, seminars, exhibitions, festive receptions, classical concerts, ballet performances, balls, rock concerts and many more in can be held at Jõhvi Concert Hall.', 59.35408949380664, 27.42316780284446, 1),
(2, 'Apollo Cinema', 'https://tasku.ee/wp-content/uploads/2024/01/RAV0131.jpg', '10:00-21:00', 'Puru road 1', 'https://www.apollokino.ee', 'The tenth Apollo cinema – Apollo Kino Jõhvi – is located on the ground floor of the Pargi Shopping Centre in Jõhvi. There are 178 seats split between two screens, including the fa-vourite seats of them all – star seats and twin sofas.\r\nApollo Kino Jõhvi has top-notch cinema equipment, powerful laser projectors, award-winning screens and a sound system designed specifically for Apollo Kino screens.', 59.353152, 27.421478, 1),
(3, 'Jõhvi Sports School', 'https://www.resand.ee/rwp/wp-content/uploads/2016/08/3_J%C3%B5hvi_spordihall-1024x684.jpg', '08:00–22:00', 'Hariduse st 5/2', 'https://www.johvisport.ee/et', 'Jõhvi Children and Youth Sports School was founded on January 2, 1989. The goal of Jõhvi Sports School is to strengthen the health and comprehensive physical development of children and young people, teach them sports skills, abilities and knowledge taking into account their wishes and expectations. As well as to educate athletes of the highest possible qualification, physically, mentally and harmoniously developed, providing a wide range of sports education.', 59.35031680786445, 27.416140298332007, 1),
(4, 'Ocean Sushi Bar', 'https://johvi.oceansushi.ee/wp-content/uploads/2022/12/hi7PDlBV_4x-1-1536x958.jpg', '11:00-22:00', 'Keskväljak 9', 'https://johvi.oceansushi.ee/', '', 59.35812597130304, 27.41197179331706, 1),
(5, 'Seventh-day Adventist Congregation', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Ida-Virumaa_J%C3%B5hvi_adventkirik_05n_2012_2021.06.19MF.jpg/1024px-Ida-Virumaa_J%C3%B5hvi_adventkirik_05n_2012_2021.06.19MF.jpg', '', 'Uus st 3', '', '', 59.35738708637055, 27.40696028168166, 1),
(6, 'Memorial to German officers', 'https://db.esap.ee/uploads/images/full/IV-0550/IV-0550--MM20190416-0158-J6hvi.jpg', '', 'Pargi st 48', '', 'During World War II, a German military hospital was located on the territory of Jõhvi Manor. The manor estate was chosen as the burial place for those who died in the hospital. In total, the remains of 480 soldiers (not all of them officers) were found here, and they were reburied in the German military cemetery in Jõhvi. On September 16, 1994, a memorial stone was unveiled at the burial site in the park with the inscription: \"Rest in peace, fallen 1944.\" On the same day, 300 m to the east, along Pargi Street, at the site of the former military cemetery, a memorial stone was unveiled.', 59.35230997798252, 27.42597303458488, 1),
(7, 'FC Phoenix', 'https://fcphoenix.ee/storage/app/media/news/2025/IMG_3657.jpeg', '10:00-16:00', 'Pargi st 1', 'https://fcphoenix.ee/', 'Our club exists thanks to the dedication of our local football community, the help of our sponsors and the support of the authority of Jõhv.\r\n\r\nThe official presentation of Lokomotiv Jõhvi took place in summer 2011. Present were representatives of several regional football teams as well as the president of the Estonian Football Association. Our birghday is August, 15 2011.\r\n\r\nUntil February 2018, the club was called «Lokomotiv», but with the arrival of a new sponsor of «Наshcoins», it was decided to re-name the football club «Phoenix».\r\n\r\nToday our club has more than 100 players - children as well as grown-ups. In 2016 and 2017, together with the Spanish football club «Valencia», five-day children\'s summer camps were held.\r\n\r\nOur goal is to become the best football club in Ida-Viru County by offering the talented youth of our region an opportunity to do sports and a way for self-realisation.', 59.355797, 27.418938, 1),
(8, 'Deer Sculpture', '/assets/uploads/a75fe7e274a25cf420a0c9de9d943625', '', 'Johvi', '', 'The sculpture depicting Jõhvi’s coat of arms carries Jõhvi’s identity. The whole world consists of symbols, and the deer as a symbol of intelligence and elegance suits Jõhvi. The deer is an animal of abundance, with the power of youth.', 59.366618221190514, 27.394238412632127, 1),
(41, 'Pargi Center', 'https://www.visitnarva.ee/sites/default/files/vemedia/295164_2fcd4a0e9d8d427a56971a3b4e9894e9.jpg', '09:00-11:00', 'Puru st 1', 'https://pargikeskus.ee/kampaaniad/', 'pargikeskus', 59.35302140924989, 27.41928895484147, 1),
(50, 'Cultural Center', 'https://kjkk.ee/images/FPslideshow/Slide04.jpg', 'Wed-Fri 10:00-19:00, Sat 15:00-17:00', 'Keskallee 36', 'https://www.kjkk.ee/et/', 'Kohtla-Järve is unimaginable without this historic house. The building is built in the neoclassical style and is a unique architectural monument in Estonia. The interior design gives it a unique atmosphere of celebration. The viewing and dance halls are equipped with modern technology, which allows for various events to be held - chamber and larger concert programs, theater performances, children\'s entertainment programs, conferences, seminars and exhibitions.', 59.399358, 27.273409, 2),
(51, 'Apollo Cinema', 'https://estoniia.ru/wp-content/uploads/2017/05/apollo-kino-astri.jpg', '10:00-22:00', 'Tallinn highway 41', 'https://www.apollokino.ee/eng/schedule?theatreAreaID=1008&fromLang=1001', 'Apollo Kino Astri in Narva has three screens that can accommodate up to 400 film fans. The cinema located in Astri Shopping Centre is the only modern cinema in the region that shows films in Estonian and Russian.\r\n\r\nThree screens at the cinema have high-quality equipment, brand new acoustics systems and modern cinema seats.', 59.381118, 28.175847, 3);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'test1', 'tset1@gmail.com', '$2b$10$LbZqfDzJG9WIpSJDjlMCFOUFEroHYtYw/Ve5TqNSRBjSRBQTEjR9i'),
(2, 'tetst2', 'twst@gami.ee', '$2b$10$MFKYvjwEBhJrgmZ.T8FFmewHgLK71HEkqJ6Oi5DKsVGPfK9/SQ/0O'),
(3, 'admin', 'admin@mail.com', '$2b$10$7qe7XLznFfKFgaxVpMJmLOJSBQ/xI87/ZHodbgxN4qfi.kg/dIvNi');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hash` (`hash`),
  ADD KEY `placeId` (`placeId`),
  ADD KEY `cityId` (`cityId`);

--
-- Индексы таблицы `many_to_many_categories`
--
ALTER TABLE `many_to_many_categories`
  ADD KEY `place_id` (`place_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Индексы таблицы `places`
--
ALTER TABLE `places`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_places_city` (`city`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT для таблицы `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4444;

--
-- AUTO_INCREMENT для таблицы `places`
--
ALTER TABLE `places`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`placeId`) REFERENCES `places` (`id`),
  ADD CONSTRAINT `events_ibfk_2` FOREIGN KEY (`cityId`) REFERENCES `cities` (`id`);

--
-- Ограничения внешнего ключа таблицы `many_to_many_categories`
--
ALTER TABLE `many_to_many_categories`
  ADD CONSTRAINT `many_to_many_categories_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`),
  ADD CONSTRAINT `many_to_many_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Ограничения внешнего ключа таблицы `places`
--
ALTER TABLE `places`
  ADD CONSTRAINT `fk_places_city` FOREIGN KEY (`city`) REFERENCES `cities` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
