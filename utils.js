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
  
  //direct type keyword
  // await searchBox.type(text);
  // Random pause after typing before hitting Enter
  await page.waitForTimeout(randomInt(800, 2000));
}

// Add human-like variations to search queries
function addHumanVariations(text) {
  const variations = [
    // `what is ${text}`,
    // `how to ${text}`,
    // `best way to ${text}`,
    // `tips for ${text}`,
    // `guide to ${text}`,
    // `${text} help`,
    // `${text} advice`,
    // `learn about ${text}`,
    // `${text} examples`,
    // `${text} information`,
    `${text}`
  ];
  
  // 70% chance to use original text, 30% chance to add variations
  if (Math.random() < 0.3) {
    return variations[randomInt(0, variations.length - 1)];
  }
  
  return text;
}

// Simulate realistic human typing patterns with exact specifications
async function simulateHumanTyping(page, searchBox, text) {
  // const words = text.split(' ');
  const words = text;
  let currentText = '';
  
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    
    // Type word character by character with variable speed (80-300ms as specified)
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const char = word[charIndex];
      
      // EXACT SPECIFICATION: 80-300ms gaps between letters (and it varies)
      const typingDelay = randomInt(80, 300);
      await searchBox.type(char, { delay: typingDelay });
      // Occasionally make typos and correct them (8% chance)
      // if (Math.random() < 0.08) {
      //   // Type wrong character
      //   const wrongChar = getRandomWrongChar(char);
      //   await searchBox.type(wrongChar, { delay: randomInt(50, 150) });
      //   await page.waitForTimeout(randomInt(100, 300));
        
      //   // Backspace and correct
      //   await page.keyboard.press("Backspace");
      //   await page.waitForTimeout(randomInt(50, 150));
      // }
      
      // Occasionally hit shift late or early (irregular capitalization)
      // if (Math.random() < 0.06) {
      //   // Simulate hitting shift too early or late
      //   if (Math.random() < 0.5) {
      //     // Hit shift too early - capitalize next character
      //     await page.keyboard.press("Shift");
      //     await page.waitForTimeout(randomInt(50, 150));
      //     await searchBox.type(char, { delay: typingDelay });
      //     await page.keyboard.press("Shift");
      //   } else {
      //     // Hit shift too late - capitalize current character
      //     await searchBox.type(char, { delay: typingDelay });
      //     await page.waitForTimeout(randomInt(50, 150));
      //     await page.keyboard.press("Backspace");
      //     await page.keyboard.press("Shift");
      //     await searchBox.type(char.toUpperCase(), { delay: typingDelay });
      //     await page.keyboard.press("Shift");
      //   }
      // } else {
      //   // Type the correct character normally
      //   await searchBox.type(char, { delay: typingDelay });
      // }
      
      // EXACT SPECIFICATION: Micro-pauses ~0.5–2s when thinking of the next word
      if (Math.random() < 0.05) {
        const thinkingPause = randomInt(500, 2000);
        await page.waitForTimeout(thinkingPause);
      }
      
      // Random pause between characters (especially after spaces/punctuation)
      // if (char === ' ' || char === '.' || char === '?' || char === '!') {
      //   await page.waitForTimeout(randomInt(200, 500));
      // }
      
      // EXACT SPECIFICATION: Uneven rhythm: bursts of fast typing, then short stalls
      // if (Math.random() < 0.15) {
      //   // Fast burst - type next few characters quickly
      //   const burstLength = randomInt(2, 4);
      //   const remainingChars = word.length - charIndex - 1;
      //   const actualBurstLength = Math.min(burstLength, remainingChars);
        
      //   for (let burst = 1; burst <= actualBurstLength; burst++) {
      //     if (charIndex + burst < word.length) {
      //       const nextChar = word[charIndex + burst];
      //       await searchBox.type(nextChar, { delay: randomInt(30, 80) }); // Faster typing during burst
      //       charIndex++; // Skip this character in main loop
      //     }
      //   }
        
      //   // Stall after burst
      //   await page.waitForTimeout(randomInt(300, 800));
      // }
    }
    
    // Add space between words
    // if (wordIndex < words.length - 1) {
    //   await searchBox.type(" ", { delay: randomInt(100, 300) });
      
    //   // Longer pause after certain words (thinking pause)
    //   if (word.toLowerCase() === 'what' || word.toLowerCase() === 'how' || word.toLowerCase() === 'best') {
    //     await page.waitForTimeout(randomInt(500, 1500));
    //   }
    // }
    
    // EXACT SPECIFICATION: Corrections: backspaces, highlight + retype, or leaving typos uncorrected
    // if (Math.random() < 0.12) {
    //   await page.waitForTimeout(randomInt(500, 1000));
      
    //   // 60% chance to correct, 40% chance to leave typo (more realistic)
    //   if (Math.random() < 0.6) {
    //     // Delete last few characters
    //     const deleteCount = randomInt(2, 5);
    //     for (let i = 0; i < deleteCount; i++) {
    //       await page.keyboard.press("Backspace");
    //       await page.waitForTimeout(randomInt(50, 150));
    //     }
        
    //     // Type alternative word
    //     const alternatives = getWordAlternatives(word);
    //     if (alternatives.length > 0) {
    //       const alternative = alternatives[randomInt(0, alternatives.length - 1)];
    //       await searchBox.type(alternative, { delay: randomInt(80, 200) });
    //     }
    //   } else {
    //     // Leave the typo (more human-like)
    //     console.log(`🤔 Leaving typo uncorrected for realism`);
    //   }
    // }
    
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
  const steps = Math.max(12, Math.floor(distance / 35)); // More steps for smoother, more complex paths
  
  // Check if there are clickable elements near the target for speed adjustment
  const clickableInfo = await detectClickableElements(page, targetX, targetY, 120);
  const hasClickableElements = clickableInfo.hasClickable;
  
  // ENHANCED: Create more complex, human-like curved path with natural variations
  const pathPoints = generateHumanLikePath(startX, startY, targetX, targetY, steps, hasClickableElements);
  
  // Move through the generated path points
  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];
    const progress = i / (pathPoints.length - 1);
    
    // Move mouse to this position
    await page.mouse.move(point.x, point.y);
    
    // ENHANCED: Uneven cursor speed based on proximity to clickable elements
    let delay;
    if (hasClickableElements) {
      // Slow down significantly when approaching clickable elements
      if (progress < 0.3) {
        delay = randomInt(25, 60); // Very slow at start when approaching clickable elements
      } else if (progress > 0.7) {
        delay = randomInt(40, 80); // Very slow near target when it's clickable
      } else {
        delay = randomInt(15, 35); // Moderate speed in middle
      }
    } else {
      // Normal speed variation for non-clickable targets
      if (progress < 0.2) {
        delay = randomInt(15, 40); // Slower at start
      } else if (progress > 0.8) {
        delay = randomInt(20, 50); // Slower at end
      } else {
        delay = randomInt(8, 25); // Faster in middle
      }
    }
    
    // ENHANCED: Add mid-movement pauses for more human-like behavior
    if (Math.random() < 0.15) { // 15% chance to pause mid-movement
      const pauseDuration = randomInt(100, 300);
      await page.waitForTimeout(pauseDuration);
    }
    
    await page.waitForTimeout(delay);
  }
  
  // ENHANCED: More realistic overshooting near clickable elements
  if (Math.random() < 0.5) { // Increased chance for clickable elements
    // Overshoot slightly (more realistic)
    const overshootDistance = hasClickableElements ? randomInt(20, 45) : randomInt(-30, 30);
    const overshootX = targetX + (hasClickableElements ? randomInt(-overshootDistance, overshootDistance) : randomInt(-30, 30));
    const overshootY = targetY + (hasClickableElements ? randomInt(-overshootDistance, overshootDistance) : randomInt(-30, 30));
    
    await page.mouse.move(overshootX, overshootY);
    await page.waitForTimeout(randomInt(100, 250)); // Longer pause when overshooting near clickable elements
    
    // Sometimes overshoot again (double correction) - more common near clickable elements
    if (Math.random() < (hasClickableElements ? 0.5 : 0.3)) {
      const secondOvershootX = targetX + randomInt(-20, 20);
      const secondOvershootY = targetY + randomInt(-20, 20);
      await page.mouse.move(secondOvershootX, secondOvershootY);
      await page.waitForTimeout(randomInt(80, 200));
    }
  }
  
  // Move to final target with natural hesitation (longer near clickable elements)
  const finalHesitation = hasClickableElements ? randomInt(80, 200) : randomInt(30, 100);
  await page.waitForTimeout(finalHesitation);
  await page.mouse.move(targetX, targetY);
  
  // ENHANCED: More frequent corrections when near clickable elements
  const correctionChance = hasClickableElements ? 0.85 : 0.70;
  if (Math.random() < correctionChance) {
    await page.waitForTimeout(randomInt(60, 180));
    
    // First wobble - slight movement away from target
    const wobble1X = targetX + randomInt(-10, 10);
    const wobble1Y = targetY + randomInt(-10, 10);
    await page.mouse.move(wobble1X, wobble1Y);
    await page.waitForTimeout(randomInt(50, 150));
    
    // Second wobble - move back towards target
    const wobble2X = targetX + randomInt(-6, 6);
    const wobble2Y = targetY + randomInt(-6, 6);
    await page.mouse.move(wobble2X, wobble2Y);
    await page.waitForTimeout(randomInt(40, 120));
    
    // Sometimes a third micro-wobble for extra realism (more common near clickable elements)
    if (Math.random() < (hasClickableElements ? 0.6 : 0.4)) {
      const wobble3X = targetX + randomInt(-3, 3);
      const wobble3Y = targetY + randomInt(-3, 3);
      await page.mouse.move(wobble3X, wobble3Y);
      await page.waitForTimeout(randomInt(30, 100));
    }
    
    // Final precise movement to target
    await page.mouse.move(targetX, targetY);
    await page.waitForTimeout(randomInt(30, 80));
  }
  
  // Sometimes make a tiny adjustment after reaching target (more common near clickable elements)
  const finalAdjustChance = hasClickableElements ? 0.35 : 0.2;
  if (Math.random() < finalAdjustChance) {
    await page.waitForTimeout(randomInt(60, 200));
    const finalAdjustX = targetX + randomInt(-8, 8);
    const finalAdjustY = targetY + randomInt(-8, 8);
    await page.mouse.move(finalAdjustX, finalAdjustY);
    await page.waitForTimeout(randomInt(40, 120));
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
    'micro-hover': randomInt(300, 1000),   // Micro-pauses for pre-click hovering (0.3-1s)
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
  // Hover first (natural behavior) - this is already done above in the calling code
  // The micro-hover pause (0.3-1s) is handled by the calling code for better control
  
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
      
             // ENHANCED: Add micro-corrections before clicking for ultra-realism
       if (Math.random() < 0.55) { // Increased from 40% to 75% for maximum realism
         const targetX = elementBox.x + elementBox.width / 2;
         const targetY = elementBox.y + elementBox.height / 2;
         await microCorrections(page, targetX, targetY);
       }
    }
  }
  
  // Click with natural delay and sometimes double-click by accident
  const clickDelay = randomInt(150, 600);
  await element.click({ delay: clickDelay });
  
  // Sometimes accidentally double-click (5% chance)
  // if (Math.random() < 0.05) {
  //   await page.waitForTimeout(randomInt(50, 150));
  //   await element.click({ delay: randomInt(50, 100) });
  //   console.log(`😅 Accidental double-click for realism`);
  // }
  
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
        
        for (let i = 0; i < readingPoints.length; i++) {
          const point = readingPoints[i];
          if (point.x < viewport.width && point.y < viewport.height) {
            // ENHANCED: Vary movement speed based on reading context
            let movementSpeed = 'normal';
            
            // Check if there are clickable elements near this point
            let hasClickableElements = false;
            try {
              const clickableElements = await page.$$('a, button, input[type="submit"], input[type="button"], [role="button"], [tabindex]');
              for (const element of clickableElements) {
                const box = await element.boundingBox();
                if (box) {
                  const elementCenterX = box.x + box.width / 2;
                  const elementCenterY = box.y + box.height / 2;
                  const distanceToElement = Math.sqrt(Math.pow(point.x - elementCenterX, 2) + Math.pow(point.y - elementCenterY, 2));
                  if (distanceToElement < 80) {
                    hasClickableElements = true;
                    break;
                  }
                }
              }
            } catch (e) {
              // Ignore errors when checking elements
            }
            
            // Adjust movement speed based on context
            if (hasClickableElements) {
              movementSpeed = 'slow'; // Slow down near clickable elements
            } else if (i === 0 || i === readingPoints.length - 1) {
              movementSpeed = 'slow'; // Slow at start and end of reading pattern
            } else if (i === Math.floor(readingPoints.length / 2)) {
              movementSpeed = 'fast'; // Faster in the middle
            } else {
              movementSpeed = 'normal';
            }
            
            // Use enhanced humanMouseMove with speed context
            await humanMouseMove(page, point.x, point.y);
            
            // ENHANCED: Variable pause times based on reading context and speed
            let pauseTime;
            if (movementSpeed === 'slow') {
              pauseTime = randomInt(800, 2000); // Longer pause when moving slowly
            } else if (movementSpeed === 'fast') {
              pauseTime = randomInt(300, 800); // Shorter pause when moving quickly
            } else {
              pauseTime = randomInt(500, 1500); // Normal pause
            }
            
            // Add natural reading pauses
            await page.waitForTimeout(pauseTime);
            
            // ENHANCED: Sometimes add micro-movements during reading (like highlighting text)
            if (Math.random() < 0.3) {
              const microX = point.x + randomInt(-15, 15);
              const microY = point.y + randomInt(-5, 5);
              await page.mouse.move(microX, microY);
              await page.waitForTimeout(randomInt(100, 300));
              await page.mouse.move(point.x, point.y);
            }
          }
        }
      }
    } catch (e) {
      // ignore mouse movement errors
    }
  }
}

