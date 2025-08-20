const { chromium } = require("playwright");
const fs = require("fs");
const { randomInt, humanType, smoothScroll } = require("./utils");
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
    await page.waitForTimeout(randomInt(2000, 4000)); // wait 2-4s before typing

    // 2. Type keyword with human-like typing
    await humanType(page, keyword);
    await page.waitForTimeout(randomInt(1000, 2500));
    await page.keyboard.press("Enter");

    // 3. Wait for results
    await page.waitForSelector("li.b_algo h2 a", { timeout: 10000 });
    await page.waitForTimeout(randomInt(1500, 3000));

    // 4. Search for target site
    let targetFound = false;
    let maxPages = 8;
    let currentPage = 1;

    const targetUrl = configItem.target_url.toLowerCase();
    const targetDomain = new URL(configItem.target_url).hostname.replace(
      /^www\./,
      ""
    );

    while (!targetFound && currentPage <= maxPages) {
      const links = await page.$$eval("li.b_algo h2 a", els =>
        els.map(el => ({ href: el.href, text: el.innerText }))
      );

      let foundLink = null;

      for (const l of links) {
        let href = l.href;

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
          break;
        }
      }

      if (foundLink) {
        console.log(`✅ Found target site on page ${currentPage}: ${foundLink}`);

        // Find and click the target link
        const allLinks = await page.$$("li.b_algo h2 a");
        for (const link of allLinks) {
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
              // Scroll to the link
              await link.scrollIntoViewIfNeeded();
              await page.waitForTimeout(randomInt(500, 1500));
              
              // Hover over the link
              await link.hover();
              await page.waitForTimeout(randomInt(800, 2000));
              
              // Listen for new page/tab before clicking
              const pagePromise = context.waitForEvent('page');
              
              // Click with human-like delay
              await link.click({ delay: randomInt(100, 300) });
              
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

                  // Random smooth scrolling (2-5 scrolls)
                  const scrolls = randomInt(2, 5);
                  for (let i = 0; i < scrolls; i++) {
                    if (targetPage.isClosed()) break;
                    await smoothScroll(targetPage, randomInt(1, 3));
                    await targetPage.waitForTimeout(randomInt(1000, 3000));
                    scrollCount++;
                  }

                  // Random hover over various elements on the target page
                  if (!targetPage.isClosed()) {
                    const elements = await targetPage.$$("a, button, img, h1, h2, h3, p");
                    if (elements.length > 0) {
                      const hoverElements = randomInt(2, 5);
                      for (let i = 0; i < hoverElements; i++) {
                        if (targetPage.isClosed()) break;
                        const el = elements[randomInt(0, elements.length - 1)];
                        try {
                          await el.scrollIntoViewIfNeeded();
                          await targetPage.waitForTimeout(randomInt(300, 800));
                          await el.hover();
                          await targetPage.waitForTimeout(randomInt(500, 2000));
                          hoverCount++;
                        } catch (e) {
                          // ignore hover failures
                        }
                      }
                    }
                  }

                  // Random mouse movements and pauses
                  if (!targetPage.isClosed()) {
                    await targetPage.waitForTimeout(randomInt(2000, 6000));
                    
                    // Occasionally move mouse to random position
                    if (randomInt(1, 10) <= 3) {
                      try {
                        const viewport = targetPage.viewportSize();
                        if (viewport) {
                          await targetPage.mouse.move(
                            randomInt(100, viewport.width - 100),
                            randomInt(100, viewport.height - 100)
                          );
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
      } else {
        console.log(
          `❌ Not found on page ${currentPage}, checking next page...`
        );
        const nextButton = await page.$("a.sb_pagN");
        if (nextButton) {
          await nextButton.click();
          await page.waitForTimeout(randomInt(3000, 6000));
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

    // 🕒 Wait 30–90 sec before starting next keyword
    const pause = randomInt(30000, 50000);
    console.log(`⏳ Waiting ${pause / 1000}s before next keyword...`);
    await delay(pause);
  }
})();