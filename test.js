fetch('https://www.instagram.com/cristiano/')
  .then(res => res.text())
  .then(text => {
    const match = text.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i);
    console.log("Match:", match ? match[1] : "Not found in 1st regex");
    
    // Sometimes it's inside JSON
    if (!match) {
        console.log("Response text start:", text.substring(0, 500));
    }
  }).catch(err => console.error(err));