// NEW: Micro-corrections with back-and-forth wobbles for ultra-realistic mouse behavior
async function microCorrections(page, targetX, targetY) {
  // 75% chance to perform micro-corrections (increased from 40% for maximum realism)
  if (Math.random() < 0.55) {
    await page.waitForTimeout(randomInt(30, 100));
    
    // First micro-wobble: slight movement away
    const wobble1X = targetX + randomInt(-6, 6);
    const wobble1Y = targetY + randomInt(-6, 6);
    await page.mouse.move(wobble1X, wobble1Y);
    await page.waitForTimeout(randomInt(25, 80));
    
    // Second micro-wobble: move back closer
    const wobble2X = targetX + randomInt(-3, 3);
    const wobble2Y = targetY + randomInt(-3, 3);
    await page.mouse.move(wobble2X, wobble2Y);
    await page.waitForTimeout(randomInt(20, 60));
    
    // Sometimes a third micro-adjustment
    if (Math.random() < 0.3) {
      const wobble3X = targetX + randomInt(-1, 1);
      const wobble3Y = targetY + randomInt(-1, 1);
      await page.mouse.move(wobble3X, wobble3Y);
      await page.waitForTimeout(randomInt(15, 50));
    }
    
    // Final precise positioning
    await page.mouse.move(targetX, targetY);
    await page.waitForTimeout(randomInt(15, 40));
  }
}

