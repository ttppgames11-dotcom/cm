// verify_all_portals_comprehensive.mjs
const BASE_URL = 'http://localhost:5000/api';

async function runComprehensiveVerification() {
  console.log('================================================================');
  console.log('CONNECT MARATHA — 17 PORTALS COMPREHENSIVE ECOSYSTEM VERIFICATION');
  console.log('================================================================\n');

  const portalEndpoints = [
    // --- 7 Education, Knowledge & Heritage Portals ---
    { portal: '1. Higher Education & Career (/education)', url: `${BASE_URL}/portals/colleges` },
    { portal: '2. Colleges & Institutions Directory (/colleges)', url: `${BASE_URL}/colleges` },
    { portal: '3. Scholarships & Student Aid (/scholarships)', url: `${BASE_URL}/portals/scholarships` },
    { portal: '4. Swarajya History Quiz (/quiz)', url: `${BASE_URL}/quiz/questions` },
    { portal: '5. Maratha Dnyankosh (/dnyankosh)', url: `${BASE_URL}/portals/dnyankosh` },
    { portal: '6. Digital Library & Bakhar Archive (/history/granthalaya)', url: `${BASE_URL}/portals/library` },
    { portal: '7. Maharashtra Time Machine (/time-machine)', url: `${BASE_URL}/portals/time-machine/events` },

    // --- 5 Social Welfare Portals ---
    { portal: '8. Digital Community Forum (/community)', url: `${BASE_URL}/community/posts` },
    { portal: '9. 24x7 Emergency Blood Help (/blood)', url: `${BASE_URL}/blood/donors` },
    { portal: '10. Matrimony & Family Center (/matrimony)', url: `${BASE_URL}/matrimony` },
    { portal: '11. Women Empowerment Center (/women)', url: `${BASE_URL}/women/programs` },
    { portal: '12. Fort Conservation & Donations (/donation)', url: `${BASE_URL}/donations/campaigns` },

    // --- 5 Organization, Leadership & Media Portals ---
    { portal: '13. Maratha Social Organizations (/organizations)', url: `${BASE_URL}/organizations` },
    { portal: '14. Political Leadership Grievances (/political)', url: `${BASE_URL}/political/grievances` },
    { portal: '15. Social Workers & Volunteers (/social-workers)', url: `${BASE_URL}/social-workers` },
    { portal: '16. Maratha Civil Services (IAS/IPS) (/officers)', url: `${BASE_URL}/officers` },
    { portal: '17. Maratha News & E-Papers (/maratha-news)', url: `${BASE_URL}/maratha-news` },
  ];

  let passedCount = 0;

  for (const item of portalEndpoints) {
    try {
      const res = await fetch(item.url);
      const data = await res.json();
      let recordCount = 0;
      if (Array.isArray(data)) {
        recordCount = data.length;
      } else if (data && typeof data === 'object') {
        const primaryKey = Object.keys(data).find(k => Array.isArray(data[k]));
        if (primaryKey) {
          recordCount = data[primaryKey].length;
        } else if (data.data && Array.isArray(data.data)) {
          recordCount = data.data.length;
        } else {
          recordCount = Object.keys(data).length;
        }
      }
      if (res.ok) {
        console.log(`[PASS] ${item.portal.padEnd(52)} -> HTTP ${res.status} | Data items: ${recordCount}`);
        passedCount++;
      } else {
        console.log(`[FAIL] ${item.portal.padEnd(52)} -> HTTP ${res.status} | Error: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error(`[FAIL] ${item.portal.padEnd(52)} -> Error: ${err.message}`);
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Summary: ${passedCount} of ${portalEndpoints.length} Portals API Endpoints Verified Successfully!`);
  console.log('----------------------------------------------------------------\n');
}

runComprehensiveVerification();
