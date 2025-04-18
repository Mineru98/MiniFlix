-- Insert sample genres
INSERT INTO genres (name, description) VALUES
('액션', '화려한 액션과 스릴이 돋보이는 장르'),
('드라마', '인간의 감정과 관계를 중심으로 한 장르'),
('코미디', '유머와 재미를 주는 장르'),
('SF', '과학 기술과 미래를 다루는 장르'),
('공포', '무서움과 공포를 자아내는 장르'),
('로맨스', '사랑을 중심으로 한 장르');

-- Insert sample contents (using free/open-source videos)
INSERT INTO contents (title, description, thumbnail_url, video_url, duration, release_year) VALUES
('오픈소스 영화: 빅 벅 버니', '오픈소스로 제작된 3D 애니메이션 영화입니다.', '/thumbnails/big_buck_bunny.jpg', '/videos/big_buck_bunny.mp4', 596, 2008),
('오픈소스 영화: 엘리파 드림', '오픈소스로 제작된 애니메이션 영화입니다.', '/thumbnails/elephants_dream.jpg', '/videos/elephants_dream.mp4', 654, 2006),
('오픈소스 영화: 시네스타', '오픈소스로 제작된 단편 영화입니다.', '/thumbnails/sintel.jpg', '/videos/sintel.mp4', 888, 2010),
('자연 다큐: 바다의 세계', '아름다운 해양 생태계를 담은 다큐멘터리입니다.', '/thumbnails/ocean_world.jpg', '/videos/ocean_world.mp4', 360, 2018),
('클래식 무비: 미스터리 하우스', '공개 도메인 클래식 미스터리 영화입니다.', '/thumbnails/mystery_house.jpg', '/videos/mystery_house.mp4', 780, 1940),
('우주 다큐: 은하계의 신비', '우주의 신비를 탐험하는 다큐멘터리입니다.', '/thumbnails/galaxy.jpg', '/videos/galaxy.mp4', 420, 2020),
('코믹 쇼츠: 웃음의 순간들', '재미있는 순간들을 모은 짧은 코미디 클립입니다.', '/thumbnails/comedy_moments.jpg', '/videos/comedy_moments.mp4', 300, 2021),
('로맨스 단편: 첫 만남', '로맨틱한 첫 만남을 다룬 단편 영화입니다.', '/thumbnails/first_meeting.jpg', '/videos/first_meeting.mp4', 480, 2019);

-- Connect contents with genres
INSERT INTO content_genres (content_id, genre_id) VALUES
(1, 3), -- 빅 벅 버니 - 코미디
(2, 4), -- 엘리파 드림 - SF
(2, 1), -- 엘리파 드림 - 액션
(3, 1), -- 시네스타 - 액션
(3, 4), -- 시네스타 - SF
(4, 2), -- 바다의 세계 - 드라마
(5, 5), -- 미스터리 하우스 - 공포
(6, 4), -- 은하계의 신비 - SF
(7, 3), -- 웃음의 순간들 - 코미디
(8, 6); -- 첫 만남 - 로맨스

-- Insert sample user (password: "password123")
INSERT INTO users (email, password_hash, name)
VALUES ('test@example.com', '$2b$10$5B9XuSUFw1S8nN5q57Jxde9w3fz5Nq70vKG2HBA1KLd9zHNf461a.', '테스트 사용자'); 