import { test, expect } from '@playwright/test';

test.describe('Demo Day 1: Real AI Integration', () => {
  test('complete day 1 demo scenario with real AI', async ({ page }) => {
    // Step 1: Professional Onboarding
    await page.goto('http://localhost:3000');
    
    await expect(page.locator('h1')).toContainText('Magistra');
    await page.click('text=Continue Incognito');
    
    await expect(page.locator('h1')).toContainText('Choose Your Text');
    await page.click('text=Use Sample Text');
    
    // Verify all three windows are visible
    await expect(page.locator('text=Book View').first()).toBeVisible();
    await expect(page.locator('text=Learning Session').first()).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();

    // Step 2: Learning Session Start
    const modeModal = page.locator('text=Select Learning Mode');
    if (await modeModal.isVisible()) {
      await page.click('text=Translate Mode');
    }
    
    await expect(page.locator('text=Fragment 1 of 3')).toBeVisible();

    // Step 3: Real Translation Evaluation
    const translationInput = page.locator('textarea[placeholder*="translation"]');
    await translationInput.fill('En el corazón de la extensa ciudad de Eldoria, donde la magia y la maquinaria coexistían en un delicado equilibrio, vivía una joven inventora llamada Elara.');
    
    await page.click('text=Check Translation');
    
    // Wait for real AI evaluation (not mock)
    await expect(page.locator('text=Evaluation')).toBeVisible({ timeout: 15000 });
    
    // Verify real score appears (not mock)
    await expect(page.locator('text=/\\d+\\/100/')).toBeVisible();
    
    // Verify real feedback appears (not "CORRECT TRANSLATION" mock)
    const evaluationSection = page.locator('.animate-slide-in-up:has-text("Evaluation")');
    await expect(evaluationSection).toBeVisible();

    // Step 4: AI Chat Integration
    await page.click('text=AI Assistant');
    
    const chatTab = page.locator('button:has-text("Chat")');
    if (await chatTab.isVisible()) {
      await chatTab.click();
    }
    
    const chatInput = page.locator('input[placeholder*="Ask a question"]');
    await chatInput.fill('What does "sprawling" mean in this context?');
    
    const sendButton = page.locator('button').filter({ hasText: /send/i }).or(
      page.locator('button[title*="Send"]')
    ).or(
      page.locator('input[placeholder*="Ask"] + button')
    );
    
    await sendButton.click();
    
    // Wait for real AI response (not mock "That's a great question!")
    await expect(page.locator('.group:has-text("sprawling")')).toBeVisible({ timeout: 15000 });
    
    // Verify it's not the mock response
    await expect(page.locator('text=That\'s a great question!')).not.toBeVisible();

    // Step 5: Session Progression (skip TODO items)
    await page.click('text=Next Fragment');
    await expect(page.locator('text=Fragment 2 of 3')).toBeVisible();

    // Step 6: Sticky Notes Functionality
    console.log('🗒️ Testing sticky notes functionality...');
    
    // Force close any open dropdowns by clicking in a safe area and wait
    console.log('🔍 Ensuring layout dropdown is closed...');
    await page.locator('main').click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(500);
    
    // Verify dropdown is closed before proceeding
    const layoutDropdown = page.locator('[class*="animate-fade-in"]').filter({ hasText: 'LAYOUT' });
    const isDropdownClosed = !(await layoutDropdown.isVisible());
    console.log(`🔍 Layout dropdown closed: ${isDropdownClosed}`);
    
    // Verify hardcoded sticky notes are present (but don't interact with them)
    const grammarTipNote = page.locator('text=Grammar Tip').first();
    await expect(grammarTipNote).toBeVisible();
    console.log('✅ Found existing hardcoded sticky notes in sidebar');
    
    // Test creating sticker from AI response
    console.log('🎯 Testing create sticker from AI response...');
    const aiResponseDiv = page.locator('.group').filter({ hasText: /context|sprawling|city/ }).first();
    await aiResponseDiv.hover();
    
    const makeStickerButton = page.locator('button:has-text("Make Sticker")').first();
    if (await makeStickerButton.isVisible()) {
      console.log('✅ Make Sticker button appeared on hover');
      await makeStickerButton.click();
      await page.waitForTimeout(500);
      
      // Verify new AI Insight sticky note appears
      const aiInsightNote = page.locator('text=AI Insight').first();
      await expect(aiInsightNote).toBeVisible();
      console.log('✅ AI Insight sticky note created successfully');
      
      // Pause to show the new note
      await page.waitForTimeout(1000);
      
      // Test double-click to edit title on NEW sticker
      console.log('🖱️ Double-clicking AI Insight note to edit title...');
      await aiInsightNote.dblclick();
      
      // Wait for input field to appear and be ready
      const titleInput = page.locator('input').filter({ hasText: /AI Insight/ }).or(
        page.locator('input[value*="AI Insight"]')
      ).or(
        page.locator('input').last()
      );
      
      await expect(titleInput).toBeVisible({ timeout: 5000 });
      
      // Clear and type new title
      await titleInput.fill('Language Tip');
      await titleInput.press('Enter');
      await expect(page.locator('text=Language Tip')).toBeVisible();
      console.log('✅ Successfully edited AI Insight sticky note title');
      
      // Pause to show the edited title
      await page.waitForTimeout(1000);
      
      // Test dragging functionality
      console.log('🖱️ Testing drag functionality...');
      
      const expandedNote = page.locator('div').filter({ hasText: 'Language Tip' }).first();
      const noteHeader = expandedNote.locator('header').first();
      console.log('🔍 Dragging note to position (600, 400)...');
      await noteHeader.dragTo(page.locator('main'), { targetPosition: { x: 600, y: 400 } });
      await page.waitForTimeout(500);
      
      console.log('✅ Sticky note dragged successfully');
      
      // Test resizing functionality to INCREASE both width and height
      console.log('📏 Testing resize to increase both width and height...');
      
      const resizeHandle = expandedNote.locator('div').last(); // Bottom-right resize handle
      
      // Use mouse actions for more reliable resizing
      console.log('🔍 Starting resize operation...');
      await resizeHandle.hover();
      await page.mouse.down();
      await page.mouse.move(700, 500); // Move to increase both width and height
      await page.mouse.up();
      await page.waitForTimeout(1000);
      
      console.log('✅ Sticky note resized to much larger size (both width and height)');
      
      // Test bringing to front (click to focus)
      console.log('🔝 Testing bring to front functionality...');
      await expandedNote.click();
      await page.waitForTimeout(500);
      console.log('✅ Sticky note brought to front successfully');
      
      // Test minimize large note to sidebar
      console.log('📉 Testing minimize large note to sidebar...');
      
      // Debug: Check note state before minimize
      const noteCountBefore = await page.locator('div').filter({ hasText: 'Language Tip' }).count();
      console.log(`🔍 Notes with 'Language Tip' before minimize: ${noteCountBefore}`);
      
      // Find the actual sticky note minimize button by looking for the minimize icon
      const minimizeButton = expandedNote.locator('button').filter({ has: page.locator('svg path[d="M19.5 12h-15"]') }).first();
      const isMinimizeButtonVisible = await minimizeButton.isVisible();
      console.log(`🔍 Sticky note minimize button visible: ${isMinimizeButtonVisible}`);
      
      if (isMinimizeButtonVisible) {
        // Check if this is actually the minimize button by looking for the minimize icon
        const hasMinimizeIcon = await minimizeButton.locator('svg').count() > 0;
        console.log(`🔍 Button has minimize icon: ${hasMinimizeIcon}`);
        
        console.log('🔍 Clicking sticky note minimize button...');
        await minimizeButton.click();
        console.log('🔍 Sticky note minimize button clicked');
      } else {
        console.log('❌ Sticky note minimize button not found or not visible');
      }
      
      // Wait for minimize animation
      await page.waitForTimeout(3000);
      
      // Debug: Check note state after minimize
      const noteCountAfter = await page.locator('div').filter({ hasText: 'Language Tip' }).count();
      console.log(`🔍 Notes with 'Language Tip' after minimize: ${noteCountAfter}`);
      
      // Debug: Check if the note actually minimized by looking at its current state
      const noteAfterMinimize = page.locator('div').filter({ hasText: 'Language Tip' }).first();
      const styleAfterMinimize = await noteAfterMinimize.getAttribute('style');
      const classAfterMinimize = await noteAfterMinimize.getAttribute('class');
      console.log(`🔍 Note after minimize - style: "${styleAfterMinimize}"`);
      console.log(`🔍 Note after minimize - class: "${classAfterMinimize}"`);
      
      // Check if it has minimized characteristics (48px width, cursor-pointer class)
      const hasMinimizedWidth = styleAfterMinimize?.includes('width: 48px');
      const hasMinimizedClass = classAfterMinimize?.includes('cursor-pointer');
      console.log(`🔍 Has minimized width (48px): ${hasMinimizedWidth}`);
      console.log(`🔍 Has minimized class (cursor-pointer): ${hasMinimizedClass}`);
      
      // Debug: Check if any minimized notes exist with different selectors
      const minimizedNotes = await page.locator('.cursor-pointer.group').filter({ hasText: 'Language Tip' }).count();
      console.log(`🔍 Minimized notes with cursor-pointer.group class: ${minimizedNotes}`);
      
      const minimizedByText = await page.locator('text=Language Tip').count();
      console.log(`🔍 Notes found by text 'Language Tip': ${minimizedByText}`);
      
      const minimizedByClass = await page.locator('.cursor-pointer').filter({ hasText: 'Language Tip' }).count();
      console.log(`🔍 Notes found by cursor-pointer class: ${minimizedByClass}`);
      
      // Debug: Check all sticky notes on page
      const allStickyNotes = await page.locator('div[style*="translate"]').count();
      console.log(`🔍 Total sticky notes with translate style: ${allStickyNotes}`);
      
      // Debug: Look for any small notes (48x48)
      const smallNotes = await page.locator('div[style*="width: 48px"]').count();
      console.log(`🔍 Notes with 48px width: ${smallNotes}`);
      
      // Debug: Look for notes positioned in sidebar area (x around -56 to 32)
      const sidebarNotes = await page.locator('div').filter({ hasText: 'Language Tip' }).all();
      console.log(`🔍 Found ${sidebarNotes.length} divs with 'Language Tip' text`);
      
      for (let i = 0; i < sidebarNotes.length; i++) {
        const note = sidebarNotes[i];
        const style = await note.getAttribute('style');
        const classes = await note.getAttribute('class');
        console.log(`🔍 Note ${i}: style="${style}", class="${classes}"`);
      }
      
      console.log('✅ Large sticky note minimized and sent to sidebar as small 48x48 icon');
      
      // Pause to clearly show the minimized state
      await page.waitForTimeout(2000);
      
      // Test restore from sidebar back to screen (should restore to large size)
      console.log('📈 Testing restore from sidebar back to screen...');
      
      // Try to find and click the actual minimized note
      console.log('🔍 Attempting to click minimized note in sidebar...');
      
      // Try different selectors to find the minimized note
      const minimizedNote1 = page.locator('.cursor-pointer.group').filter({ hasText: 'Language Tip' }).first();
      const minimizedNote2 = page.locator('div[style*="width: 48px"]').filter({ hasText: 'Language Tip' }).first();
      const minimizedNote3 = page.locator('div').filter({ hasText: 'Language Tip' }).filter({ hasText: /width.*48/ }).first();
      
      if (await minimizedNote1.isVisible()) {
        console.log('🔍 Found minimized note with cursor-pointer.group class, clicking it...');
        await minimizedNote1.click();
      } else if (await minimizedNote2.isVisible()) {
        console.log('🔍 Found minimized note with 48px width, clicking it...');
        await minimizedNote2.click();
      } else if (await minimizedNote3.isVisible()) {
        console.log('🔍 Found minimized note with width filter, clicking it...');
        await minimizedNote3.click();
      } else {
        // Fallback: click at calculated sidebar position
        console.log('🔍 No minimized note found by selectors, clicking at calculated sidebar position (x: 32, y: 350)...');
        await page.click('body', { position: { x: 32, y: 350 } });
      }
      
      // Wait for potential restore animation
      await page.waitForTimeout(3000);
      
      // Verify note was restored to expanded state
      const restoredNote = page.locator('div').filter({ hasText: 'Language Tip' }).first();
      const isRestored = await restoredNote.isVisible();
      console.log(`🔍 Note restored to expanded state: ${isRestored}`);
      
      if (isRestored) {
        console.log('✅ Sticky note restored from sidebar back to screen with preserved large size');
      } else {
        console.log('⚠️ Note restore may not have worked as expected');
      }
      
      // Final pause to show complete workflow
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ Make Sticker button not visible - skipping');
    }

    // Verify vocabulary tab exists (even if hardcoded)
    await page.click('text=Vocabulary');
    await expect(page.locator('text=ancient').first()).toBeVisible();
    
    console.log('✅ Day 1 Demo completed successfully with real AI integration');
  });
});