// NEW: Generate human-like curved and jagged paths
function generateHumanLikePath(startX, startY, targetX, targetY, steps, hasClickableElements) {
  const pathPoints = [];
  
  // Base curve parameters - more pronounced for longer distances
  const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
  const baseCurveIntensity = Math.min(distance / 200, 1.5); // Stronger curves for longer distances
  
  // Add start point
  pathPoints.push({ x: startX, y: startY });
  
  // Generate intermediate points with natural curves and jaggedness
  for (let i = 1; i < steps - 1; i++) {
    const progress = i / (steps - 1);
    
    // Base linear interpolation
    let x = startX + (targetX - startX) * progress;
    let y = startY + (targetY - startY) * progress;
    
    // ENHANCED: Multiple curve layers for more natural movement
    
    // 1. Primary S-curve (like natural hand movement)
    const sCurveOffset = Math.sin(progress * Math.PI * 2) * randomInt(20, 60) * baseCurveIntensity;
    x += sCurveOffset * Math.cos(progress * Math.PI + randomInt(-15, 15) * Math.PI / 180);
    y += sCurveOffset * Math.sin(progress * Math.PI + randomInt(-15, 15) * Math.PI / 180);
    
    // 2. Secondary micro-curves (hand tremor simulation)
    const microCurveX = Math.sin(progress * Math.PI * 4) * randomInt(8, 25);
    const microCurveY = Math.cos(progress * Math.PI * 3) * randomInt(8, 25);
    x += microCurveX;
    y += microCurveY;
    
    // 3. Natural zigzag pattern (like real human movement)
    if (Math.random() < 0.4) { // 40% chance for zigzag
      const zigzagIntensity = randomInt(5, 20);
      const zigzagDirection = Math.random() < 0.5 ? 1 : -1;
      x += zigzagIntensity * zigzagDirection * Math.sin(progress * Math.PI * 6);
      y += zigzagIntensity * zigzagDirection * Math.cos(progress * Math.PI * 5);
    }
    
    // 4. Proximity-based adjustments (more precise near clickable elements)
    if (hasClickableElements && progress > 0.7) {
      // Reduce curve intensity when approaching clickable elements
      x = x * 0.8 + (targetX * 0.2);
      y = y * 0.8 + (targetY * 0.2);
    }
    
    // 5. Random micro-adjustments (human imperfection)
    const microAdjustX = randomInt(-8, 8);
    const microAdjustY = randomInt(-8, 8);
    x += microAdjustX;
    y += microAdjustY;
    
    // 6. Distance-based curve variation (longer paths = more curves)
    if (distance > 300) {
      const longPathCurve = Math.sin(progress * Math.PI * 1.5) * randomInt(15, 40);
      x += longPathCurve * Math.cos(progress * Math.PI * 2);
      y += longPathCurve * Math.sin(progress * Math.PI * 2);
    }
    
    // 7. Natural hand shake simulation (subtle tremor)
    const tremorIntensity = randomInt(2, 8);
    const tremorX = Math.sin(progress * Math.PI * 8) * tremorIntensity;
    const tremorY = Math.cos(progress * Math.PI * 7) * tremorIntensity;
    x += tremorX;
    y += tremorY;
    
    // Ensure coordinates are within reasonable bounds
    x = Math.max(0, Math.min(x, 1920)); // Assuming max screen width
    y = Math.max(0, Math.min(y, 1080)); // Assuming max screen height
    
    pathPoints.push({ x: Math.round(x), y: Math.round(y) });
  }
  
  // Add end point
  pathPoints.push({ x: targetX, y: targetY });
  
  return pathPoints;
}

