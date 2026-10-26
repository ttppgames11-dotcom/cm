const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const COLLEGES = [
  // 1. Mumbai
  {
    name: 'real-vjti-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/VJTI_Quadrangle.jpg'
  },
  {
    name: 'real-glc-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Government_Law_College%2C_Mumbai.jpg/960px-Government_Law_College%2C_Mumbai.jpg'
  },
  {
    name: 'real-ruia-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Ramnarain_Ruia_Senior_College_Quadrangle.jpg/960px-Ramnarain_Ruia_Senior_College_Quadrangle.jpg'
  },
  {
    name: 'real-xaviers-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/St._Xavier%E2%80%99s_College%2C_Mumbai_02.jpg/960px-St._Xavier%E2%80%99s_College%2C_Mumbai_02.jpg'
  },
  {
    name: 'real-grant-medical-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Grant_Medical_College_building.jpg/960px-Grant_Medical_College_building.jpg'
  },
  {
    name: 'real-ict-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/ICT_Mumbai_Main_Building.jpg/960px-ICT_Mumbai_Main_Building.jpg'
  },
  {
    name: 'real-mu-fort-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Mumbai_University_Fort_Campus.jpg/960px-Mumbai_University_Fort_Campus.jpg'
  },
  {
    name: 'real-tiss-mumbai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/TISS_Main_Campus_Entrance.jpg/960px-TISS_Main_Campus_Entrance.jpg'
  },

  // 2. Pune
  {
    name: 'real-sppu-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/University_of_Pune%2C_Pune.jpg/960px-University_of_Pune%2C_Pune.jpg'
  },
  {
    name: 'real-coep-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/COEP_Main_Building_Front_View.jpg/960px-COEP_Main_Building_Front_View.jpg'
  },
  {
    name: 'real-fergusson-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Main_Building_of_Fergusson_College.jpg/960px-Main_Building_of_Fergusson_College.jpg'
  },
  {
    name: 'real-vit-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Vit_image.jpg/960px-Vit_image.jpg'
  },
  {
    name: 'real-symbiosis-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Symbiosis_Law_School%2C_Pune.jpg'
  },
  {
    name: 'real-bharati-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Bharti_vidyapith_%282%29.JPG/960px-Bharti_vidyapith_%282%29.JPG'
  },
  {
    name: 'real-bj-medical-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/BJ_Government_Medical_College_Pune.jpg/960px-BJ_Government_Medical_College_Pune.jpg'
  },
  {
    name: 'real-agri-college-pune.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/College_of_Agriculture_Pune_Main_Building.jpg/960px-College_of_Agriculture_Pune_Main_Building.jpg'
  },

  // 3. Kolhapur & Sangli
  {
    name: 'real-shivaji-uni-kolhapur.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Shivaji_University_Main_Administrative_Building.jpg/960px-Shivaji_University_Main_Administrative_Building.jpg'
  },
  {
    name: 'real-rajaram-kolhapur.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Rajaram_College_Kolhapur.jpg/960px-Rajaram_College_Kolhapur.jpg'
  },
  {
    name: 'real-walchand-sangli.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Walchand_College_of_Engineering%2C_Sangli_Administrative_Building.jpg/960px-Walchand_College_of_Engineering%2C_Sangli_Administrative_Building.jpg'
  },
  {
    name: 'real-gmc-miraj.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/GMC_Miraj_OPD.png'
  },

  // 4. Satara & Solapur
  {
    name: 'real-gcek-karad.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/GCEKPhoto.jpg/960px-GCEKPhoto.jpg'
  },
  {
    name: 'real-yc-satara.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Yashwantrao_Chavan_Institute_of_Science_Satara.jpg/960px-Yashwantrao_Chavan_Institute_of_Science_Satara.jpg'
  },
  {
    name: 'real-solapur-university.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Punyashlok_Ahilyadevi_Holkar_Solapur_University_gate.jpg/960px-Punyashlok_Ahilyadevi_Holkar_Solapur_University_gate.jpg'
  },

  // 5. Marathwada (CSMB, Nanded, Latur)
  {
    name: 'real-bamu-csmb.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Dr_Babasaheb_Ambedkar%27s_statue_in_Dr._Babasaheb_Ambedkar_Marathwada_University.jpg/960px-Dr_Babasaheb_Ambedkar%27s_statue_in_Dr._Babasaheb_Ambedkar_Marathwada_University.jpg'
  },
  {
    name: 'real-geca-csmb.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/GECA_Main_Building.jpg/960px-GECA_Main_Building.jpg'
  },
  {
    name: 'real-sggs-nanded.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/SGGS.jpg'
  },
  {
    name: 'real-srmt-nanded.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/SRTM_University_Nanded_Campus.jpg/960px-SRTM_University_Nanded_Campus.jpg'
  },
  {
    name: 'real-dayanand-latur.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Dayanand_Science_College_Latur.jpg/960px-Dayanand_Science_College_Latur.jpg'
  },

  // 6. Nashik, Ahilyanagar & Jalgaon
  {
    name: 'real-kkw-nashik.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/KK_Wagh_Engineering_College_Nashik.jpg/960px-KK_Wagh_Engineering_College_Nashik.jpg'
  },
  {
    name: 'real-mpkv-rahuri.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/MPKV_Main_Administrative_Building.JPG/960px-MPKV_Main_Administrative_Building.JPG'
  },
  {
    name: 'real-nmu-jalgaon.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kavayitri_Bahinabai_Chaudhari_North_Maharashtra_University_Jalgaon.jpg/960px-Kavayitri_Bahinabai_Chaudhari_North_Maharashtra_University_Jalgaon.jpg'
  },

  // 7. Vidarbha (Nagpur & Amravati)
  {
    name: 'real-iim-nagpur.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/IIM_Nagpur-1500x900.jpg/960px-IIM_Nagpur-1500x900.jpg'
  },
  {
    name: 'real-vnit-nagpur.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VNIT_Nagpur_Auditorium.jpg/960px-VNIT_Nagpur_Auditorium.jpg'
  },
  {
    name: 'real-rtmnu-nagpur.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/RTMNU_Nagpur_Administrative_Building.jpg/960px-RTMNU_Nagpur_Administrative_Building.jpg'
  },
  {
    name: 'real-gcoea-amravati.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Government_College_of_Engineering_Amravati.jpg/960px-Government_College_of_Engineering_Amravati.jpg'
  },
  {
    name: 'real-sgbau-amravati.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Sant_Gadge_Baba_Amravati_University.jpg/960px-Sant_Gadge_Baba_Amravati_University.jpg'
  }
];

