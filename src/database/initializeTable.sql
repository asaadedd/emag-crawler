CREATE DATABASE IF NOT EXISTS `emag_crawler`;

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
    `ID` int(11) NOT NULL AUTO_INCREMENT,
    `URL` varchar(300) NOT NULL,
    `price` float DEFAULT NULL,
    `stock` varchar(45) DEFAULT NULL,
    PRIMARY KEY (ID),
    UNIQUE KEY ID_UNIQUE (ID)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;