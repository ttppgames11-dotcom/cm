import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..', 'public', 'assets', 'images');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const getWithRedirect = (currentUrl) => {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return getWithRedirect(response.headers.location);
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          return reject(new Error(`Failed with status ${response.statusCode} for ${currentUrl}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        file.close();
        fs.unlink(dest, () => {});
        reject(err);
      });
    };
    getWithRedirect(url);
  });
};

const images = [
  // Doctors
  { dir: 'doctors', name: 'dr_patil.jpg', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'doctors', name: 'dr_deshmukh.jpg', url: 'https://images.unsplash.com/photo-1594824813628-984e723bb7e6?auto=format&fit=crop&w=600&q=80' },
  { dir: 'doctors', name: 'dr_jadhav.jpg', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80' },
  { dir: 'doctors', name: 'dr_bhosale.jpg', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80' },
  { dir: 'doctors', name: 'dr_kadam.jpg', url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'doctors', name: 'dr_shinde.jpg', url: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&q=80' },

  // Matrimony
  { dir: 'matrimony', name: 'groom_rohan.jpg', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'matrimony', name: 'bride_snehal.jpg', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
  { dir: 'matrimony', name: 'groom_abhishek.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'matrimony', name: 'bride_madhura.jpg', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { dir: 'matrimony', name: 'groom_prathamesh.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'matrimony', name: 'bride_pooja.jpg', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },

  // Artists
  { dir: 'artists', name: 'artist_subodh.jpg', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80' },
  { dir: 'artists', name: 'artist_mukta.jpg', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { dir: 'artists', name: 'artist_nagraj.jpg', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'artists', name: 'artist_amruta.jpg', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
  { dir: 'artists', name: 'artist_adash.jpg', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80' },
  { dir: 'artists', name: 'artist_priyadarshan.jpg', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80' },

  // Government Officers
  { dir: 'officers', name: 'officer_tukaram.jpg', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80' },
  { dir: 'officers', name: 'officer_vishwas.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'officers', name: 'officer_ashwini.jpg', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'officers', name: 'officer_mahesh.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'officers', name: 'officer_sujata.jpg', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80' },

  // Political Leaders
  { dir: 'leaders', name: 'leader_sambhaji.jpg', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'leaders', name: 'leader_udayan.jpg', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'leaders', name: 'leader_sharad.jpg', url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80' },
  { dir: 'leaders', name: 'leader_eknath.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'leaders', name: 'leader_manoj.jpg', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80' },

  // Social Workers
  { dir: 'social', name: 'social_popatrao.jpg', url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80' },
  { dir: 'social', name: 'social_sindhutai.jpg', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { dir: 'social', name: 'social_bhaiyyuji.jpg', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'social', name: 'social_snehal.jpg', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },

  // Motivational Speakers
  { dir: 'speakers', name: 'speaker_shivaji.jpg', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'speakers', name: 'speaker_indurikar.jpg', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'speakers', name: 'speaker_vishwas.jpg', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80' },
  { dir: 'speakers', name: 'speaker_sandip.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'speakers', name: 'speaker_jayesh.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },

  // Books / Literature Covers
  { dir: 'books', name: 'book_shriman.jpg', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
  { dir: 'books', name: 'book_chhava.jpg', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
  { dir: 'books', name: 'book_panipat.jpg', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
  { dir: 'books', name: 'book_raja.jpg', url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'books', name: 'book_yugandhar.jpg', url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80' },
  { dir: 'books', name: 'book_swami.jpg', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80' },

  // Movie Posters
  { dir: 'movies', name: 'movie_subhedar.jpg', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
  { dir: 'movies', name: 'movie_pawankhind.jpg', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80' },
  { dir: 'movies', name: 'movie_sairat.jpg', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80' },
  { dir: 'movies', name: 'movie_natasamrat.jpg', url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=80' },
  { dir: 'movies', name: 'movie_farzand.jpg', url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80' },
  { dir: 'movies', name: 'movie_fatteshikast.jpg', url: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=600&q=80' },

  // Builders Projects
  { dir: 'projects', name: 'proj_shivneri.jpg', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80' },
  { dir: 'projects', name: 'proj_raigad.jpg', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
  { dir: 'projects', name: 'proj_swarajya.jpg', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80' },
  { dir: 'projects', name: 'proj_maratha_heights.jpg', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80' },

  // Dairy Products
  { dir: 'dairy', name: 'dairy_milk.jpg', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { dir: 'dairy', name: 'dairy_ghee.jpg', url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80' },
  { dir: 'dairy', name: 'dairy_shrikhand.jpg', url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80' },
  { dir: 'dairy', name: 'dairy_paneer.jpg', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' },
  { dir: 'dairy', name: 'dairy_butter.jpg', url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80' }
];

async function run() {
  console.log(`Starting download of ${images.length} assets...`);
  for (const item of images) {
    const targetDir = path.join(baseDir, item.dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const dest = path.join(targetDir, item.name);
    try {
      await download(item.url, dest);
      console.log(`✓ Saved: ${item.dir}/${item.name}`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('All image downloads completed successfully!');
}

run();
