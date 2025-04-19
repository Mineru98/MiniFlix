-- MiniFlix 샘플 데이터
USE miniflix;

-- 장르 샘플 데이터
INSERT INTO Genres (name, description) VALUES
    ('액션', '스릴과 모험이 가득한 영화'),
    ('코미디', '웃음을 주는 영화'),
    ('드라마', '감동과 인간의 이야기'),
    ('SF', '과학적인 상상력이 돋보이는 영화'),
    ('애니메이션', '그림이나 컴퓨터 그래픽으로 만든 영화'),
    ('다큐멘터리', '실제 사건이나 사실을 다룬 영화'),
    ('스릴러', '긴장감과 공포를 주는 영화'),
    ('로맨스', '사랑을 주제로 한 영화');

-- 콘텐츠 샘플 데이터 (무료 영상만)
INSERT INTO Contents (title, description, thumbnail_url, video_url, duration, release_year) VALUES
    ('빅 벅 버니', '자연 속의 토끼의 모험을 담은 짧은 애니메이션', '/thumbnails/big_buck_bunny.jpg', '/media/big_buck_bunny.mp4', 596, 2008),
    ('우주의 신비', '우주와 별들의
    신비로운 세계를 탐험하는 다큐멘터리', '/thumbnails/cosmos.jpg', '/media/cosmos.mp4', 420, 2019),
    ('자연의 소리', '숲속의 다양한 소리와 이미지를 담은 힐링 영상', '/thumbnails/nature_sounds.jpg', '/media/nature_sounds.mp4', 360, 2020),
    ('바다 탐험', '심해의 놀라운 생물들과 경관을 보여주는 다큐멘터리', '/thumbnails/ocean_dive.jpg', '/media/ocean_dive.mp4', 540, 2018),
    ('일렉트로 드림', '미래 세계의 이야기를 담은 SF 단편', '/thumbnails/electro_dream.jpg', '/media/electro_dream.mp4', 480, 2021),
    ('코미디 쇼케이스', '유명 코미디언들의 공연 모음', '/thumbnails/comedy_showcase.jpg', '/media/comedy_showcase.mp4', 720, 2022),
    ('사랑의 시작', '두 연인의 첫 만남을 그린 로맨스 단편', '/thumbnails/love_story.jpg', '/media/love_story.mp4', 510, 2017),
    ('액션 히어로', '정의를 위해 싸우는 영웅의 이야기', '/thumbnails/action_hero.jpg', '/media/action_hero.mp4', 650, 2020),
    ('미스터리 하우스', '기묘한 집에서 벌어지는 스릴러', '/thumbnails/mystery_house.jpg', '/media/mystery_house.mp4', 570, 2019),
    ('일상의 드라마', '평범한 사람들의 특별한 이야기', '/thumbnails/everyday_drama.jpg', '/media/everyday_drama.mp4', 630, 2021);

-- 콘텐츠-장르 매핑
INSERT INTO ContentGenres (content_id, genre_id) VALUES
    (1, 5), -- 빅 벅 버니: 애니메이션
    (2, 6), -- 우주의 신비: 다큐멘터리
    (2, 4), -- 우주의 신비: SF
    (3, 6), -- 자연의 소리: 다큐멘터리
    (4, 6), -- 바다 탐험: 다큐멘터리
    (5, 4), -- 일렉트로 드림: SF
    (6, 2), -- 코미디 쇼케이스: 코미디
    (7, 8), -- 사랑의 시작: 로맨스
    (7, 3), -- 사랑의 시작: 드라마
    (8, 1), -- 액션 히어로: 액션
    (9, 7), -- 미스터리 하우스: 스릴러
    (10, 3); -- 일상의 드라마: 드라마

-- 관리자 계정 (비밀번호: admin123)
INSERT INTO Users (email, password_hash, name, is_active) VALUES
    ('admin@miniflix.com', '$2a$10$XFNNZqKX9iFDW60OLvvyO.6U9ZfQl9mMEJTJRKXw.XKXkCrK.OQUS', '관리자', TRUE);

-- 일반 사용자 계정 (비밀번호: user123)
INSERT INTO Users (email, password_hash, name, is_active) VALUES
    ('user@example.com', '$2a$10$VhF2e9y0zFZdWQEOODI3k.QfBOaP0LBJvkzDOoG1LNx4CQjX41F8i', '일반 사용자', TRUE); 