-- MySQL 데이터베이스 스키마 (UTF-8)
-- MiniFlix 데이터베이스

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS miniflix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE miniflix;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS Users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS Contents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(255) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    duration INT NOT NULL COMMENT '영상 길이(초)',
    release_year INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 장르 테이블
CREATE TABLE IF NOT EXISTS Genres (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200)
) ENGINE=InnoDB;

-- 콘텐츠-장르 매핑 테이블
CREATE TABLE IF NOT EXISTS ContentGenres (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    FOREIGN KEY (content_id) REFERENCES Contents(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genres(id) ON DELETE CASCADE,
    UNIQUE KEY (content_id, genre_id)
) ENGINE=InnoDB;

-- 찜 목록 테이블
CREATE TABLE IF NOT EXISTS Wishlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES Contents(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, content_id)
) ENGINE=InnoDB;

-- 시청 기록 테이블
CREATE TABLE IF NOT EXISTS ViewingHistories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content_id BIGINT NOT NULL,
    watch_duration INT NOT NULL DEFAULT 0 COMMENT '시청 시간(초)',
    last_position INT NOT NULL DEFAULT 0 COMMENT '마지막 시청 위치(초)',
    watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES Contents(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, content_id)
) ENGINE=InnoDB;

-- 인덱스 추가
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_contents_title ON Contents(title);
CREATE INDEX idx_viewing_histories_user_content ON ViewingHistories(user_id, content_id);
CREATE INDEX idx_wishlists_user ON Wishlists(user_id);
CREATE INDEX idx_content_genres_content ON ContentGenres(content_id);
CREATE INDEX idx_content_genres_genre ON ContentGenres(genre_id); 