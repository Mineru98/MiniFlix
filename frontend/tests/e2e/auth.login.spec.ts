import { test, expect, Page } from "@playwright/test";

test.describe("로그인 기능", () => {
  // 테스트에 필요한 사용자 정보
  const testUser = {
    email: "test@example.com",
    password: "password123",
  };

  // 회원가입 헬퍼 함수
  async function signupTestUser(page: Page) {
    await page.goto("/signup");
    await page.locator("input#email").fill(testUser.email);
    await page.locator("input#name").fill("테스트 사용자");
    await page.locator("input#password").fill(testUser.password);
    await page.locator("input#confirmPassword").fill(testUser.password);
    await page.locator('button[type="submit"]').click();
    // 회원가입 후 로그인 페이지로 이동 확인
    await expect(page).toHaveURL("/login");
  }

  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인 페이지로 이동
    await page.goto("/login");
  });

  test("유효한 자격 증명으로 로그인 할 수 있다", async ({ page }) => {
    // 테스트 사용자로 로그인
    await page.locator("input#email").fill(testUser.email);
    await page.locator("input#password").fill(testUser.password);
    await page.locator('button[type="submit"]').click();

    // 로그인 성공 후 메인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL("/");
  });

  test("잘못된 비밀번호로 로그인 시 오류 메시지가 표시된다", async ({
    page,
  }) => {
    // 잘못된 비밀번호로 로그인 시도
    await page.locator("input#email").fill(testUser.email);
    await page.locator("input#password").fill("wrong_password");
    await page.locator('button[type="submit"]').click();

    // 로그인 오류 메시지 확인
    await expect(page.locator("text=로그인에 실패했습니다")).toBeVisible();
  });

  test("이메일과 비밀번호 입력 필드가 비어있으면 로그인 버튼이 작동하지 않는다", async ({
    page,
  }) => {
    // 빈 폼으로 제출
    await page.locator('button[type="submit"]').click();

    // URL이 변경되지 않고 여전히 로그인 페이지에 있음을 확인
    await expect(page).toHaveURL("/login");
  });

  test("로그인 후 로그아웃이 정상적으로 작동한다", async ({ page }) => {
    // 로그인
    await page.locator("input#email").fill(testUser.email);
    await page.locator("input#password").fill(testUser.password);
    await page.locator('button[type="submit"]').click();

    // 로그인 성공 후 메인 페이지로 이동 확인
    await expect(page).toHaveURL("/");

    // 프로필 메뉴 열기 (실제 구현에 맞게 선택자 수정 필요)
    await page.locator("div.user-profile").click();

    // 로그아웃 버튼 클릭
    await page.locator("text=로그아웃").click();

    // 로그아웃 후 로그인 페이지로 이동 확인
    await expect(page).toHaveURL("/login");
  });

  test('로그인 시 "로그인 정보 저장" 체크박스가 작동한다', async ({ page }) => {
    // "로그인 정보 저장" 체크박스 클릭
    await page.locator('[data-testid="remember-checkbox"]').click();

    // 체크박스가 선택됨을 확인
    await expect(
      page.locator('[data-testid="remember-checkbox"]')
    ).toBeChecked();

    // 이메일과 비밀번호 입력 후 로그인
    await page.locator("input#email").fill(testUser.email);
    await page.locator("input#password").fill(testUser.password);
    await page.locator('button[type="submit"]').click();

    // 로그인 성공 후 메인 페이지로 이동 확인
    await expect(page).toHaveURL("/");
  });

  test("회원가입 링크가 정상적으로 작동한다", async ({ page }) => {
    // "지금 가입하세요" 링크 클릭
    await page.locator("text=지금 가입하세요").click();

    // 회원가입 페이지로 이동 확인
    await expect(page).toHaveURL("/signup");
  });
});
