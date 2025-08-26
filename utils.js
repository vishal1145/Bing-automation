function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Enhanced human-like typing with all the requested features
async function humanType(page, text) {
  const searchBox = page.locator('#sb_form_q');
  await searchBox.waitFor({ state: 'visible', timeout: 60000 });
  await searchBox.fill("");

  // Add human-like filler words and variations
  const enhancedText = addHumanVariations(text);
  
  // Simulate partial typing, corrections, and revisions
  await simulateHumanTyping(page, searchBox, enhancedText);
  
  // Random pause after typing before hitting Enter
  await page.waitForTimeout(randomInt(800, 2000));
}

// Add human-like variations to search queries
function addHumanVariations(text) {
  const variations = [
    `what is ${text}`,
    `how to ${text}`,
    `best way to ${text}`,
    `tips for ${text}`,
    `guide to ${text}`,
    `${text} help`,
    `${text} advice`,
    `learn about ${text}`,
    `${text} examples`,
    `${text} information`
  ];
  
  // 70% chance to use original text, 30% chance to add variations
  if (Math.random() < 0.3) {
    return variations[randomInt(0, variations.length - 1)];
  }
  
  return text;
}

// Simulate realistic human typing patterns with exact specifications
async function simulateHumanTyping(page, searchBox, text) {
  const words = text.split(' ');
  let currentText = '';
  
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    
    // Type word character by character with variable speed (80-300ms as specified)
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const char = word[charIndex];
      
      // EXACT SPECIFICATION: 80-300ms gaps between letters (and it varies)
      const typingDelay = randomInt(80, 300);
      
      // Occasionally make typos and correct them (8% chance)
      if (Math.random() < 0.08) {
        // Type wrong character
        const wrongChar = getRandomWrongChar(char);
        await searchBox.type(wrongChar, { delay: randomInt(50, 150) });
        await page.waitForTimeout(randomInt(100, 300));
        
        // Backspace and correct
        await page.keyboard.press("Backspace");
        await page.waitForTimeout(randomInt(50, 150));
      }
      
      // Occasionally hit shift late or early (irregular capitalization)
      if (Math.random() < 0.06) {
        // Simulate hitting shift too early or late
        if (Math.random() < 0.5) {
          // Hit shift too early - capitalize next character
          await page.keyboard.press("Shift");
          await page.waitForTimeout(randomInt(50, 150));
          await searchBox.type(char, { delay: typingDelay });
          await page.keyboard.press("Shift");
        } else {
          // Hit shift too late - capitalize current character
          await searchBox.type(char, { delay: typingDelay });
          await page.waitForTimeout(randomInt(50, 150));
          await page.keyboard.press("Backspace");
          await page.keyboard.press("Shift");
          await searchBox.type(char.toUpperCase(), { delay: typingDelay });
          await page.keyboard.press("Shift");
        }
      } else {
        // Type the correct character normally
        await searchBox.type(char, { delay: typingDelay });
      }
      
      // EXACT SPECIFICATION: Micro-pauses ~0.5–2s when thinking of the next word
      if (Math.random() < 0.05) {
        const thinkingPause = randomInt(500, 2000);
        await page.waitForTimeout(thinkingPause);
      }
      
      // Random pause between characters (especially after spaces/punctuation)
      if (char === ' ' || char === '.' || char === '?' || char === '!') {
        await page.waitForTimeout(randomInt(200, 500));
      }
      
      // EXACT SPECIFICATION: Uneven rhythm: bursts of fast typing, then short stalls
      if (Math.random() < 0.15) {
        // Fast burst - type next few characters quickly
        const burstLength = randomInt(2, 4);
        const remainingChars = word.length - charIndex - 1;
        const actualBurstLength = Math.min(burstLength, remainingChars);
        
        for (let burst = 1; burst <= actualBurstLength; burst++) {
          if (charIndex + burst < word.length) {
            const nextChar = word[charIndex + burst];
            await searchBox.type(nextChar, { delay: randomInt(30, 80) }); // Faster typing during burst
            charIndex++; // Skip this character in main loop
          }
        }
        
        // Stall after burst
        await page.waitForTimeout(randomInt(300, 800));
      }
    }
    
    // Add space between words
    if (wordIndex < words.length - 1) {
      await searchBox.type(" ", { delay: randomInt(100, 300) });
      
      // Longer pause after certain words (thinking pause)
      if (word.toLowerCase() === 'what' || word.toLowerCase() === 'how' || word.toLowerCase() === 'best') {
        await page.waitForTimeout(randomInt(500, 1500));
      }
    }
    
    // EXACT SPECIFICATION: Corrections: backspaces, highlight + retype, or leaving typos uncorrected
    if (Math.random() < 0.12) {
      await page.waitForTimeout(randomInt(500, 1000));
      
      // 60% chance to correct, 40% chance to leave typo (more realistic)
      if (Math.random() < 0.6) {
        // Delete last few characters
        const deleteCount = randomInt(2, 5);
        for (let i = 0; i < deleteCount; i++) {
          await page.keyboard.press("Backspace");
          await page.waitForTimeout(randomInt(50, 150));
        }
        
        // Type alternative word
        const alternatives = getWordAlternatives(word);
        if (alternatives.length > 0) {
          const alternative = alternatives[randomInt(0, alternatives.length - 1)];
          await searchBox.type(alternative, { delay: randomInt(80, 200) });
        }
      } else {
        // Leave the typo (more human-like)
        console.log(`🤔 Leaving typo uncorrected for realism`);
      }
    }
    
    // EXACT SPECIFICATION: Micro-pauses ~0.5–2s when thinking of the next word
    if (Math.random() < 0.08) {
      const thinkingPause = randomInt(500, 2000);
      await page.waitForTimeout(thinkingPause);
    }
  }
}

