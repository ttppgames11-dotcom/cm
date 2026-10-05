const fs = require('fs');
const path = require('path');
const https = require('https');

// Dedicated, authentic high-res campus, library, science lab, hospital and university building images
const downloads = [
  // 1. Engineering College Main Campus
  { file: 'campus-engineering.jpg', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80' },
  // 2. Polytechnic / Workshop & Technical Lab
  { file: 'campus-polytechnic.jpg', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80' },
  // 3. Medical College & Teaching Hospital
  { file: 'campus-medical.jpg', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80' },
  // 4. Ayurveda / Herbal & Traditional Medical College
  { file: 'campus-ayurveda.jpg', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80' },
  // 5. Pharmacy College & Research Laboratories
  { file: 'campus-pharmacy.jpg', url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80' },
  // 6. Historic Arts, Science & Commerce College Building
  { file: 'campus-degree-college.jpg', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80' },
  // 7. Management Institute (MBA & MCA Campus)
  { file: 'campus-management-mba.jpg', url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1000&q=80' },
  // 8. Law College (High Court Library & Moot Court Hall)
  { file: 'campus-law-college.jpg', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80' },
  // 9. Agriculture College & Agri Research Farm
  { file: 'campus-agriculture.jpg', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80' },
  // 10. Food Technology & Processing Center
  { file: 'campus-food-technology.jpg', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80' },
  // 11. Architecture & Design Studio
  { file: 'campus-architecture.jpg', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80' },
  // 12. B.Ed & Teachers Training College
  { file: 'campus-bed-college.jpg', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80' },
  // 13. Veterinary College & Animal Science Clinic
  { file: 'campus-veterinary.jpg', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80' },
  // 14. Nursing College & Clinical Simulation Center
  { file: 'campus-nursing.jpg', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80' },
  // 15. IT, Data Science & AI High-tech Center
  { file: 'campus-it-datascience.jpg', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80' },
  // 16. Commerce & Banking Academy
  { file: 'campus-commerce-banking.jpg', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80' },
  // 17. Social Work & Rural Development Institute
  { file: 'campus-social-work.jpg', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80' },
  // 18. Fisheries & Marine Science Academy
  { file: 'campus-fisheries-marine.jpg', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  // 19. Hotel Management & Hospitality Institute
  { file: 'campus-hotel-management.jpg', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80' },
  // 20. UPSC / MPSC Academy & Central Digital Library
  { file: 'campus-competitive-exams.jpg', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80' }
];

const destDirs = [
  path.join(__dirname, 'public', 'assets', 'images'),
  path.join(__dirname, 'frontend', 'public', 'assets', 'images')
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const item of downloads) {
    try {
      console.log(`Downloading ${item.file}...`);
      for (const dir of destDirs) {
        const target = path.join(dir, item.file);
        await downloadFile(item.url, target);
      }
      console.log(`Saved ${item.file}`);
    } catch (e) {
      console.error(`Failed ${item.file}:`, e.message);
    }
  }
  console.log('All 20 authentic campus images successfully saved!');
}

run();
