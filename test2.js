async function testIG(username) {
  console.log(`\n=== Testing: ${username} ===`);
  
  const res = await fetch(`https://www.instagram.com/${username}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    }
  });

  console.log("Status:", res.status);
  const html = await res.text();
  
  // Check og:description
  const ogDesc = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i);
  console.log("og:description:", ogDesc ? ogDesc[1] : "NOT FOUND");
  
  // Check og:title  
  const ogTitle = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
  console.log("og:title:", ogTitle ? ogTitle[1] : "NOT FOUND");

  // Check for profile_pic
  const ogImage = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
  console.log("og:image:", ogImage ? ogImage[1].substring(0, 80) + "..." : "NOT FOUND");
  
  // Check for JSON data in page
  const jsonMatch = html.match(/"edge_followed_by":\{"count":(\d+)\}/);
  console.log("edge_followed_by:", jsonMatch ? jsonMatch[1] : "NOT FOUND in JSON");

  const jsonMatch2 = html.match(/"edge_follow":\{"count":(\d+)\}/);
  console.log("edge_follow:", jsonMatch2 ? jsonMatch2[1] : "NOT FOUND in JSON");

  const jsonMatch3 = html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)/);
  console.log("edge_owner_to_timeline_media:", jsonMatch3 ? jsonMatch3[1] : "NOT FOUND in JSON");
  
  // Try to find any script with user data
  const sharedData = html.match(/window\._sharedData\s*=\s*(\{.+?\});<\/script>/);
  console.log("_sharedData found:", !!sharedData);
  
  // Try additionalDataLoaded
  const additionalData = html.match(/window\.__additionalDataLoaded\s*\(\s*['"][^'"]+['"]\s*,\s*(\{.+?\})\s*\)/);
  console.log("__additionalDataLoaded found:", !!additionalData);

  // Check for login redirect
  if (html.includes('loginForm') || html.includes('Login')) {
    console.log("WARNING: Instagram is showing login page!");
  }
  
  // Look for any meta with numbers
  const allMeta = html.matchAll(/<meta[^>]+content=["']([^"']*\d+[^"']*)["'][^>]*>/gi);
  for (const m of allMeta) {
    if (m[1].includes('Followers') || m[1].includes('Following') || m[1].includes('Posts')) {
      console.log("Found meta with stats:", m[1]);
    }
  }
  
  console.log("HTML length:", html.length);
}

testIG("cristiano").then(() => testIG("jfrfrankk")).catch(console.error);