// Get random wrong character for typos
function getRandomWrongChar(correctChar) {
  const nearbyKeys = {
    'a': ['q', 'w', 's', 'z'],
    's': ['a', 'w', 'e', 'd', 'z', 'x'],
    'd': ['s', 'e', 'r', 'f', 'x', 'c'],
    'f': ['d', 'r', 't', 'g', 'c', 'v'],
    'g': ['f', 't', 'y', 'h', 'v', 'b'],
    'h': ['g', 'y', 'u', 'j', 'b', 'n'],
    'j': ['h', 'u', 'i', 'k', 'n', 'm'],
    'k': ['j', 'i', 'o', 'l', 'm'],
    'l': ['k', 'o', 'p'],
    'q': ['w', 'a', '1', '2'],
    'w': ['q', 'e', 's', 'a', '2', '3'],
    'e': ['w', 'r', 'd', 's', '3', '4'],
    'r': ['e', 't', 'f', 'd', '4', '5'],
    't': ['r', 'y', 'g', 'f', '5', '6'],
    'y': ['t', 'u', 'h', 'g', '6', '7'],
    'u': ['y', 'i', 'j', 'h', '7', '8'],
    'i': ['u', 'o', 'k', 'j', '8', '9'],
    'o': ['i', 'p', 'l', 'k', '9', '0'],
    'p': ['o', 'l']
  };
  
  const nearby = nearbyKeys[correctChar.toLowerCase()] || ['x', 'z', 'q'];
  return nearby[randomInt(0, nearby.length - 1)];
}

// Get word alternatives for rephrasing
function getWordAlternatives(word) {
  const alternatives = {
    'what': ['how', 'why', 'when'],
    'how': ['what', 'why', 'when'],
    'best': ['good', 'great', 'top'],
    'tips': ['advice', 'suggestions', 'ideas'],
    'help': ['support', 'assistance', 'guidance'],
    'learn': ['study', 'understand', 'know'],
    'guide': ['tutorial', 'manual', 'instructions'],
    'examples': ['samples', 'instances', 'cases']
  };
  
  return alternatives[word.toLowerCase()] || [word];
}

// Enhanced smooth scrolling with natural pauses and occasional scroll up
async function smoothScroll(page, steps = 5) {
  for (let i = 0; i < steps; i++) {
    // Mostly scroll down, sometimes up (more realistic)
    const direction = Math.random() < 0.85 ? 1 : -1;
    
    // Variable scroll distance with natural acceleration
    const scrollDistance = randomInt(200, 1000);
    
    // Smooth scroll with natural acceleration/deceleration
    await page.mouse.wheel(0, direction * scrollDistance);
    
    // Pause to "read" content (longer pauses for reading)
    const readTime = randomInt(3000, 8000);
    await page.waitForTimeout(readTime);
    
    // Occasionally scroll back up a bit (like re-reading)
    if (Math.random() < 0.25) {
      await page.mouse.wheel(0, -randomInt(150, 400));
      await page.waitForTimeout(randomInt(1500, 4000));
    }
    
    // Sometimes pause longer to "think" about what was read
    if (Math.random() < 0.15) {
      await page.waitForTimeout(randomInt(2000, 5000));
    }
  }
}

