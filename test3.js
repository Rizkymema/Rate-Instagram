// Test multiple approaches for smaller accounts
async function testApproaches(username) {
  console.log(`\n=== Testing approaches for: ${username} ===\n`);

  // Approach 1: i.instagram.com API (mobile endpoint)
  try {
    const res1 = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        'User-Agent': 'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100)',
        'X-IG-App-ID': '936619743392459',
      }
    });
    console.log("Approach 1 (i.instagram.com mobile API):", res1.status);
    if (res1.ok) {
      const data = await res1.json();
      if (data.data?.user) {
        const u = data.data.user;
        console.log("  Name:", u.full_name);
        console.log("  Followers:", u.edge_followed_by?.count);
        console.log("  Following:", u.edge_follow?.count);
        console.log("  Posts:", u.edge_owner_to_timeline_media?.count);
        console.log("  Bio:", u.biography?.substring(0, 60));
        console.log("  Profile pic:", u.profile_pic_url_hd?.substring(0, 80));
        console.log("  Is private:", u.is_private);
      }
    } else {
      const txt = await res1.text();
      console.log("  Response:", txt.substring(0, 200));
    }
  } catch(e) { console.log("  Error:", e.message); }
}

testApproaches("cristiano")
  .then(() => testApproaches("jfrfrankk"))
  .then(() => testApproaches("therock"))
  .catch(console.error);
