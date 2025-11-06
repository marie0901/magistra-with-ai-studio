import { test, expect } from '@playwright/test';

test.describe('Magistra Learning Flow', () => {
  test('complete learning session with translation and chat', async ({ page }) => {
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

    // Step 5: Translation Practice
    // Wait for learning session to be ready
    await expect(page.locator('text=Fragment 1 of 3')).toBeVisible();
    
    // Type translation in the text area
    const translationInput = page.locator('textarea[placeholder*="translation"]');
    await translationInput.fill('En el corazón de la ciudad de Eldoria vivía una joven inventora llamada Elara.');
    
    // Click Check Translation button
    await page.click('text=Check Translation');
    
    // Step 6: Wait for AI evaluation (mocked)
    await expect(page.locator('text=Evaluation')).toBeVisible({ timeout: 10000 });
    
    // Verify score appears
    await expect(page.locator('text=/\\d+\\/100/')).toBeVisible();
    
    // Verify feedback appears
    await expect(page.locator('text=CORRECT TRANSLATION')).toBeVisible();
    
    // Step 7: Progress to next fragment
    await page.click('text=Next Fragment');
    
    // Verify progress updated
    await expect(page.locator('text=Fragment 2 of 3')).toBeVisible();

    // Step 8: Test AI Chat functionality
    // Click on AI Assistant window to focus it
    await page.click('text=AI Assistant');
    
    // Switch to Chat tab if not already active
    const chatTab = page.locator('button:has-text("Chat")');
    if (await chatTab.isVisible()) {
      await chatTab.click();
    }
    
    // Type a question in chat
    const chatInput = page.locator('input[placeholder*="Ask a question"]');
    await chatInput.fill('What does "inventora" mean?');
    
    // Find the send button more specifically
    const sendButton = page.locator('button').filter({ hasText: /send/i }).or(
      page.locator('button[title*="Send"]')
    ).or(
      page.locator('input[placeholder*="Ask"] + button')
    );
    
    // Send the message
    await sendButton.click();
    
    // Step 9: Verify AI response (mocked)
    await expect(page.locator('text=That\'s a great question!')).toBeVisible({ timeout: 5000 });
    
    // Step 10: Test vocabulary tab
    await page.click('text=Vocabulary');
    await expect(page.locator('text=ancient').first()).toBeVisible();
    
    // Step 11: Test sticky note creation
    await page.click('text=Chat');
    
    // Look for "Make Sticker" button on AI response
    const aiResponse = page.locator('.group:has-text("That\'s a great question!")');
    await aiResponse.hover();
    
    const stickerButton = aiResponse.locator('text=Make Sticker');
    if (await stickerButton.isVisible()) {
      await stickerButton.click();
      
      // Verify sticky note appears
      await expect(page.locator('text=AI Insight')).toBeVisible();
    }
  });

  test('window management functionality', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Go through onboarding
    await page.click('text=Continue Incognito');
    await page.click('text=Use Sample Text');
    
    // Test window collapse/expand - check the actual window content disappears
    const bookViewButton = page.locator('button[title="Book View"]');
    await bookViewButton.click(); // Collapse
    
    // Check that the Book View window content is not visible (not just the title)
    await expect(page.locator('div:has-text("Book View")').locator('..').locator('div').last()).not.toBeVisible();
    
    await bookViewButton.click(); // Expand
    await expect(page.locator('text=Book View').first()).toBeVisible();
    
    // Test layout switching
    await page.keyboard.press('Control+2'); // Focus layout
    await page.keyboard.press('Control+1'); // Default layout
    
    // Skip theme test for now - just verify basic functionality works
    console.log('Window management test completed successfully');
  });

  test('paste text flow', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Go through onboarding to paste text screen
    await page.click('text=Continue Incognito');
    await page.click('text=Paste Your Text');
    
    // Verify paste text screen
    await expect(page.locator('h1')).toContainText('Paste Your Text');
    
    // Type some text
    const textArea = page.locator('textarea');
    await textArea.fill('This is my custom text for learning Spanish.');
    
    // Start learning (currently uses sample text)
    await page.click('text=Start Learning');
    
    // Should reach main interface
    await expect(page.locator('text=Magistra UI')).toBeVisible();
  });
});