// Human-like mouse movement with curves, overshooting, and natural patterns
async function humanMouseMove(page, targetX, targetY, startX = null, startY = null) {
  if (!startX || !startY) {
    const currentPos = await page.evaluate(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
    startX = currentPos.x;
    startY = currentPos.y;
  }
  
  // Calculate distance and create curved path
  const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
  const steps = Math.max(8, Math.floor(distance / 40)); // More steps for smoother movement
  
  // Create curved path with slight overshooting and natural acceleration
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    
    // Add natural curve to the path (more pronounced)
    const curveOffset = Math.sin(progress * Math.PI) * randomInt(15, 45);
    
    // Calculate position with curve
    let x = startX + (targetX - startX) * progress;
    let y = startY + (targetY - startY) * progress;
    
    // Add curve offset with natural variation
    x += curveOffset * Math.cos(progress * Math.PI + randomInt(-10, 10) * Math.PI / 180);
    y += curveOffset * Math.sin(progress * Math.PI + randomInt(-10, 10) * Math.PI / 180);
    
    // Move mouse to this position
    await page.mouse.move(x, y);
    
    // Variable delay between movements (slower at start, faster in middle, slower at end)
    let delay;
    if (progress < 0.2) {
      delay = randomInt(15, 40); // Slower at start
    } else if (progress > 0.8) {
      delay = randomInt(20, 50); // Slower at end
    } else {
      delay = randomInt(8, 25); // Faster in middle
    }
    await page.waitForTimeout(delay);
  }
  
  // Final movement with natural overshooting and correction
  if (Math.random() < 0.4) {
    // Overshoot slightly (more realistic)
    const overshootX = targetX + randomInt(-30, 30);
    const overshootY = targetY + randomInt(-30, 30);
    await page.mouse.move(overshootX, overshootY);
    await page.waitForTimeout(randomInt(80, 200));
    
    // Sometimes overshoot again (double correction)
    if (Math.random() < 0.3) {
      const secondOvershootX = targetX + randomInt(-15, 15);
      const secondOvershootY = targetY + randomInt(-15, 15);
      await page.mouse.move(secondOvershootX, secondOvershootY);
      await page.waitForTimeout(randomInt(50, 150));
    }
  }
  
  // Move to final target with natural hesitation
  await page.waitForTimeout(randomInt(30, 100));
  await page.mouse.move(targetX, targetY);
  
  // Sometimes make a tiny adjustment after reaching target
  if (Math.random() < 0.2) {
    await page.waitForTimeout(randomInt(50, 150));
    const finalAdjustX = targetX + randomInt(-5, 5);
    const finalAdjustY = targetY + randomInt(-5, 5);
    await page.mouse.move(finalAdjustX, finalAdjustY);
    await page.waitForTimeout(randomInt(30, 80));
    await page.mouse.move(targetX, targetY);
  }
}

// Natural reading delays and human-like pauses with more variation
async function humanPause(page, context = 'reading') {
  const pauseTimes = {
    'reading': randomInt(4000, 12000),      // Longer reading times
    'thinking': randomInt(1500, 6000),      // More varied thinking times
    'clicking': randomInt(800, 2500),       // More natural click delays
    'scrolling': randomInt(1500, 4500),     // Longer scroll pauses
    'hovering': randomInt(1200, 4000),     // More varied hover times
    'typing': randomInt(500, 2000),         // Typing pauses
    'navigating': randomInt(2000, 6000)     // Navigation pauses
  };
  
  const basePauseTime = pauseTimes[context] || randomInt(1500, 4500);
  
  // Add natural variation (±20% to make it less robotic)
  const variation = basePauseTime * randomInt(-20, 20) / 100;
  const finalPauseTime = Math.max(500, basePauseTime + variation);
  
  await page.waitForTimeout(finalPauseTime);
}

// Simulate human-like clicking with natural delays and behavior
async function humanClick(page, element, context = 'normal') {
  // Hover first (natural behavior)
  await element.hover();
  await humanPause(page, 'hovering');
  
  // Sometimes move mouse slightly before clicking (more realistic)
  if (Math.random() < 0.3) {
    const elementBox = await element.boundingBox();
    if (elementBox) {
      const slightOffsetX = randomInt(-10, 10);
      const slightOffsetY = randomInt(-10, 10);
      await page.mouse.move(
        elementBox.x + elementBox.width / 2 + slightOffsetX,
        elementBox.y + elementBox.height / 2 + slightOffsetY
      );
      await page.waitForTimeout(randomInt(100, 300));
    }
  }
  
  // Click with natural delay and sometimes double-click by accident
  const clickDelay = randomInt(150, 600);
  await element.click({ delay: clickDelay });
  
  // Sometimes accidentally double-click (5% chance)
  if (Math.random() < 0.05) {
    await page.waitForTimeout(randomInt(50, 150));
    await element.click({ delay: randomInt(50, 100) });
    console.log(`😅 Accidental double-click for realism`);
  }
  
  // Post-click pause with natural variation
  await humanPause(page, 'clicking');
}

