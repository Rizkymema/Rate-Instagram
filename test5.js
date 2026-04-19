async function testEmbed(username) {
  console.log(`\n=== EMBED: ${username} ===`);
  
  // Approach: Instagram embed page
  const res = await fetch(`https://www.instagram.com/${username}/embed/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  console.log("Status:", res.status);
  const html = await res.text();
  
  // Look for profile pic
  const picMatch = html.match(/class="[^"]*EmbeddedProfilePic[^"]*"[^>]*src="([^"]+)"/i)
    || html.match(/profile_pic_url['":\s]+['"]([^'"]+)['"]/i)
    || html.match(/<img[^>]+src="(https:\/\/[^"]*cdninstagram[^"]*)"[^>]*>/i);
  console.log("Profile pic:", picMatch ? picMatch[1].substring(0, 80) + "..." : "NOT FOUND");

  // Look for username/name  
  const nameMatch = html.match(/<title>([^<]+)<\/title>/i);
  console.log("Title:", nameMatch ? nameMatch[1] : "NOT FOUND");
  
  // Look for follower counts in JSON
  const jsonInEmbed = html.match(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)\s*\}/);
  console.log("Followers in embed JSON:", jsonInEmbed ? jsonInEmbed[1] : "NOT FOUND");
  
  // Has content at all?
  console.log("Has EmbeddedMedia:", html.includes("EmbeddedMedia"));
  console.log("Has login redirect:", html.includes("Login") || html.includes("loginForm"));
  console.log("HTML length:", html.length);
  
  // Check for any profile image 
  const allImgs = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)];
  console.log("Total <img> tags:", allImgs.length);
  for (const img of allImgs.slice(0, 5)) {
    if (img[1].includes('cdninstagram') || img[1].includes('fbcdn')) {
      console.log("  CDN img:", img[1].substring(0, 100));
    }
  }
}

async function testGoogleSearch(username) {
  console.log(`\n=== GOOGLE CACHE: ${username} ===`);
  const res = await fetch(`https://webcache.googleusercontent.com/search?q=cache:instagram.com/${username}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });
  console.log("Status:", res.status);
}

(async () => {
  await testEmbed("cristiano");
  await testEmbed("jfrfrankk");
  await testEmbed("therock");
  await testGoogleSearch("jfrfrankk");
})();
