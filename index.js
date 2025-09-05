const { chromium } = require("playwright");
const fs = require("fs");
const { 
  randomInt, 
  humanType, 
  smoothScroll, 
  humanMouseMove, 
  humanPause, 
  humanClick,
  // simulateHumanTabBehavior,
  naturalMouseMovement
} = require("./utils");
const { logSession } = require("./logger");

// Load config
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

// Load external files
const proxies = JSON.parse(fs.readFileSync("proxies.json", "utf8"));
const userAgents = JSON.parse(fs.readFileSync("user_agents.json", "utf8"));

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

// Function to run a single campaign
async function runCampaign(configItem, campaignIndex, tabIndex, proxy) {
  const keyword = configItem.keywords;
  const userAgent = userAgents[randomInt(0, userAgents.length - 1)];
  
  // Use proxy if available (different IP for each campaign)
  // const proxy = proxies.length > 0 ? proxies[campaignIndex % proxies.length] : null;
  console.log(
    `🚀 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Launching with UA: ${userAgent}, Proxy: ${proxy ? `${proxy.server} (${proxy.username})` : "none"}, Keyword: ${keyword}`
  );

  // Launch browser with proxy
  const browser = await chromium.launch({
    headless: false,
    proxy: proxy ? {
      server: proxy.server,
      username: proxy.username,
      password: proxy.password
    } : undefined
  });

  const context = await browser.newContext({ userAgent });
  const page = await context.newPage();

  try {
    // 1. Go to Bing
    await page.goto("https://search.yahoo.com/", { waitUntil: "domcontentloaded" });
    
    // Human-like pause before starting to type (reading the page)
    await humanPause(page, 'reading');
    
    // 2. Type keyword with enhanced human-like typing
    await humanType(page, keyword);
    
    // Natural pause before pressing Enter
    await humanPause(page, 'thinking');
    await page.keyboard.press("Enter");

    // 3. Wait for results with natural reading time
    // Wait for either traditional results (li.b_algo) or featured snippets (div.b_wpt_bl)
    await page.waitForSelector("li.b_algo h2 a, div.b_wpt_bl h2 a", { timeout: 40000 });
    await humanPause(page, 'reading');

    // 4. Simulate human-like tab behavior (opening multiple tabs)
    // await simulateHumanTabBehavior(page, context, configItem.target_url);

    // 5. Search for target site
    let targetFound = false;
    let maxPages = 5; // Changed to 5 pages as requested
    let currentPage = 1;

    const targetUrl = configItem.target_url.toLowerCase();
    const targetDomain = new URL(configItem.target_url).hostname.replace(
      /^www\./,
      ""
    );

    while (!targetFound && currentPage <= maxPages) {
      // Add smooth scrolling to simulate human-like browsing behavior on each page
      console.log(`🔄 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Smooth scrolling on page ${currentPage} to simulate human browsing...`);
      
      // Perform smooth scrolling with human-like behavior
      const scrollSteps = randomInt(2, 4); // 2-4 scroll actions per page
      for (let scrollIndex = 0; scrollIndex < scrollSteps; scrollIndex++) {
        await smoothScroll(page, randomInt(1, 2)); // 1-2 scroll steps per action
        await humanPause(page, 'scrolling'); // Natural pause between scroll actions
      }
      
      // Additional pause to simulate reading the page content
      // await humanPause(page, 'reading');
      
      // Check both main result links and citation elements
      // Handle both traditional results (li.b_algo) and featured snippets (div.b_wpt_bl)
      let mainLinks = await page.$$eval("li.b_algo h2 a, div.b_wpt_bl h2 a", els =>
        els.map(el => ({ href: el.href, text: el.innerText, type: 'main' }))
      );
      
      let citationElements = await page.$$eval("div.b_attribution cite", els =>
        els.map(el => ({ href: el.innerText, text: el.innerText, type: 'citation' }))
      );
      
      // Fallback: if no results found with primary selectors, try alternative selectors
      if (mainLinks.length === 0) {
        console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: No results with primary selectors, trying alternatives...`);
        
        // Try alternative selectors for different Bing result layouts
        const alternativeMainLinks = await page.$$eval("h2 a, .b_title a, .b_caption a", els =>
          els.map(el => ({ href: el.href, text: el.innerText, type: 'main' }))
        );
        
        if (alternativeMainLinks.length > 0) {
          mainLinks = alternativeMainLinks;
          console.log(`✅ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Found ${alternativeMainLinks.length} results with alternative selectors`);
        }
      }
      
      // Log what we found for debugging
      // console.log(`🔍 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Found ${mainLinks.length} main links and ${citationElements.length} citation elements`);
      
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
        console.log(`✅ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Found target site on page ${currentPage}: ${foundLink} (${foundLinkType})`);

        // Find and click the target link
        if (foundLinkType === 'main') {
          // Click on main result link - handle both li.b_algo and div.b_wpt_bl structures
          let allMainLinks = await page.$$("li.b_algo h2 a, div.b_wpt_bl h2 a");
          
          // Fallback: if no links found with primary selectors, try alternatives
          if (allMainLinks.length === 0) {
            console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: No clickable links with primary selectors, trying alternatives...`);
            allMainLinks = await page.$$("h2 a, .b_title a, .b_caption a");
          }
          
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
                 await humanPause(page, 'micro-hover'); // Micro-pause: 0.3-1s before clicking
                 
                 // Listen for new page/tab before clicking
                 const pagePromise = context.waitForEvent('page');
                 
                 // Click with human-like behavior
                 await humanClick(page, link, 'normal');
                
                // Wait for new page to open
                const newPage = await pagePromise;
                console.log(`🔄 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: New page opened: ${newPage.url()}`);
                
                // Wait for the new page to load
                await newPage.waitForLoadState('domcontentloaded');
                await newPage.waitForTimeout(randomInt(2000, 4000));
                
                // Switch to the new page for interactions
                const targetPage = newPage;
                
                // Focus on the target page to ensure it's active
                await targetPage.bringToFront();
                await targetPage.waitForTimeout(randomInt(1000, 2000));
                
                targetFound = true;
                console.log(`🎯 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Successfully clicked and opened target site: ${targetPage.url()}`);
                console.log(`🎯 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Page title: ${await targetPage.title()}`);
                
                // 6. Enhanced random scrolling + interaction on the target page
                const stay =
                  randomInt(configItem.stay_duration.min, configItem.stay_duration.max) * 1000;
                console.log(`🔄 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Staying on target page for ${stay / 1000} seconds with human-like behavior...`);

                const start = Date.now();
                let scrollCount = 0;
                let hoverCount = 0;

                try {
                  while (Date.now() - start < stay) {
                    // Check if page is still open
                    if (targetPage.isClosed()) {
                      console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Target page was closed unexpectedly`);
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
                              console.log(`🖱️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Moving mouse to hover element with curved path at (${targetX}, ${targetY})`);
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
                      
                      // Use the new natural mouse movement function
                      await naturalMouseMovement(targetPage);
                    }
                  }
                } catch (error) {
                  console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error during target page interaction: ${error.message}`);
                }
                
                console.log(`📊 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Session stats: ${scrollCount} scrolls, ${hoverCount} hovers`);
                
                // Close the target page only if it's still open
                if (!targetPage.isClosed()) {
                  try {
                    await targetPage.close();
                    console.log(`🔒 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Target page closed successfully`);
                    // Small delay to ensure page is fully closed
                    await delay(1000);
                  } catch (closeError) {
                    console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error closing target page: ${closeError.message}`);
                  }
                }
                
                break;
              } catch (error) {
                console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error clicking link: ${error.message}`);
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
                // Try to find parent in both li.b_algo and div.b_wpt_bl structures
                const parentResult = await citation.evaluateHandle(el => {
                  const liParent = el.closest('li.b_algo');
                  const divParent = el.closest('div.b_wpt_bl');
                  return liParent || divParent;
                });                
                if (parentResult) {
                  // Convert handle to element and find the main link within the parent container
                  const parentElement = await parentResult.asElement();
                  if (parentElement) {
                    const mainLink = await parentElement.$('h2 a');
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
                     await humanPause(page, 'micro-hover'); // Micro-pause: 0.3-1s before clicking
                     
                     // Listen for new page/tab before clicking
                     const pagePromise = context.waitForEvent('page');
                     
                     // Click with human-like behavior
                     await humanClick(page, mainLink, 'normal');
                    
                    // Wait for new page to open
                    const newPage = await pagePromise;
                    console.log(`🔄 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: New page opened: ${newPage.url()}`);
                    
                    // Wait for the new page to load
                    await newPage.waitForLoadState('domcontentloaded');
                    await newPage.waitForTimeout(randomInt(2000, 4000));
                    
                    // Switch to the new page for interactions
                    const targetPage = newPage;
                    
                    // Focus on the target page to ensure it's active
                    await targetPage.bringToFront();
                    await targetPage.waitForTimeout(randomInt(1000, 2000));
                    
                    targetFound = true;
                    console.log(`🎯 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Successfully clicked and opened target site: ${targetPage.url()}`);
                    console.log(`🎯 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Page title: ${await targetPage.title()}`);
                    
                    // 6. Enhanced random scrolling + interaction on the target page
                    const stay =
                      randomInt(configItem.stay_duration.min, configItem.stay_duration.max) * 1000;
                    console.log(`🔄 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Staying on target page for ${stay / 1000} seconds with human-like behavior...`);

                    const start = Date.now();
                    let scrollCount = 0;
                    let hoverCount = 0;

                    try {
                      while (Date.now() - start < stay) {
                        // Check if page is still open
                        if (targetPage.isClosed()) {
                          console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Target page was closed unexpectedly`);
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
                                  console.log(`🖱️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Moving mouse to target page element with curved path at (${targetX}, ${targetY})`);
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
                          
                          // Use the new natural mouse movement function
                          await naturalMouseMovement(targetPage);
                        }
                      }
                    } catch (error) {
                      console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error during target page interaction: ${error.message}`);
                    }
                    
                    console.log(`📊 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Session stats: ${scrollCount} scrolls, ${hoverCount} hovers`);
                    
                    // Close the target page only if it's still open
                    if (!targetPage.isClosed()) {
                      try {
                        await targetPage.close();
                        console.log(`🔒 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Target page closed successfully`);
                        // Small delay to ensure page is fully closed
                        await delay(1000);
                      } catch (closeError) {
                        console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error closing target page: ${closeError.message}`);
                      }
                    }
                  }
                  
                  break;
                }
              }
            } catch (error) {
                console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error clicking citation link: ${error.message}`);
                continue;
              }
            }
          }
        }
      } else {
        console.log(
          `❌ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Not found on page ${currentPage}, checking next page...`
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
          
                     // Hover first with micro-pause, then click
           await nextButton.hover();
           await humanPause(page, 'micro-hover'); // Micro-pause: 0.3-1s before clicking
           
           // Click with human-like behavior
           await humanClick(page, nextButton, 'normal');
          
          // Wait for page to load with natural reading time
          await humanPause(page, 'reading');
          currentPage++;
        } else {
          console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: No more pages available.`);
          break;
        }
      }
    }

    // 7. Enhanced random scrolling + interaction (only if target clicked)
    if (targetFound) {
      // This section is now handled above when the target page opens
      console.log(`✅ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Target site interaction completed`);
    } else {
      console.log(`❌ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Target site not found, no interaction performed`);
    }

    // 8. Log session
    logSession({ keyword, userAgent, proxy, targetFound, tabIndex });

    // 9. Close browser properly - ensure all pages are closed first
    try {
      // Close all remaining pages in the context before closing browser
      const pages = context.pages();
      for (const page of pages) {
        if (!page.isClosed()) {
          try {
            await page.close();
            console.log(`🔒 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Additional page closed`);
          } catch (pageCloseError) {
            console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error closing additional page: ${pageCloseError.message}`);
          }
        }
      }
      
      // Close context and browser
      await context.close();
      await browser.close();
      console.log(`🔒 Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Browser closed successfully`);
    } catch (error) {
      console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error closing browser: ${error.message}`);
      // Force close if normal close fails
      try {
        await browser.close();
      } catch (e) {
        console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Force close also failed: ${e.message}`);
      }
    }

    return { success: true, keyword, targetFound, tabIndex };

  } catch (error) {
    console.log(`❌ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Fatal error: ${error.message}`);
    
    // Try to close browser on error - ensure all pages are closed first
    try {
      if (context) {
        // Close all remaining pages in the context before closing
        const pages = context.pages();
        for (const page of pages) {
          if (!page.isClosed()) {
            try {
              await page.close();
            } catch (pageCloseError) {
              // Ignore page close errors during error cleanup
            }
          }
        }
        await context.close();
      }
      if (browser) await browser.close();
    } catch (e) {
      console.log(`⚠️ Campaign ${campaignIndex + 1}, Tab ${tabIndex + 1}: Error closing browser after fatal error: ${e.message}`);
    }
    
    return { success: false, keyword, error: error.message, tabIndex };
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);   // round up min
  max = Math.floor(max);  // round down max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const mainLogic = async () => {
  console.log(`🚀 Starting campaigns with counter limit of 5 times...`);
  
  let counter = 0;
  const maxIterations = 5;
  
  while (counter < maxIterations) {
    counter++;
    console.log(`\n🔄 Iteration ${counter}/${maxIterations}`);
    var length = config.length;
    var configIndex = getRandomInt(0, length - 1);

    console.log(configIndex);

    const configItem = config[configIndex];
    const keyword = configItem.keywords;
    
    console.log(`\n🎯 Starting Campaign ${configIndex + 1}: "${keyword}" with 5 tabs using different IPs`);
    
         // Run 5 tabs simultaneously for current keyword
     const tabPromises = [];
     
     for (let tabIndex = 0; tabIndex < 1; tabIndex++) {
        // Use different proxy for each tab to get different IPs
        // Add some randomization to proxy selection for better distribution
        const proxyIndex = (tabIndex + counter) % proxies.length;
        const proxy = proxies.length > 0 ? proxies[proxyIndex] : null;
        
        console.log(`  📱 Tab ${tabIndex + 1}: Using proxy ${proxy ? `${proxy.server} (${proxy.username})` : 'none'}`);
        
        const tabPromise = runCampaign(configItem, configIndex, tabIndex, proxy);
        tabPromises.push(tabPromise);
      }
    
    try {
      // Wait for all 5 tabs of current keyword to complete
      console.log(`⏳ Waiting for all 5 tabs of "${keyword}" to complete...`);
      const results = await Promise.allSettled(tabPromises);
      
      // Log results for current keyword
      console.log(`\n📊 Campaign ${configIndex + 1} ("${keyword}") Results:`);
      let successCount = 0;
      let targetFoundCount = 0;
      
      results.forEach((result, tabIndex) => {
        if (result.status === 'fulfilled') {
          const { success, keyword, targetFound, error } = result.value;
          if (success) {
            successCount++;
            if (targetFound) targetFoundCount++;
            console.log(`  ✅ Tab ${tabIndex + 1}: ${targetFound ? 'Target found' : 'Target not found'}`);
          } else {
            console.log(`  ❌ Tab ${tabIndex + 1}: Failed - ${error}`);
          }
        } else {
          console.log(`  ❌ Tab ${tabIndex + 1}: Rejected - ${result.reason}`);
        }
      });
      
      console.log(`\n📈 Campaign ${configIndex + 1} Summary: ${successCount}/5 tabs successful, ${targetFoundCount} targets found`);
      
      // Wait a bit before moving to next keyword
      // if (configIndex < config.length - 1) {
      //   console.log(`\n⏸️ Waiting 10 seconds before starting next keyword...`);
      //   await delay(10000);
      // }
      
    } catch (error) {
      console.log(`❌ Error running tabs for "${keyword}": ${error.message}`);
    }
    
    // Wait 10 seconds before starting next campaign (unless this is the last iteration)
    if (counter < maxIterations) {
      console.log(`\n⏸️ Waiting 10 seconds before starting next campaign...`);
      await delay(10000);
    }
  }
  
  console.log(`\n🎉 All ${maxIterations} iterations completed!`);
}

  // console.log(`\n🎉 All campaigns completed!`);
// Main execution - run campaigns sequentially with 5 tabs each
(async () => {
  await mainLogic();
})();


