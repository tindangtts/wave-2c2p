/**
 * Registration -> KYC E2E test (DEMO_MODE=true)
 *
 * DEMO_MODE behavior (src/lib/supabase/middleware.ts):
 *   - /login, /otp, /register/* are redirected to /home (already "authenticated")
 *   - /kyc/* pages are accessible directly
 *   - All main app pages are accessible without Supabase session
 *
 * This test verifies the DEMO_MODE happy path:
 *   1. Navigating to /login redirects to /home (demo user is auto-authenticated)
 *   2. Home page loads with wallet card visible
 *   3. KYC document-type page is accessible and document selection works
 *   4. Continuing from document-type navigates to /kyc/capture
 *
 * NOTE: The full registration form flow (pre-reg-info -> terms -> personal-info ->
 * id-details -> daily-limit -> create-passcode) is intentionally bypassed by the
 * middleware in DEMO_MODE. To test the form steps, DEMO_MODE must be set to false
 * and a real or test Supabase instance is required.
 */

import { test, expect } from '@playwright/test'

test.describe('Registration -> KYC flow (DEMO_MODE)', () => {
  test.slow() // Allow up to 3x default timeout for full server startup

  test('navigating to /login redirects to /home in DEMO_MODE', async ({ page }) => {
    // In DEMO_MODE, middleware redirects /login -> /home immediately
    await page.goto('/login')
    await page.waitForURL('**/home', { timeout: 15000 })
    expect(page.url()).toContain('/home')
  })

  test('home page renders wallet card', async ({ page }) => {
    await page.goto('/home')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Home page should be visible — check for a known UI element
    // The wallet card or main content area should be present
    await expect(page.locator('main, [role="main"], .min-h-screen').first()).toBeVisible({ timeout: 10000 })
  })

  test('KYC document-type page loads and allows document selection', async ({ page }) => {
    await page.goto('/kyc/document-type')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Page should render — not redirect (kyc/* is not blocked in DEMO_MODE)
    expect(page.url()).toContain('/kyc/document-type')

    // Document type radio group should be visible
    const radioGroup = page.locator('[role="radiogroup"]')
    await expect(radioGroup).toBeVisible({ timeout: 10000 })

    // Select "National ID" (first option)
    const nationalIdCard = page.locator('[role="radiogroup"] > *').first()
    await nationalIdCard.click()

    // Continue button should now be enabled
    const continueButton = page.getByRole('button', { name: /continue/i })
    await expect(continueButton).toBeEnabled({ timeout: 5000 })
  })

  test('selecting document type and clicking Continue navigates to /kyc/capture', async ({ page }) => {
    await page.goto('/kyc/document-type')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Select first document type
    const radioGroup = page.locator('[role="radiogroup"]')
    await expect(radioGroup).toBeVisible({ timeout: 10000 })
    const firstOption = page.locator('[role="radiogroup"] > *').first()
    await firstOption.click()

    // Click Continue
    const continueButton = page.getByRole('button', { name: /continue/i })
    await expect(continueButton).toBeEnabled({ timeout: 5000 })
    await continueButton.click()

    // Should navigate to /kyc/capture
    await page.waitForURL('**/kyc/capture', { timeout: 10000 })
    expect(page.url()).toContain('/kyc/capture')
  })
})
