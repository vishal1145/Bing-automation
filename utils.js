function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulate human-like typing (random speed + occasional typo/backspace)
async function humanType(page, text) {
  const searchBox = page.locator('#sb_form_q');
  await searchBox.waitFor({ state: 'visible', timeout: 60000 });
  await searchBox.fill("");

  for (const char of text.split("")) {
    // variable typing speed
    await searchBox.type(char, { delay: randomInt(80, 250) });

    // Occasionally make a typo + backspace
    if (Math.random() < 0.05) {
      await searchBox.type("x", { delay: randomInt(80, 200) });
      await page.keyboard.press("Backspace");
    }
  }

  // Random pause after typing before hitting Enter
  await page.waitForTimeout(randomInt(500, 1500));
}

// Smooth, natural scrolling (with pauses + occasional scroll up)
async function smoothScroll(page, steps = 5) {
  for (let i = 0; i < steps; i++) {
    const direction = Math.random() < 0.85 ? 1 : -1; // mostly down, sometimes up
    await page.mouse.wheel(0, direction * randomInt(200, 600));

    // Pause to "read"
    await page.waitForTimeout(randomInt(1500, 4000));
  }
}

module.exports = {
  randomInt,
  humanType,
  smoothScroll
};