function download(item) {
  return new Promise((resolve) => {
    function tryFetch(targetUrl) {
      try {
        const parsed = new URL(targetUrl);
        const mod = parsed.protocol === 'https:' ? https : http;
        const options = {
          headers: {
            'User-Agent': 'ConnectMarathaEdu/2.0 (https://connectmaratha.org; contact@connectmaratha.org)'
          }
        };
        const req = mod.get(targetUrl, options, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let nextUrl = res.headers.location;
            if (!nextUrl.startsWith('http')) {
              nextUrl = new URL(nextUrl, targetUrl).href;
            }
            return tryFetch(nextUrl);
          }
          if (res.statusCode !== 200) {
            console.log(`[SKIP] Status ${res.statusCode} for ${item.name}`);
            return resolve(false);
          }
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            if (buf.length < 5000) {
              console.log(`[SKIP] File too small (${buf.length} bytes) for ${item.name}`);
              return resolve(false);
            }
            const p1 = path.join(__dirname, 'public', 'assets', 'images', item.name);
            const p2 = path.join(__dirname, 'frontend', 'public', 'assets', 'images', item.name);
            fs.writeFileSync(p1, buf);
            if (fs.existsSync(path.join(__dirname, 'frontend', 'public', 'assets', 'images'))) {
              fs.writeFileSync(p2, buf);
            }
            console.log(`[OK] Downloaded ${item.name} (${Math.round(buf.length / 1024)} KB)`);
            resolve(true);
          });
        });
        req.on('error', (err) => {
          console.log(`[ERR] ${item.name}: ${err.message}`);
          resolve(false);
        });
      } catch (err) {
        console.log(`[ERR] parse URL: ${err.message}`);
        resolve(false);
      }
    }
    tryFetch(item.url);
  });
}

async function run() {
  console.log(`Starting real college photo downloader (${COLLEGES.length} colleges)...`);
  let successCount = 0;
  for (const item of COLLEGES) {
    const ok = await download(item);
    if (ok) successCount++;
  }
  console.log(`Done! Downloaded ${successCount}/${COLLEGES.length} real campus photos.`);
}

run();
