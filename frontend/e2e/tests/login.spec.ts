import { test, expect } from "@playwright/test";

test.describe("로그인 기능", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인 페이지로 이동
    await page.goto("/login");
  });

  test("로그인 페이지가 올바르게 렌더링되는지 확인", async ({ page }) => {
    // 로그인 페이지 타이틀 확인
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();

    // 로그인 페이지의 주요 요소들이 존재하는지 확인
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
    await expect(page.getByTestId("remember-checkbox")).toBeVisible();
  });

  test("유효한 자격 증명으로 로그인 성공", async ({ page }) => {
    // 인증 API 모킹
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: 1,
              email: "test@example.com",
              name: "테스트 사용자",
              is_active: true,
              created_at: "2023-01-01T00:00:00Z",
            },
            token: "mock-jwt-token",
          },
          meta: {
            code: 200,
            message: "로그인 성공",
          },
        }),
      });
    });

    // 로그인 폼 입력
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByText("로그인 정보 저장").click(); // 체크박스 클릭

    // 로그인 버튼 클릭
    await page.getByTestId("login-button").click();

    // 홈페이지로 리디렉션 확인
    await expect(page).toHaveURL("/");
  });

  test("잘못된 자격 증명으로 로그인 실패", async ({ page }) => {
    // 실패한 인증 API 모킹
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          meta: {
            code: 401,
            message: "이메일 또는 비밀번호가 잘못되었습니다.",
          },
        }),
      });
    });

    // 로그인 폼 입력
    await page.getByTestId("email-input").fill("wrong@example.com");
    await page.getByTestId("password-input").fill("wrongpassword");

    // 로그인 버튼 클릭
    await page.getByTestId("login-button").click();

    // 오류 메시지 확인 (react-hot-toast에 의해 표시됨)
    await expect(
      page.getByText("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.")
    ).toBeVisible();

    // 로그인 페이지에 남아 있는지 확인
    await expect(page).toHaveURL("/login");
  });

  test("필수 입력 필드 검증", async ({ page }) => {
    // 빈 폼으로 로그인 시도
    await page.getByTestId("login-button").click();

    // HTML5 유효성 검사로 인해 이메일 필드에 포커스가 맞춰짐
    await expect(page.getByTestId("email-input")).toBeFocused();
  });
});
