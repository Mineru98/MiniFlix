import { test, expect } from "@playwright/test";

test.describe("계정 설정 기능", () => {
  test.beforeEach(async ({ page }) => {
    // 계정 설정 페이지로 이동하기 전 로그인 처리
    await page.goto("/login");

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

    // 로그인 수행
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("login-button").click();

    // 계정 설정 페이지로 이동
    await page.goto("/account");
  });

  test.describe("이름 변경 기능", () => {
    test("이름 변경 모달이 올바르게 작동하는지 확인", async ({ page }) => {
      // 이름 변경 버튼 클릭
      await page.getByText("이름 변경").click();

      // 모달이 나타났는지 확인
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "이름 변경" })
      ).toBeVisible();

      // 필수 입력 필드가 있는지 확인
      await expect(page.getByLabel("새 이름")).toBeVisible();
      await expect(page.getByLabel("비밀번호 확인")).toBeVisible();

      // 취소 버튼을 클릭하면 모달이 닫히는지 확인
      await page.getByRole("button", { name: "취소" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("이름 변경 성공 시나리오", async ({ page }) => {
      // 이름 변경 API 모킹
      await page.route("**/api/users/update-name", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              user: {
                id: 1,
                email: "test@example.com",
                name: "새로운 이름",
                is_active: true,
                created_at: "2023-01-01T00:00:00Z",
              },
            },
            meta: {
              code: 200,
              message: "이름이 성공적으로 변경되었습니다.",
            },
          }),
        });
      });

      // 이름 변경 버튼 클릭
      await page.getByText("이름 변경").click();

      // 폼 입력
      await page.getByLabel("새 이름").fill("새로운 이름");
      await page.getByLabel("비밀번호 확인").fill("password123");

      // 변경하기 버튼 클릭
      await page.getByRole("button", { name: "변경하기" }).click();

      // 성공 메시지 확인
      await expect(
        page.getByText("이름이 성공적으로 변경되었습니다.")
      ).toBeVisible();
    });

    test("잘못된 비밀번호로 이름 변경 실패", async ({ page }) => {
      // 이름 변경 실패 API 모킹
      await page.route("**/api/users/update-name", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            meta: {
              code: 401,
              message: "비밀번호가 일치하지 않습니다.",
            },
          }),
        });
      });

      // 이름 변경 버튼 클릭
      await page.getByText("이름 변경").click();

      // 폼 입력
      await page.getByLabel("새 이름").fill("새로운 이름");
      await page.getByLabel("비밀번호 확인").fill("잘못된_비밀번호");

      // 변경하기 버튼 클릭
      await page.getByRole("button", { name: "변경하기" }).click();

      // 오류 메시지 확인
      await expect(
        page.getByText("비밀번호가 일치하지 않습니다.")
      ).toBeVisible();
    });
  });

  test.describe("비밀번호 변경 기능", () => {
    test("비밀번호 변경 모달이 올바르게 작동하는지 확인", async ({ page }) => {
      // 비밀번호 변경 버튼 클릭
      await page.getByText("비밀번호 변경").click();

      // 모달이 나타났는지 확인
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "비밀번호 변경" })
      ).toBeVisible();

      // 필수 입력 필드가 있는지 확인
      await expect(page.getByLabel("현재 비밀번호")).toBeVisible();
      await expect(page.getByLabel("새 비밀번호")).toBeVisible();
      await expect(page.getByLabel("새 비밀번호 확인")).toBeVisible();

      // 취소 버튼을 클릭하면 모달이 닫히는지 확인
      await page.getByRole("button", { name: "취소" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("비밀번호 변경 성공 시나리오", async ({ page }) => {
      // 비밀번호 변경 API 모킹
      await page.route("**/api/users/update-password", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            meta: {
              code: 200,
              message: "비밀번호가 성공적으로 변경되었습니다.",
            },
          }),
        });
      });

      // 비밀번호 변경 버튼 클릭
      await page.getByText("비밀번호 변경").click();

      // 폼 입력
      await page.getByLabel("현재 비밀번호").fill("password123");
      await page.getByLabel("새 비밀번호").fill("newpassword123");
      await page.getByLabel("새 비밀번호 확인").fill("newpassword123");

      // 변경하기 버튼 클릭
      await page.getByRole("button", { name: "변경하기" }).click();

      // 성공 메시지 확인
      await expect(
        page.getByText("비밀번호가 성공적으로 변경되었습니다.")
      ).toBeVisible();
    });

    test("비밀번호 불일치로 변경 실패", async ({ page }) => {
      // 비밀번호 변경 버튼 클릭
      await page.getByText("비밀번호 변경").click();

      // 폼 입력 (비밀번호 확인 불일치)
      await page.getByLabel("현재 비밀번호").fill("password123");
      await page.getByLabel("새 비밀번호").fill("newpassword123");
      await page.getByLabel("새 비밀번호 확인").fill("differentpassword");

      // 변경하기 버튼 클릭
      await page.getByRole("button", { name: "변경하기" }).click();

      // 오류 메시지 확인 (프론트엔드 검증)
      await expect(
        page.getByText("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.")
      ).toBeVisible();
    });

    test("현재 비밀번호 오류로 변경 실패", async ({ page }) => {
      // 비밀번호 변경 실패 API 모킹
      await page.route("**/api/users/update-password", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            meta: {
              code: 401,
              message: "현재 비밀번호가 일치하지 않습니다.",
            },
          }),
        });
      });

      // 비밀번호 변경 버튼 클릭
      await page.getByText("비밀번호 변경").click();

      // 폼 입력
      await page.getByLabel("현재 비밀번호").fill("잘못된_현재_비밀번호");
      await page.getByLabel("새 비밀번호").fill("newpassword123");
      await page.getByLabel("새 비밀번호 확인").fill("newpassword123");

      // 변경하기 버튼 클릭
      await page.getByRole("button", { name: "변경하기" }).click();

      // 오류 메시지 확인
      await expect(
        page.getByText("현재 비밀번호가 일치하지 않습니다.")
      ).toBeVisible();
    });
  });
});