// Simulate human-like tab management (opening 2-3 tabs, spending variable time on each)
async function simulateHumanTabBehavior(page, context, targetUrl) {
  // 60% chance to open multiple tabs (more realistic)
  if (Math.random() < 0.6) {
    const tabCount = randomInt(2, 3);
    console.log(`🔄 Opening ${tabCount} tabs for realistic browsing behavior...`);
    
    const tabs = [page];
    
    // Open additional tabs with different content
    for (let i = 1; i < tabCount; i++) {
      try {
        // Sometimes open related searches, sometimes random sites
        if (Math.random() < 0.7) {
          // Open related search in new tab
          const newPage = await context.newPage();
          await newPage.goto("https://www.bing.com", { waitUntil: "domcontentloaded" });
          await humanPause(newPage, 'reading');
          
          // Type a related keyword
          const relatedKeywords = [
            "best practices",
            "tutorial",
            "examples",
            "guide",
            "tips and tricks"
          ];
          const relatedKeyword = relatedKeywords[randomInt(0, relatedKeywords.length - 1)];
          
          const searchBox = newPage.locator('#sb_form_q');
          await searchBox.waitFor({ state: 'visible', timeout: 60000 });
          await searchBox.fill("");
          await simulateHumanTyping(newPage, searchBox, relatedKeyword);
          await humanPause(newPage, 'thinking');
          await newPage.keyboard.press("Enter");
          
          tabs.push(newPage);
          console.log(`📑 Opened related search tab: ${relatedKeyword}`);
        } else {
          // Open a random popular site
          const popularSites = [
            "https://www.wikipedia.org",
            "https://www.youtube.com",
            "https://www.reddit.com",
            "https://www.stackoverflow.com"
          ];
          const randomSite = popularSites[randomInt(0, popularSites.length - 1)];
          
          const newPage = await context.newPage();
          await newPage.goto(randomSite, { waitUntil: "domcontentloaded" });
          await humanPause(newPage, 'reading');
          
          tabs.push(newPage);
          console.log(`🌐 Opened random site tab: ${randomSite}`);
        }
      } catch (error) {
        console.log(`⚠️ Failed to open additional tab: ${error.message}`);
      }
    }
    
    // Simulate switching between tabs with variable time spent on each
    const totalTime = randomInt(30000, 90000); // 30-90 seconds total
    const startTime = Date.now();
    
    while (Date.now() - startTime < totalTime) {
      // Randomly switch to a different tab
      const currentTab = tabs[randomInt(0, tabs.length - 1)];
      if (!currentTab.isClosed()) {
        await currentTab.bringToFront();
        await humanPause(currentTab, 'navigating');
        
        // Spend variable time on this tab
        const tabTime = randomInt(5000, 20000);
        await page.waitForTimeout(tabTime);
        
        // Sometimes scroll or interact on the current tab
        if (Math.random() < 0.6) {
          await smoothScroll(currentTab, randomInt(1, 3));
        }
      }
    }
    
    // Close additional tabs (keep main page)
    for (let i = 1; i < tabs.length; i++) {
      if (!tabs[i].isClosed()) {
        await tabs[i].close();
      }
    }
    
    // Return to main page
    await page.bringToFront();
    console.log(`🔄 Closed additional tabs, returned to main page`);
  }
}

// Enhanced random mouse movements with more natural patterns
async function naturalMouseMovement(page) {
  // Sometimes move mouse in natural patterns (like reading)
  if (Math.random() < 0.4) {
    try {
      const viewport = page.viewportSize();
      if (viewport) {
        // Create a natural reading pattern (left to right, top to bottom)
        const readingPoints = [
          { x: randomInt(100, 300), y: randomInt(100, 300) },
          { x: randomInt(400, 600), y: randomInt(100, 300) },
          { x: randomInt(700, 900), y: randomInt(100, 300) },
          { x: randomInt(100, 300), y: randomInt(400, 600) },
          { x: randomInt(400, 600), y: randomInt(400, 600) },
          { x: randomInt(700, 900), y: randomInt(400, 600) }
        ];
        
        for (const point of readingPoints) {
          if (point.x < viewport.width && point.y < viewport.height) {
            await humanMouseMove(page, point.x, point.y);
            await page.waitForTimeout(randomInt(500, 1500));
          }
        }
      }
    } catch (e) {
      // ignore mouse movement errors
    }
  }
}

module.exports = {
  randomInt,
  humanType,
  smoothScroll,
  humanMouseMove,
  humanPause,
  humanClick,
  // simulateHumanTabBehavior,
  naturalMouseMovement
};