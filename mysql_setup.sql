-- Script de creación de base de datos MySQL para Credihogar
-- Ejecutar este script en phpMyAdmin o en línea de comandos MySQL

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS credihogar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE credihogar_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100),
    image_url VARCHAR(500),
    owner_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_owner (owner_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de sesiones (opcional, para manejo de sesiones PHP)
CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token(255)),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar categorías predeterminadas
INSERT INTO categories (name, slug) VALUES
('Accesorios de baño', 'accesorios-bano'),
('Almohadas y rellenos', 'almohadas-rellenos'),
('Catálogo navideño', 'catalogo-navideno'),
('Cobijas', 'cobijas'),
('Cojines', 'cojines'),
('Cortinas', 'cortinas'),
('Manteleria', 'manteleria'),
('Protectores', 'protectores'),
('Sabanas', 'sabanas'),
('Tendidos estandar', 'tendidos-estandar'),
('Tendidos premium', 'tendidos-premium'),
('Toallas', 'toallas')
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

-- Crear usuario administrador por defecto (cambiar email y password después)
-- Password por defecto: 'admin123' (CAMBIAR INMEDIATAMENTE)
-- Hash generado con password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO users (id, email, password_hash, role, is_admin) 
VALUES (
    UUID(),
    'admin@credihogar.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    TRUE
) ON DUPLICATE KEY UPDATE role='admin', is_admin=TRUE;

-- Procedimiento almacenado para limpiar sesiones expiradas
DELIMITER //
CREATE PROCEDURE clean_expired_sessions()
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END//
DELIMITER ;

-- Evento para limpiar sesiones automáticamente cada hora (si el Event Scheduler está habilitado)
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT IF NOT EXISTS clean_sessions_event
-- ON SCHEDULE EVERY 1 HOUR
-- DO CALL clean_expired_sessions();

-- Ver información de las tablas creadas
SHOW TABLES;
SELECT 'Base de datos creada exitosamente!' AS status;
