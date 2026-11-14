import { chromium } from 'playwright';

async function testGame() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to home page...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  console.log('Clicking Bottle Puzzle...');
  await page.click('text=Bottle Puzzle');
  await page.waitForLoadState('networkidle');

  console.log('Waiting for hydration...');
  await page.waitForTimeout(5000);

  // Check if board cells are there
  const cells = await page.$$('button[aria-label^="Row"], button[aria-label^="Target:"]');
  console.log('Board cells found:', cells.length);

  if (cells.length === 0) {
    // Try alternative - wait for any button
    await page.waitForSelector('button', { timeout: 5000 });
    const allButtons = await page.$$('button');
    console.log('All buttons found:', allButtons.length);

    // Check their aria-labels
    for (const btn of allButtons.slice(0, 30)) {
      const label = await btn.getAttribute('aria-label');
      if (label) console.log('Button:', label);
    }
  }

  await browser.close();
  console.log('Test complete!');
}

testGame().catch(console.error);