/**
 * Transfer confirmation -> receipt E2E test (DEMO_MODE=true)
 *
 * DEMO_MODE behavior relevant to this test:
 *   - /transfer/* pages are accessible (no Supabase session required)
 *   - /api/recipients returns pre-seeded DEMO_RECIPIENTS (Min Zaw, Sam Smith, Vy Savanntepy)
 *   - /api/mock-payment/process-transfer accepts any amount/channel and returns success immediately
 *   - /api/auth/passcode/verify accepts any valid 6-digit passcode
 *   - /api/mock-payment/status/:id progresses to "success" after ~3s
 *
 * Transfer happy path:
 *   1. Navigate to /home (DEMO_MODE auto-authenticates)
 *   2. Navigate to /transfer/recipient — select "Min Zaw" (pre-seeded favorite)
 *   3. /transfer/amount — enter 100 THB (minimum allowed), click Next
 *   4. /transfer/channel — select "Wave Agent", click Next
 *   5. /transfer/confirm — verify summary visible, click Confirm
 *   6. Passcode sheet — enter 6-digit passcode (any valid code in DEMO_MODE)
 *   7. /transfer/receipt — verify URL contains /receipt and receipt content is shown
 */

import { test, expect } from '@playwright/test'

test.describe('Transfer flow', () => {
  test.slow() // Allow up to 3x default timeout for multi-step flow

  test('completes transfer confirmation and shows receipt', async ({ page }) => {
    // Step 1: Start from home (DEMO_MODE auto-authenticates at /home)
    await page.goto('/home')
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    expect(page.url()).toContain('/home')

    // Step 2: Navigate to recipient selection page
    await page.goto('/transfer/recipient')
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    expect(page.url()).toContain('/transfer/recipient')

    // Wait for the recipient list to load (API call to /api/recipients)
    // DEMO_RECIPIENTS: Min Zaw (favorite), Vy Savanntepy (favorite), Sam Smith
    // "Min Zaw" has is_favorite: true — appears in Favorites section
    const minZawRow = page.getByText('Min Zaw').first()
    await expect(minZawRow).toBeVisible({ timeout: 10000 })
    await minZawRow.click()

    // Step 3: Amount page — guard redirects here after recipient selection
    await page.waitForURL('**/transfer/amount', { timeout: 10000 })
    expect(page.url()).toContain('/transfer/amount')

    // Wait for rate fetch to complete (loader disappears)
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Enter 100 THB using the custom keypad
    // AmountInput buttons have aria-label matching the digit character
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '0' }).click()
    await page.getByRole('button', { name: '0' }).click()

    // Verify the amount display shows "100"
    const amountDisplay = page.locator('span').filter({ hasText: /^100$/ }).first()
    await expect(amountDisplay).toBeVisible({ timeout: 5000 })

    // Click Next — should be enabled (100 THB is valid minimum)
    // Use exact match to avoid matching "Next.js Dev Tools" button in dev mode
    const nextButton = page.getByRole('button', { name: 'Next', exact: true })
    await expect(nextButton).toBeEnabled({ timeout: 5000 })
    await nextButton.click()

    // Step 4: Channel selection page
    await page.waitForURL('**/transfer/channel', { timeout: 10000 })
    expect(page.url()).toContain('/transfer/channel')

    // Select "Wave Agent" channel card
    // Channel cards are buttons — the channel name text is inside
    const waveAgentCard = page.getByRole('button', { name: /wave agent/i })
    await expect(waveAgentCard).toBeVisible({ timeout: 5000 })
    await waveAgentCard.click()

    // Click Next (exact match to avoid dev tools button)
    const channelNextButton = page.getByRole('button', { name: 'Next', exact: true })
    await expect(channelNextButton).toBeEnabled({ timeout: 5000 })
    await channelNextButton.click()

    // Step 5: Confirmation page
    await page.waitForURL('**/transfer/confirm', { timeout: 10000 })
    expect(page.url()).toContain('/transfer/confirm')

    // Verify confirmation summary shows transfer details
    await expect(page.getByText('Confirmation')).toBeVisible({ timeout: 5000 })

    // Verify sender/receiver card is visible (ArrowDown separator present)
    await expect(page.getByText('Min Zaw').first()).toBeVisible({ timeout: 5000 })

    // Verify the Confirm button is present
    const confirmButton = page.getByRole('button', { name: /^confirm$/i })
    await expect(confirmButton).toBeVisible({ timeout: 5000 })
    await confirmButton.click()

    // Step 6: Passcode sheet opens — enter any valid 6-digit passcode
    // PasscodeKeypad renders digit buttons with aria-label matching the digit
    // In DEMO_MODE, /api/auth/passcode/verify accepts any valid 6-digit code
    const passcodeDrawer = page.locator('[data-vaul-drawer]').first()
    await expect(passcodeDrawer).toBeVisible({ timeout: 10000 })

    // Enter passcode: 1 2 3 4 5 6
    // PasscodeKeypad uses the same button structure as AmountInput
    for (const digit of ['1', '2', '3', '4', '5', '6']) {
      await page.getByRole('button', { name: digit }).last().click()
    }

    // Step 7: Wait for receipt page
    // After passcode verification, the confirm page submits the transfer and
    // navigates to /transfer/receipt. The receipt page polls status until success.
    await page.waitForURL('**/transfer/receipt', { timeout: 15000 })
    expect(page.url()).toContain('/transfer/receipt')

    // Verify receipt page header — title_receipt translates to "Transaction Detail"
    await expect(page.getByText('Transaction Detail').first()).toBeVisible({ timeout: 10000 })

    // Wait for status to progress to success (status API: >= 3000ms elapsed -> success)
    // The receipt shows a Close button (cta_close = "Close") once the page is fully rendered
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible({ timeout: 15000 })
  })
})
