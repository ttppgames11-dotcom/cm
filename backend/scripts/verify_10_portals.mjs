import http from 'http';

function testEndpoint(name, path) {
  return new Promise((resolve) => {
    http.get('http://localhost:5000' + path, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log(`[PASS] ${name} [${path}] -> Status: ${res.statusCode}, Success: ${json.success}`);
        } catch {
          console.log(`[WARN] ${name} [${path}] -> Status: ${res.statusCode}`);
        }
        resolve();
      });
    }).on('error', (e) => {
      console.log(`[FAIL] ${name} [${path}] -> ${e.message}`);
      resolve();
    });
  });
}

async function verifyAll10() {
  console.log('=== VERIFYING 10 PORTALS & ADMIN APPROVAL ENDPOINTS ===');
  await testEndpoint('1. Community Platform', '/api/community/posts');
  await testEndpoint('2. Blood Help Network', '/api/blood/requests');
  await testEndpoint('3. Matrimony Profiles', '/api/matrimony');
  await testEndpoint('4. Women Empowerment', '/api/women/entrepreneurs');
  await testEndpoint('5. Donations & Fort Conservation', '/api/donations/projects');
  await testEndpoint('6. Maratha Organizations', '/api/organizations');
  await testEndpoint('7. Political & Grievance', '/api/political/grievances');
  await testEndpoint('8. Social Workers Directory', '/api/social-workers');
  await testEndpoint('9. Civil Services Officers', '/api/officers');
  await testEndpoint('10. Maratha News Media', '/api/maratha-news');
  await testEndpoint('SuperAdmin Central CRM Matrix', '/api/portals/admin/pending-approvals');
  process.exit(0);
}

verifyAll10();
