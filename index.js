const { chromium } = require("playwright");
const fs = require("fs");
const { randomInt, humanType, smoothScroll, humanMouseMove, humanPause, humanClick } = require("./utils");
const { logSession } = require("./logger");

// Load config
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Normalize URL (keep hostname + path)
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + u.pathname;
  } catch (e) {
    return url;
  }
}

(async () => {
  for (const configItem of config) {
    const keyword = configItem.keywords;
    const userAgent =
      configItem.user_agents[randomInt(0, configItem.user_agents.length - 1)];
    const proxy =
      configItem.proxies.length > 0
        ? configItem.proxies[randomInt(0, configItem.proxies.length - 1)]
        : null;

    console.log(
      `Launching with UA: ${userAgent}, Proxy: ${proxy || "none"}, Keyword: ${keyword}`
    );

    // Launch browser
    const browser = await chromium.launch({
      headless: false,
      // proxy: proxy ? { server: proxy } : undefined
    });

    const context = await browser.newContext({ userAgent });
    const page = await context.newPage();

    // 1. Go to Bing
    await page.goto("https://www.bing.com", { waitUntil: "domcontentloaded" });
    
    // Human-like pause before starting to type (reading the page)
    await humanPause(page, 'reading');
    
    // 2. Type keyword with enhanced human-like typing
    await humanType(page, keyword);
    
    // Natural pause before pressing Enter
    await humanPause(page, 'thinking');
    await page.keyboard.press("Enter");

    // 3. Wait for results with natural reading time
    await page.waitForSelector("li.b_algo h2 a", { timeout: 10000 });
    await humanPause(page, 'reading');

    // 4. Search for target site
    let targetFound = false;
    let maxPages = 5; // Changed to 5 pages as requested
    let currentPage = 1;

    const targetUrl = configItem.target_url.toLowerCase();
    const targetDomain = new URL(configItem.target_url).hostname.replace(
      /^www\./,
      ""
    );

    while (!targetFound && currentPage <= maxPages) {
      // Check both main result links and citation elements
      const mainLinks = await page.$$eval("li.b_algo h2 a", els =>
        els.map(el => ({ href: el.href, text: el.innerText, type: 'main' }))
      );
      
      const citationElements = await page.$$eval("div.b_attribution cite", els =>
        els.map(el => ({ href: el.innerText, text: el.innerText, type: 'citation' }))
      );
      
      const allLinks = [...mainLinks, ...citationElements];
      let foundLink = null;
      let foundLinkType = null;

      for (const l of allLinks) {
        let href = l.href || l.text; // For citations, use text content as href

        // Handle Bing redirect links
        if (href.includes("bing.com/aclick")) {
          const realUrl = new URLSearchParams(href.split("?")[1]).get("u");
          if (realUrl) href = decodeURIComponent(realUrl);
        }

        // Check for full or partial match
        if (
          href.toLowerCase().includes(targetUrl) ||
          href.toLowerCase().includes(targetDomain)
        ) {
          foundLink = href;
          foundLinkType = l.type;
          break;
        }
      }

      if (foundLink) {
        console.log(`✅ Found target site on page ${currentPage}: ${foundLink} (${foundLinkType})`);

        // Find and click the target link
        if (foundLinkType === 'main') {
          // Click on main result link
          const allMainLinks = await page.$$("li.b_algo h2 a");
          for (const link of allMainLinks) {
            let href = await link.getAttribute("href");
            if (!href) continue;

            // Expand redirect
            if (href.includes("bing.com/aclick")) {
              const realUrl = new URLSearchParams(href.split("?")[1]).get("u");
              if (realUrl) href = decodeURIComponent(realUrl);
            }

            if (
              href.toLowerCase().includes(targetUrl) ||
              href.toLowerCase().includes(targetDomain)
            ) {
              try {
                // Scroll to the link with human-like movement
                await link.scrollIntoViewIfNeeded();
                await humanPause(page, 'scrolling');
                
                // Get link position for human-like mouse movement
                const linkBox = await link.boundingBox();
                if (linkBox) {
                  const targetX = linkBox.x + linkBox.width / 2;
                  const targetY = linkBox.y + linkBox.height / 2;
                  
                  // Move mouse to link with natural curved path
                  await humanMouseMove(page, targetX, targetY);
                }
                
                // Hover over the link with natural timing
                await link.hover();
                await humanPause(page, 'hovering');
                
                // Listen for new page/tab before clicking
                const pagePromise = context.waitForEvent('page');
                
                // Click with human-like behavior
                await humanClick(page, link, 'normal');
                
                // Wait for new page to open
                const newPage = await pagePromise;
                console.log(`🔄 New page opened: ${newPage.url()}`);
                
                // Wait for the new page to load
                await newPage.waitForLoadState('domcontentloaded');
                await newPage.waitForTimeout(randomInt(2000, 4000));
                
                // Switch to the new page for interactions
                const targetPage = newPage;
                
                // Focus on the target page to ensure it's active
                await targetPage.bringToFront();
                await targetPage.waitForTimeout(randomInt(1000, 2000));
                
                targetFound = true;
                console.log(`🎯 Successfully clicked and opened target site: ${targetPage.url()}`);
                console.log(`🎯 Page title: ${await targetPage.title()}`);
                
                // 5. Enhanced random scrolling + interaction on the target page
                const stay =
                  randomInt(configItem.stay_duration.min, configItem.stay_duration.max) * 1000;
                console.log(`🔄 Staying on target page for ${stay / 1000} seconds with human-like behavior...`);

                const start = Date.now();
                let scrollCount = 0;
                let hoverCount = 0;

                try {
                  while (Date.now() - start < stay) {
                    // Check if page is still open
                    if (targetPage.isClosed()) {
                      console.log(`⚠️ Target page was closed unexpectedly`);
                      break;
                    }

                    // Random smooth scrolling with enhanced human-like behavior
                    const scrolls = randomInt(2, 5);
                    for (let i = 0; i < scrolls; i++) {
                      if (targetPage.isClosed()) break;
                      await smoothScroll(targetPage, randomInt(1, 3));
                      await humanPause(targetPage, 'scrolling');
                      scrollCount++;
                    }

                    // Random hover over various elements with natural mouse movement
                    if (!targetPage.isClosed()) {
                      const elements = await targetPage.$$("a, button, img, h1, h2, h3, p");
                      if (elements.length > 0) {
                        const hoverElements = randomInt(2, 5);
                        for (let i = 0; i < hoverElements; i++) {
                          if (targetPage.isClosed()) break;
                          const el = elements[randomInt(0, elements.length - 1)];
                          try {
                            await el.scrollIntoViewIfNeeded();
                            await humanPause(targetPage, 'scrolling');
                            
                            // Get element position for human-like mouse movement
                            const elBox = await el.boundingBox();
                            if (elBox) {
                              const targetX = elBox.x + elBox.width / 2;
                              const targetY = elBox.y + elBox.height / 2;
                              
                              // Move mouse with natural curved path
                              await humanMouseMove(targetPage, targetX, targetY);
                            }
                            
                            await el.hover();
                            await humanPause(targetPage, 'hovering');
                            hoverCount++;
                          } catch (e) {
                            // ignore hover failures
                          }
                        }
                      }
                    }

                    // Enhanced random mouse movements with natural curves
                    if (!targetPage.isClosed()) {
                      await humanPause(targetPage, 'reading');
                      
                      // Occasionally move mouse to random position with natural movement
                      if (randomInt(1, 10) <= 3) {
                        try {
                          const viewport = targetPage.viewportSize();
                          if (viewport) {
                            const randomX = randomInt(100, viewport.width - 100);
                            const randomY = randomInt(100, viewport.height - 100);
                            
                            // Move mouse with natural curved path
                            await humanMouseMove(targetPage, randomX, randomY);
                          }
                        } catch (e) {
                          // ignore mouse movement errors
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.log(`⚠️ Error during target page interaction: ${error.message}`);
                }
                
                console.log(`📊 Session stats: ${scrollCount} scrolls, ${hoverCount} hovers`);
                
                // Close the target page only if it's still open
                if (!targetPage.isClosed()) {
                  await targetPage.close();
                  console.log(`🔒 Target page closed`);
                }
                
                break;
              } catch (error) {
                console.log(`⚠️ Error clicking link: ${error.message}`);
                continue;
              }
            }
          }
        } else if (foundLinkType === 'citation') {
          // For citation elements, we need to find the parent result and click it
          const citationElements = await page.$$("div.b_attribution cite");
          for (const citation of citationElements) {
            const citationText = await citation.innerText();
            if (
              citationText.toLowerCase().includes(targetUrl) ||
              citationText.toLowerCase().includes(targetDomain)
            ) {
              try {
                // Find the parent result container and click the main link
                const parentResult = await citation.evaluateHandle(el => el.closest('li.b_algo'));
                if (parentResult) {
                  const mainLink = await parentResult.$('h2 a');
                  if (mainLink) {
                    // Scroll to the link with human-like movement
                    await mainLink.scrollIntoViewIfNeeded();
                    await humanPause(page, 'scrolling');
                    
                    // Get link position for human-like mouse movement
                    const linkBox = await mainLink.boundingBox();
                    if (linkBox) {
                      const targetX = linkBox.x + linkBox.width / 2;
                      const targetY = linkBox.y + linkBox.height / 2;
                      
                      // Move mouse to link with natural curved path
                      await humanMouseMove(page, targetX, targetY);
                    }
                    
                    // Hover over the link with natural timing
                    await mainLink.hover();
                    await humanPause(page, 'hovering');
                    
                    // Listen for new page/tab before clicking
                    const pagePromise = context.waitForEvent('page');
                    
                    // Click with human-like behavior
                    await humanClick(page, mainLink, 'normal');
                    
                    // Wait for new page to open
                    const newPage = await pagePromise;
                    console.log(`🔄 New page opened: ${newPage.url()}`);
                    
                    // Wait for the new page to load
                    await newPage.waitForLoadState('domcontentloaded');
                    await newPage.waitForTimeout(randomInt(2000, 4000));
                    
                    // Switch to the new page for interactions
                    const targetPage = newPage;
                    
                    // Focus on the target page to ensure it's active
                    await targetPage.bringToFront();
                    await targetPage.waitForTimeout(randomInt(1000, 2000));
                    
                    targetFound = true;
                    console.log(`🎯 Successfully clicked and opened target site: ${targetPage.url()}`);
                    console.log(`🎯 Page title: ${await targetPage.title()}`);
                    
                    // 5. Enhanced random scrolling + interaction on the target page
                    const stay =
                      randomInt(configItem.stay_duration.min, configItem.stay_duration.max) * 1000;
                    console.log(`🔄 Staying on target page for ${stay / 1000} seconds with human-like behavior...`);

                    const start = Date.now();
                    let scrollCount = 0;
                    let hoverCount = 0;

                    try {
                      while (Date.now() - start < stay) {
                        // Check if page is still open
                        if (targetPage.isClosed()) {
                          console.log(`⚠️ Target page was closed unexpectedly`);
                          break;
                        }

                        // Random smooth scrolling with enhanced human-like behavior
                        const scrolls = randomInt(2, 5);
                        for (let i = 0; i < scrolls; i++) {
                          if (targetPage.isClosed()) break;
                          await smoothScroll(targetPage, randomInt(1, 3));
                          await humanPause(targetPage, 'scrolling');
                          scrollCount++;
                        }

                        // Random hover over various elements with natural mouse movement
                        if (!targetPage.isClosed()) {
                          const elements = await targetPage.$$("a, button, img, h1, h2, h3, p");
                          if (elements.length > 0) {
                            const hoverElements = randomInt(2, 5);
                            for (let i = 0; i < hoverElements; i++) {
                              if (targetPage.isClosed()) break;
                              const el = elements[randomInt(0, elements.length - 1)];
                              try {
                                await el.scrollIntoViewIfNeeded();
                                await humanPause(targetPage, 'scrolling');
                                
                                // Get element position for human-like mouse movement
                                const elBox = await el.boundingBox();
                                if (elBox) {
                                  const targetX = elBox.x + elBox.width / 2;
                                  const targetY = elBox.y + elBox.height / 2;
                                  
                                  // Move mouse with natural curved path
                                  await humanMouseMove(targetPage, targetX, targetY);
                                }
                                
                                await el.hover();
                                await humanPause(targetPage, 'hovering');
                                hoverCount++;
                              } catch (e) {
                                // ignore hover failures
                              }
                            }
                          }
                        }

                        // Enhanced random mouse movements with natural curves
                        if (!targetPage.isClosed()) {
                          await humanPause(targetPage, 'reading');
                          
                          // Occasionally move mouse to random position with natural movement
                          if (randomInt(1, 10) <= 3) {
                            try {
                              const viewport = targetPage.viewportSize();
                              if (viewport) {
                                const randomX = randomInt(100, viewport.width - 100);
                                const randomY = randomInt(100, viewport.height - 100);
                                
                                // Move mouse with natural curved path
                                await humanMouseMove(targetPage, randomX, randomY);
                              }
                            } catch (e) {
                              // ignore mouse movement errors
                            }
                          }
                        }
                      }
                    } catch (error) {
                      console.log(`⚠️ Error during target page interaction: ${error.message}`);
                    }
                    
                    console.log(`📊 Session stats: ${scrollCount} scrolls, ${hoverCount} hovers`);
                    
                    // Close the target page only if it's still open
                    if (!targetPage.isClosed()) {
                      await targetPage.close();
                      console.log(`🔒 Target page closed`);
                    }
                    
                    break;
                  }
                }
              } catch (error) {
                console.log(`⚠️ Error clicking citation link: ${error.message}`);
                continue;
              }
            }
          }
        }
      } else {
        console.log(
          `❌ Not found on page ${currentPage}, checking next page...`
        );
        const nextButton = await page.$("a.sb_pagN");
        if (nextButton) {
          // Human-like pause before clicking next page
          await humanPause(page, 'thinking');
          
          // Get button position for natural mouse movement
          const buttonBox = await nextButton.boundingBox();
          if (buttonBox) {
            const targetX = buttonBox.x + buttonBox.width / 2;
            const targetY = buttonBox.y + buttonBox.height / 2;
            
            // Move mouse with natural curved path
            await humanMouseMove(page, targetX, targetY);
          }
          
          // Click with human-like behavior
          await humanClick(page, nextButton, 'normal');
          
          // Wait for page to load with natural reading time
          await humanPause(page, 'reading');
          currentPage++;
        } else {
          console.log("⚠️ No more pages available.");
          break;
        }
      }
    }

    // 5. Enhanced random scrolling + interaction (only if target clicked)
    if (targetFound) {
      // This section is now handled above when the target page opens
      console.log(`✅ Target site interaction completed`);
    } else {
      console.log(`❌ Target site not found, no interaction performed`);
    }

    // 6. Log session
    logSession({ keyword, userAgent, proxy, targetFound });

    // 7. Close browser properly
    try {
      await context.close();
      await browser.close();
      console.log(`🔒 Browser closed successfully`);
    } catch (error) {
      console.log(`⚠️ Error closing browser: ${error.message}`);
      // Force close if normal close fails
      try {
        await browser.close();
      } catch (e) {
        console.log(`⚠️ Force close also failed: ${e.message}`);
      }
    }

    // 🕒 Human-like pause between sessions (30-90 seconds)
    const pause = randomInt(30000, 90000);
    console.log(`⏳ Taking a natural break for ${pause / 1000}s before next keyword...`);
    
    // Simulate human-like behavior during the break
    if (Math.random() < 0.4) {
      console.log(`🤔 Taking a longer break to "think" about the next search...`);
      await delay(pause);
    } else {
      // Split the pause into smaller chunks with occasional activity
      const chunkSize = randomInt(10000, 20000);
      let remaining = pause;
      
      while (remaining > 0) {
        const currentChunk = Math.min(chunkSize, remaining);
        await delay(currentChunk);
        remaining -= currentChunk;
        
        if (remaining > 0 && Math.random() < 0.2) {
          console.log(`💭 Brief pause... continuing in ${remaining / 1000}s`);
        }
      }
    }
  }
})();