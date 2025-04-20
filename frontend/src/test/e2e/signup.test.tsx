import { test, expect } from '@playwright/test';

// 테스트용 사용자 데이터
const TEST_USER = {
  email: 'test@example.com',
  name: '테스트 사용자',
  password: 'test1234',
};

test.describe('회원가입 페이지', () => {
  test('회원가입 페이지에 접근할 수 있다', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/login');
    
    // "지금 가입하세요" 링크를 클릭
    await page.click('text=지금 가입하세요.');
    
    // 회원가입 페이지로 이동했는지 확인
    await expect(page).toHaveURL('/signup');
    
    // 회원가입 페이지의 제목이 올바른지 확인
    await expect(page.locator('h1')).toHaveText('회원가입');
  });
  
  test('유효하지 않은 이메일로 회원가입 시도 시 에러 메시지가 표시된다', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto('/signup');
    
    // 잘못된 이메일 형식 입력
    await page.fill('input#email', 'invalid-email');
    await page.fill('input#name', TEST_USER.name);
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', TEST_USER.password);
    
    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await expect(page.locator('text=유효한 이메일 주소를 입력해주세요.')).toBeVisible();
  });
  
  test('비밀번호가 일치하지 않을 때 에러 메시지가 표시된다', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto('/signup');
    
    // 비밀번호 불일치 정보 입력
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#name', TEST_USER.name);
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', 'different-password');
    
    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await expect(page.locator('text=비밀번호가 일치하지 않습니다.')).toBeVisible();
  });
  
  test('유효한 데이터로 회원가입이 성공하면 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    // 회원가입 API 요청을 모의(mock)하기
    await page.route('**/api/auth/register', async (route) => {
      const json = JSON.parse(await route.request().postData() || '{}');
      
      // 요청 데이터가 예상한 데이터와 일치하는지 확인
      expect(json.email).toBe(TEST_USER.email);
      expect(json.name).toBe(TEST_USER.name);
      expect(json.password).toBe(TEST_USER.password);
      
      // 성공 응답 반환
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: '회원가입 성공',
          data: {
            id: 1,
            email: TEST_USER.email,
            name: TEST_USER.name,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        }),
      });
    });
    
    // 회원가입 페이지로 이동
    await page.goto('/signup');
    
    // 유효한 데이터 입력
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#name', TEST_USER.name);
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', TEST_USER.password);
    
    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 페이지로 리다이렉트되었는지 확인 (회원가입 성공 시)
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
}); 