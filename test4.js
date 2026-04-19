async function testAll(username) {
  console.log(`\n=== ${username} ===\n`);

  // Approach A: og:description (works for big accounts)
  try {
    const res = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      }
    });
    const html = await res.text();
    const og = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i);
    console.log("A) Googlebot og:desc:", og ? og[1].substring(0, 120) : "NOT FOUND");
    
    const ogTitle = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
    console.log("A) Googlebot og:title:", ogTitle ? ogTitle[1] : "NOT FOUND");
    
    const ogImage = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
    console.log("A) Googlebot og:image:", ogImage ? "FOUND" : "NOT FOUND");
  } catch(e) { console.log("A) Error:", e.message); }

  // Approach B: ?__a=1&__d=dis
  try {
    const res2 = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-IG-App-ID': '936619743392459',
      }
    });
    console.log("B) ?__a=1 status:", res2.status);
    if (res2.ok) {
      const data = await res2.json();
      const u = data?.graphql?.user;
      if (u) {
        console.log("  Name:", u.full_name);
        console.log("  Followers:", u.edge_followed_by?.count);
        console.log("  Posts:", u.edge_owner_to_timeline_media?.count);
      } else {
        console.log("  Keys:", Object.keys(data).join(', '));
      }
    }
  } catch(e) { console.log("B) Error:", e.message); }

  // Approach C: Googlebot + __a=1
  try {
    const res3 = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    console.log("C) web_profile_info status:", res3.status);
    if (res3.ok) {
      const data = await res3.json();
      const u = data?.data?.user;
      if (u) {
        console.log("  Name:", u.full_name);
        console.log("  Followers:", u.edge_followed_by?.count);
        console.log("  Following:", u.edge_follow?.count);
        console.log("  Posts:", u.edge_owner_to_timeline_media?.count);
        console.log("  Bio:", u.biography?.substring(0, 60));
        console.log("  Pic:", u.profile_pic_url_hd ? "FOUND" : "NOT FOUND");
        console.log("  Private:", u.is_private);
      }
    }
  } catch(e) { console.log("C) Error:", e.message); }
}

(async () => {
  await testAll("cristiano");
  await new Promise(r => setTimeout(r, 1000));
  await testAll("jfrfrankk");
  await new Promise(r => setTimeout(r, 1000));
  await testAll("therock");
})();
