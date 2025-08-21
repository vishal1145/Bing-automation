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

// Simulate realistic human typing patterns
async function simulateHumanTyping(page, searchBox, text) {
  const words = text.split(' ');
  let currentText = '';
  
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    
    // Type word character by character with variable speed
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const char = word[charIndex];
      
      // Variable typing speed (50-200ms between letters)
      const typingDelay = randomInt(50, 200);
      
      // Occasionally make typos and correct them
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
      
      // Random pause between characters (especially after spaces/punctuation)
      if (char === ' ' || char === '.' || char === '?' || char === '!') {
        await page.waitForTimeout(randomInt(200, 500));
      }
      
      // Occasional longer pause to "think"
      if (Math.random() < 0.05) {
        await page.waitForTimeout(randomInt(500, 1500));
      }
    }
    
    // Add space between words
    if (wordIndex < words.length - 1) {
      await searchBox.type(" ", { delay: randomInt(100, 300) });
      
      // Longer pause after certain words
      if (word.toLowerCase() === 'what' || word.toLowerCase() === 'how' || word.toLowerCase() === 'best') {
        await page.waitForTimeout(randomInt(300, 800));
      }
    }
    
    // Occasionally delete and rephrase (partial inputs/revisions)
    if (Math.random() < 0.12) {
      await page.waitForTimeout(randomInt(500, 1000));
      
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
    const direction = Math.random() < 0.9 ? 1 : -1;
    
    // Variable scroll distance
    const scrollDistance = randomInt(150, 800);
    
    // Smooth scroll with natural acceleration/deceleration
    await page.mouse.wheel(0, direction * scrollDistance);
    
    // Pause to "read" content (longer pauses for reading)
    const readTime = randomInt(2000, 6000);
    await page.waitForTimeout(readTime);
    
    // Occasionally scroll back up a bit (like re-reading)
    if (Math.random() < 0.15) {
      await page.mouse.wheel(0, -randomInt(100, 300));
      await page.waitForTimeout(randomInt(1000, 3000));
    }
  }
}

// Human-like mouse movement with curves and overshooting
async function humanMouseMove(page, targetX, targetY, startX = null, startY = null) {
  if (!startX || !startY) {
    const currentPos = await page.evaluate(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
    startX = currentPos.x;
    startY = currentPos.y;
  }
  
  // Calculate distance and create curved path
  const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
  const steps = Math.max(5, Math.floor(distance / 50));
  
  // Create curved path with slight overshooting
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    
    // Add slight curve to the path
    const curveOffset = Math.sin(progress * Math.PI) * randomInt(10, 30);
    
    // Calculate position with curve
    let x = startX + (targetX - startX) * progress;
    let y = startY + (targetY - startY) * progress;
    
    // Add curve offset
    x += curveOffset * Math.cos(progress * Math.PI);
    y += curveOffset * Math.sin(progress * Math.PI);
    
    // Move mouse to this position
    await page.mouse.move(x, y);
    
    // Variable delay between movements
    await page.waitForTimeout(randomInt(10, 30));
  }
  
  // Final movement to exact target (with slight overshoot and correction)
  if (Math.random() < 0.3) {
    // Overshoot slightly
    const overshootX = targetX + randomInt(-20, 20);
    const overshootY = targetY + randomInt(-20, 20);
    await page.mouse.move(overshootX, overshootY);
    await page.waitForTimeout(randomInt(50, 150));
  }
  
  // Move to final target
  await page.mouse.move(targetX, targetY);
}

// Natural reading delays and human-like pauses
async function humanPause(page, context = 'reading') {
  const pauseTimes = {
    'reading': randomInt(3000, 8000),
    'thinking': randomInt(1000, 4000),
    'clicking': randomInt(500, 1500),
    'scrolling': randomInt(1000, 3000),
    'hovering': randomInt(800, 2500)
  };
  
  const pauseTime = pauseTimes[context] || randomInt(1000, 3000);
  await page.waitForTimeout(pauseTime);
}

// Simulate human-like clicking with natural delays
async function humanClick(page, element, context = 'normal') {
  // Hover first (natural behavior)
  await element.hover();
  await humanPause(page, 'hovering');
  
  // Click with natural delay
  const clickDelay = randomInt(100, 400);
  await element.click({ delay: clickDelay });
  
  // Post-click pause
  await humanPause(page, 'clicking');
}

module.exports = {
  randomInt,
  humanType,
  smoothScroll,
  humanMouseMove,
  humanPause,
  humanClick
};
