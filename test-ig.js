const { fetch } = require("node-fetch");

async function run() {
  const username = "cristiano";
  const response = await fetch(`https://www.instagram.com/${username}/`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const html = await response.text();
  console.log("HTML length:", html.length);

  function extractMetaContent(html, key) {
    const propertyFirst = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    );
    const contentFirst = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
      "i"
    );
    const match = html.match(propertyFirst) ?? html.match(contentFirst);
    return match ? match[1] : null;
  }

  const description = extractMetaContent(html, "og:description");
  console.log("description:", description);

  const followersGraphMatch = html.match(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i);
  console.log("edge_followed_by count:", followersGraphMatch ? followersGraphMatch[1] : null);

  const postsGraphMatch = html.match(/"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i);
  console.log("edge_owner_to_timeline_media count:", postsGraphMatch ? postsGraphMatch[1] : null);
}

run();
