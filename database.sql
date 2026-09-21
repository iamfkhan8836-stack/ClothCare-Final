-- ============================================
-- ClothCare - Clothing Donation Management System
-- Database Setup
-- ============================================

CREATE DATABASE IF NOT EXISTS clothcare;

USE clothcare;


-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);


-- ============================================
-- DONATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    clothing_type VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    condition_type VARCHAR(50) NOT NULL,
    description TEXT,
    donation_date DATE NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- PICKUPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pickups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    pickup_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- CHECK TABLES
-- ============================================

SHOW TABLES;