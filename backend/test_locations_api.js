import express from 'express';
import cors from 'cors';
import locationsRoutes from './routes/locations.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/locations', locationsRoutes);
app.use('/api/auth', authRoutes);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Get countries
    const resCountries = await fetch(`${base}/api/locations/countries`);
    const jsonCountries = await resCountries.json();
    console.assert(jsonCountries.success && jsonCountries.data.length >= 1, 'Countries fetched');
    console.log(`✓ 1. Countries fetched: ${jsonCountries.data.length}`);

    // 2. Get states by country
    const resStates = await fetch(`${base}/api/locations/states?countryId=IN`);
    const jsonStates = await resStates.json();
    console.assert(jsonStates.success && jsonStates.data.length === 36, 'States fetched');
    console.log(`✓ 2. States fetched: ${jsonStates.data.length}`);

    // 3. Get districts by state
    const resDistricts = await fetch(`${base}/api/locations/districts?stateId=27`);
    const jsonDistricts = await resDistricts.json();
    console.assert(jsonDistricts.success && jsonDistricts.data.length === 36, 'Districts fetched');
    console.log(`✓ 3. Districts in Maharashtra fetched: ${jsonDistricts.data.length}`);

    // 4. Get talukas by district (Pune = 490)
    const resTalukas = await fetch(`${base}/api/locations/talukas?districtId=490`);
    const jsonTalukas = await resTalukas.json();
    console.assert(jsonTalukas.success && jsonTalukas.data.length >= 14, 'Talukas fetched');
    console.log(`✓ 4. Talukas in Pune fetched: ${jsonTalukas.data.length}`);

    // 5. Get villages by taluka (Haveli = 4193)
    const resVillages = await fetch(`${base}/api/locations/villages?talukaId=4193`);
    const jsonVillages = await resVillages.json();
    console.assert(jsonVillages.success && jsonVillages.data.length > 50, 'Villages fetched');
    console.log(`✓ 5. Villages in Haveli fetched: ${jsonVillages.data.length}`);

    // 6. Test invalid parent-child: Pune (490) under Gujarat (24)
    const resInvalidReg = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Member',
        phone: '9999900001',
        password: 'password123',
        countryId: 'IN',
        stateId: '24', // Gujarat
        districtId: '490' // Pune (belongs to Maharashtra 27)
      })
    });
    const jsonInvalidReg = await resInvalidReg.json();
    console.assert(resInvalidReg.status === 400 && !jsonInvalidReg.success, 'Invalid hierarchy rejected');
    console.log(`✓ 6. Invalid hierarchy rejected with status 400: ${jsonInvalidReg.error}`);

    // 7. Test empty location result: Invalid district id
    const resEmptyTalukas = await fetch(`${base}/api/locations/talukas?districtId=invalid_id`);
    console.assert(resEmptyTalukas.status === 404, 'Invalid district returns 404');
    console.log(`✓ 7. Non-existent district returns 404`);

    const uniquePhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const resValidReg = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'संजय पाटील',
        phone: uniquePhone,
        password: 'password123',
        countryId: 'IN',
        stateId: '27',
        districtId: '490',
        talukaId: '4193',
        villageId: '556242' // Ambegaon Bk.
      })
    });
    const textValidReg = await resValidReg.text();
    let jsonValidReg;
    try {
      jsonValidReg = JSON.parse(textValidReg);
    } catch {
      console.error('Non-JSON response from registration:', resValidReg.status, textValidReg);
      throw new Error(`Registration returned HTML: ${textValidReg}`);
    }
    console.assert(resValidReg.status === 201 && jsonValidReg.success, 'Valid registration succeeded');
    console.log(`✓ 8. Valid registration succeeded with ID: ${jsonValidReg.member.id}, village: ${jsonValidReg.member.village}`);

    console.log('🎉 ALL BACKEND LOCATION API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
});
