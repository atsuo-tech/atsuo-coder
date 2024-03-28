CREATE DATABASE IF NOT EXISTS atsuo_judge;
CREATE USER IF NOT EXISTS 'atsuo_judge' @'localhost' IDENTIFIED BY 'atsuo_judge';
GRANT ALL PRIVILEGES ON atsuo_judge.* TO 'atsuo_judge' @'localhost';
-- Init tables
USE atsuo_judge;
CREATE TABLE IF NOT EXISTS `contests` (
	`id` VARCHAR(20) NOT NULL PRIMARY KEY,
	`problems` TEXT,
	`public` TINYINT(1) DEFAULT 0,
	`name` TEXT,
	`owner` CHAR(20),
	`editors` TEXT,
	`testers` TEXT,
	`start` DATETIME,
	`period` BIGINT,
	`rated` TEXT,
	`rated_users` TEXT,
	`unrated_users` TEXT,
	`description` TEXT,
	`penalty` BIGINT
);
CREATE TABLE IF NOT EXISTS `ct_token` (
	`id` CHAR(36) NOT NULL PRIMARY KEY,
	`use_to` TEXT,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`user_id` CHAR(20)
);
CREATE TABLE IF NOT EXISTS `submissions` (
	`id` CHAR(36) NOT NULL PRIMARY KEY,
	`sourceCode` TEXT,
	`contest` VARCHAR(20),
	`task` VARCHAR(40),
	`user` VARCHAR(20),
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`judge` TEXT,
	`language` VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS `tasks` (
	`id` VARCHAR(40) NOT NULL PRIMARY KEY,
	`question` TEXT,
	`judge_type` BIGINT,
	`editors` TEXT,
	`testers` TEXT,
	`name` TEXT,
	`score` BIGINT
);
CREATE TABLE IF NOT EXISTS `tokens` (
	`id` CHAR(36) NOT NULL PRIMARY KEY,
	`ct` CHAR(36),
	`user` CHAR(20),
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS `users` (
	`id` CHAR(20) NOT NULL PRIMARY KEY,
	`password` TEXT,
	`rating` BIGINT DEFAULT 0,
	`name` TEXT,
	`grade` BIGINT,
	`admin` BIGINT,
	`performances` TEXT,
	`inner_rating` BIGINT DEFAULT 0,
);