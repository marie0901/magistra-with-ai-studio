import { test, expect } from '@playwright/test';

test.describe('Magistra Demo Flow', () => {
  test('demo: complete learning session with translation and chat', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001');

    // Step 1: Welcome Screen - Continue Incognito
    await expect(page.locator('h1')).toContainText('Magistra');
    await page.click('text=Continue Incognito');

    // Step 2: Text Input Screen - Use Sample Text
    await expect(page.locator('h1')).toContainText('Choose Your Text');
    await page.click('text=Use Sample Text');

    // Step 3: Main Learning Interface loads
    await expect(page.locator('header').first()).toContainText('Magistra UI');
    
    // Verify all three windows are visible
    await expect(page.locator('text=Book View').first()).toBeVisible();
    await expect(page.locator('text=Learning Session').first()).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();

    // Step 4: Start learning session
    // Check if modal appears for learning mode selection
    const modeModal = page.locator('text=Select Learning Mode');
    if (await modeModal.isVisible()) {
      await page.click('text=Translate Mode');
    }

    // Step 5: Translation Practice - User starts learning session
    // Wait for learning session to be ready
    await expect(page.locator('text=Fragment 1 of 3')).toBeVisible();
    
    // User types translation for fragment
    const translationInput = page.locator('textarea[placeholder*="translation"]');
    await translationInput.fill('En el corazón de la extensa ciudad de Eldoria, donde la magia y la maquinaria coexistían en un delicado equilibrio, vivía una joven inventora llamada Elara.');
    
    // Click Check Translation button
    await page.click('text=Check Translation');
    
    // Step 6: Gets real AI evaluation and score (mocked for now)
    await expect(page.locator('text=Evaluation')).toBeVisible({ timeout: 10000 });
    
    // Verify score appears
    await expect(page.locator('text=/\\d+\\/100/')).toBeVisible();
    
    // Verify feedback appears
    await expect(page.locator('text=CORRECT TRANSLATION')).toBeVisible();
    
    // Show the evaluation for a moment
    await page.waitForTimeout(2000);

    // Step 7: Basic chat functionality works with real AI
    // Click on AI Assistant window to focus it
    await page.click('text=AI Assistant');
    
    // Switch to Chat tab if not already active
    const chatTab = page.locator('button:has-text("Chat")');
    if (await chatTab.isVisible()) {
      await chatTab.click();
    }
    
    // Type a question in chat
    const chatInput = page.locator('input[placeholder*="Ask a question"]');
    await chatInput.fill('What does "inventora" mean in English?');
    
    // Find the send button
    const sendButton = page.locator('button').filter({ hasText: /send/i }).or(
      page.locator('button[title*="Send"]')
    ).or(
      page.locator('input[placeholder*="Ask"] + button')
    );
    
    // Send the message
    await sendButton.click();
    
    // Verify AI response (mocked)
    await expect(page.locator('text=That\'s a great question!')).toBeVisible({ timeout: 5000 });
    
    // Show the chat response for a moment
    await page.waitForTimeout(2000);

    // Step 8: Continue with next fragment to show workflow
    await page.click('text=Next Fragment');
    
    // Verify progress updated
    await expect(page.locator('text=Fragment 2 of 3')).toBeVisible();
    
    // Show the next fragment for a moment
    await page.waitForTimeout(1000);

    // Step 9: Show vocabulary tab
    await page.click('text=Vocabulary');
    await expect(page.locator('text=ancient').first()).toBeVisible();
    
    // Show vocabulary for a moment
    await page.waitForTimeout(1500);

    // End demo - show final state
    await page.click('text=Chat');
    await page.waitForTimeout(1000);
  });
});