import { AppDataSource } from "../config/database";

beforeAll(async () => {
  // 테스트용 데이터베이스 설정
  process.env.NODE_ENV = "test";
  process.env.DB_NAME = "miniflix_test";
});

afterAll(async () => {
  // 테스트 완료 후 연결 종료
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
