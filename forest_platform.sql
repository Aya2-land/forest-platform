-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- ホスト: localhost:8889
-- 生成日時: 2024 年 10 月 29 日 08:24
-- サーバのバージョン： 5.7.39
-- PHP のバージョン: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- データベース: `forest_platform`
--

-- --------------------------------------------------------


--
-- テーブルの構造 `paper_annotations`
--

CREATE TABLE `paper_annotations` (
  `annotation_id` int(45) NOT NULL,
  `node_id` varchar(45) NOT NULL,
  `start_char_id` int(45) NOT NULL,
  `end_char_id` int(45) NOT NULL,
  `content` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `paragraphes`
--

CREATE TABLE `paragraphes` (
  `paragraph_id` varchar(45) NOT NULL,
  `section_id` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `paragraph_contents`
--

CREATE TABLE `paragraph_contents` (
  `paragraph_content_id` varchar(45) NOT NULL,
  `paragraph_id` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `paragraph_content_histories`
--

CREATE TABLE `paragraph_content_histories` (
  `paragraph_content_history_id` varchar(45) NOT NULL,
  `paragraph_content_version_id` varchar(45) NOT NULL,
  `paragraph_content_par_id` varchar(45) NOT NULL,
  `paragraph_content_bro_id` varchar(45) NOT NULL,
  `content` varchar(999) NOT NULL,
  `concept_id` varchar(45) NOT NULL,
  `type_id` int(45) NOT NULL,
  `appeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disappeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `paragraph_content_versions`
--

CREATE TABLE `paragraph_content_versions` (
  `paragraph_content_version_id` varchar(45) NOT NULL,
  `paragraph_content_id` varchar(45) NOT NULL,
  `paragraph_content_par_id` varchar(45) NOT NULL,
  `paragraph_content_bro_id` varchar(45) NOT NULL,
  `paragraph_version_id` varchar(45) NOT NULL,
  `content` varchar(999) NOT NULL,
  `concept_id` varchar(45) NOT NULL,
  `type_id` int(45) NOT NULL,
  `appeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disappeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `paragraph_histories`
--

CREATE TABLE `paragraph_histories` (
  `paragraph_history_id` varchar(45) NOT NULL,
  `paragraph_version_id` varchar(45) NOT NULL,
  `paragraph_bro_id` varchar(45) NOT NULL,
  `title` varchar(1024) NOT NULL DEFAULT '',
  `content` longtext NOT NULL,
  `appeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disappeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `paragraph_versions`
--

CREATE TABLE `paragraph_versions` (
  `paragraph_version_id` varchar(45) NOT NULL,
  `paragraph_id` varchar(45) NOT NULL,
  `paragraph_bro_id` varchar(45) NOT NULL,
  `section_version_id` varchar(45) NOT NULL,
  `title` varchar(1024) NOT NULL DEFAULT '',
  `content` longtext NOT NULL,
  `appeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disappeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `sections`
--

CREATE TABLE `sections` (
  `section_id` varchar(45) NOT NULL,
  `chapter_id` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `section_histories`
--

CREATE TABLE `section_histories` (
  `section_history_id` varchar(45) NOT NULL,
  `section_version_id` varchar(45) NOT NULL,
  `section_bro_id` varchar(45) NOT NULL,
  `title` varchar(1024) NOT NULL DEFAULT '',
  `appeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disappeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `section_versions`
--

CREATE TABLE `section_versions` (
  `section_version_id` varchar(45) NOT NULL,
  `section_id` varchar(45) NOT NULL,
  `section_bro_id` varchar(45) NOT NULL,
  `chapter_version_id` varchar(45) NOT NULL,
  `title` varchar(1024) NOT NULL DEFAULT '',
  `appeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disappeared_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- テーブルの構造 `types`
--

CREATE TABLE `types` (
  `type_id` int(45) NOT NULL,
  `class` varchar(100) DEFAULT NULL,
  `type` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- テーブルのデータのダンプ `types`
--

INSERT INTO `types` (`type_id`, `class`, `type`) VALUES
(0, 'root', 'root'),
(1, 'question', 'toi'),
(2, 'question', 'toi_deep'),
(3, 'question', 'other_question'),
(4, 'question', 'other_to_myquestion'),
(5, 'answer', 'answer'),
(6, 'answer', 'konkyo'),
(7, 'answer', 'other_answer'),
(8, 'answer', 'other_to_myanswer'),
(9, 'predict', 'predict'),
(10, 'criticism', 'criticism'),
(11, 'criticism', 'evaluation'),
(12, 'criticism', 'e_1'),
(13, 'criticism', 'e_2'),
(14, 'criticism', 'e_3'),
(15, 'criticism', 'objection'),
(16, 'criticism', 'o_1'),
(17, 'criticism', 'o_2'),
(18, 'criticism', 'o_3'),
(19, 'criticism', 'modification'),
(20, 'criticism', 'm_1'),
(21, 'criticism', 'm_2'),
(22, 'criticism', 'm_3');

-- --------------------------------------------------------

--
-- テーブルの構造 `users`
--

CREATE TABLE `users` (
  `user_id` int(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(999) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- テーブルのデータのダンプ `users`
--

INSERT INTO `users` (`user_id`, `name`, `login_time`, `password`) VALUES
(1762021915, 'KAWA', '2024-10-28 13:54:52', '$2y$10$yHRkncXhKFHze9onZODC3.pIbeaXH58LarAeb0CY9EPo71ZeLPDea');

-- --------------------------------------------------------

--
-- ビュー用の構造 `map_mode_link`
--
DROP TABLE IF EXISTS `map_mode_link`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `map_mode_link`  AS SELECT `maps`.`map_id` AS `map_id`, `maps`.`user_id` AS `user_id`, `maps`.`paper_id` AS `paper_id`, `maps`.`name` AS `name`, `maps`.`scenario_title` AS `scenario_title`, `maps`.`created_at` AS `created_at`, `maps`.`updated_at` AS `updated_at`, `maps`.`deleted` AS `deleted`, `t1`.`name` AS `mode_name`, `t1`.`mode_id` AS `mode_id` FROM (`maps` join (select `map_mode_links`.`map_id` AS `map_id`,`modes`.`name` AS `name`,`modes`.`mode_id` AS `mode_id` from (`map_mode_links` join `modes` on((`map_mode_links`.`mode_id` = `modes`.`mode_id`)))) `t1` on((`maps`.`map_id` = `t1`.`map_id`)))  ;

-- --------------------------------------------------------

--
-- ビュー用の構造 `node_latest`
--
DROP TABLE IF EXISTS `node_latest`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `node_latest`  AS SELECT `nodes`.`node_id` AS `node_id`, `node_versions`.`node_version_id` AS `node_version_id`, `node_versions`.`parent_id` AS `parent_id`, `node_versions`.`type_id` AS `type_id`, `node_versions`.`content` AS `content`, `node_versions`.`concept_id` AS `concept_id`, `node_versions`.`x` AS `x`, `node_versions`.`y` AS `y` FROM (`nodes` join `node_versions` on((`nodes`.`node_id` = (select `node_versions`.`node_id` from `node_versions` where (`node_versions`.`node_id` = `nodes`.`node_id`) order by `node_versions`.`appeared_at` desc limit 1))))  ;

--