// NEW: Helper function to detect clickable elements near a point
async function detectClickableElements(page, targetX, targetY, radius = 100) {
  try {
    const clickableElements = await page.$$('a, button, input[type="submit"], input[type="button"], [role="button"], [tabindex], .clickable, [onclick]');
    for (const element of clickableElements) {
      const box = await element.boundingBox();
      if (box) {
        const elementCenterX = box.x + box.width / 2;
        const elementCenterY = box.y + box.height / 2;
        const distanceToElement = Math.sqrt(Math.pow(targetX - elementCenterX, 2) + Math.pow(targetY - elementCenterY, 2));
        if (distanceToElement < radius) {
          return {
            hasClickable: true,
            distance: distanceToElement,
            element: element
          };
        }
      }
    }
    return { hasClickable: false, distance: Infinity, element: null };
  } catch (e) {
    return { hasClickable: false, distance: Infinity, element: null };
  }
}

// NEW: Variable speed movement patterns for ultra-realistic cursor behavior
async function variableSpeedMovement(page, startX, startY, targetX, targetY, speedProfile = 'normal') {
  const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
  const steps = Math.max(10, Math.floor(distance / 35)); // More steps for smoother variable speed
  
  // Speed profiles for different contexts
  const speedProfiles = {
    'slow': { start: randomInt(30, 70), middle: randomInt(20, 50), end: randomInt(40, 90) },
    'normal': { start: randomInt(15, 40), middle: randomInt(8, 25), end: randomInt(20, 50) },
    'fast': { start: randomInt(8, 25), middle: randomInt(5, 15), end: randomInt(10, 30) },
    'precise': { start: randomInt(25, 60), middle: randomInt(15, 35), end: randomInt(30, 70) }
  };
  
  const profile = speedProfiles[speedProfile] || speedProfiles.normal;
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    
    // Calculate position with natural curve
    let x = startX + (targetX - startX) * progress;
    let y = startY + (targetY - startY) * progress;
    
    // Add natural curve variation
    const curveOffset = Math.sin(progress * Math.PI) * randomInt(10, 35);
    x += curveOffset * Math.cos(progress * Math.PI + randomInt(-15, 15) * Math.PI / 180);
    y += curveOffset * Math.sin(progress * Math.PI + randomInt(-15, 15) * Math.PI / 180);
    
    // Move mouse
    await page.mouse.move(x, y);
    
    // Variable delay based on progress and speed profile
    let delay;
    if (progress < 0.2) {
      delay = profile.start;
    } else if (progress > 0.8) {
      delay = profile.end;
    } else {
      delay = profile.middle;
    }
    
    // Add micro-pauses for realism
    if (Math.random() < 0.12) {
      await page.waitForTimeout(randomInt(80, 200));
    }
    
    await page.waitForTimeout(delay);
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
  naturalMouseMovement,
  microCorrections,
  detectClickableElements,
  variableSpeedMovement
};