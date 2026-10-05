const https = require("https");
const fs = require("fs");

function download(url, dest) {
  const parsed = new URL(url);
  const options = {
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://en.wikipedia.org/"
    }
  };

  https.get(options, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      let nextUrl = res.headers.location;
      if (!nextUrl.startsWith("http")) {
        nextUrl = "https://" + parsed.hostname + nextUrl;
      }
      return download(nextUrl, dest);
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on("finish", () => {
      file.close(() => {
        console.log("Downloaded:", dest, fs.statSync(dest).size, "bytes");
      });
    });
  }).on("error", (err) => console.error("Error downloading:", err));
}

// Download authentic rich Indian non-veg dining thali plate
download("https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Kolhapuri_Thali_of_Kolhapur%2C_Maharashtra.jpg/1280px-Kolhapuri_Thali_of_Kolhapur%2C_Maharashtra.jpg", "public/assets/images/real-vidarbha-saoji.jpg");
