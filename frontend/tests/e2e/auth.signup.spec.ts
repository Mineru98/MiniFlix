import { test, expect } from "@playwright/test";

test.describe("회원가입 기능", () => {
  test("유효한 정보로 회원가입을 할 수 있다", async ({ page }) => {
    // 회원가입 페이지 방문
    await page.goto("/signup");

    // 페이지 타이틀 확인
    await expect(page.locator("h1")).toContainText("회원가입");

    // 테스트용 무작위 이메일 생성 (중복 방지)
    const randomEmail = `test${Date.now()}@example.com`;

    // 회원가입 폼 작성
    await page.locator("input#email").fill(randomEmail);
    await page.locator("input#name").fill("테스트 사용자");
    await page.locator("input#password").fill("password123");
    await page.locator("input#confirmPassword").fill("password123");

    // 폼 제출
    await page.locator('button[type="submit"]').click();

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL("/login");
  });

  test("유효하지 않은 이메일로 회원가입 시 오류 메시지가 표시된다", async ({
    page,
  }) => {
    // 회원가입 페이지 방문
    await page.goto("/signup");

    // 유효하지 않은 이메일 입력
    await page.locator("input#email").fill("invalid-email");
    await page.locator("input#name").fill("테스트 사용자");
    await page.locator("input#password").fill("password123");
    await page.locator("input#confirmPassword").fill("password123");

    // 폼 제출
    await page.locator('button[type="submit"]').click();

    // 이메일 오류 메시지 확인
    await expect(
      page.locator("text=유효한 이메일 주소를 입력해주세요")
    ).toBeVisible();
  });

  test("비밀번호와 비밀번호 확인이 일치하지 않으면 오류 메시지가 표시된다", async ({
    page,
  }) => {
    // 회원가입 페이지 방문
    await page.goto("/signup");

    // 유효한 이메일 입력
    await page.locator("input#email").fill("test@example.com");
    await page.locator("input#name").fill("테스트 사용자");
    await page.locator("input#password").fill("password123");
    await page.locator("input#confirmPassword").fill("password456"); // 일치하지 않는 비밀번호

    // 폼 제출
    await page.locator('button[type="submit"]').click();

    // 비밀번호 불일치 오류 메시지 확인
    await expect(
      page.locator("text=비밀번호가 일치하지 않습니다")
    ).toBeVisible();
  });

  test("필수 입력 필드를 채우지 않으면 회원가입이 되지 않는다", async ({
    page,
  }) => {
    // 회원가입 페이지 방문
    await page.goto("/signup");

    // 빈 폼으로 제출 시도
    await page.locator('button[type="submit"]').click();

    // 이메일 필수 입력 메시지 확인
    await expect(page.locator("text=이메일을 입력해주세요")).toBeVisible();
  });
});
