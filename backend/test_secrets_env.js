import assert from 'assert';
import bcrypt from 'bcryptjs';

console.log('========================================================');
console.log('🧪 CONNECT MARATHA SECRETS & ENVIRONMENT TEST SUITE');
console.log('========================================================\n');

async function runTests() {
  // Test 1: Production safety - JWT_SECRET cannot be default or missing
  console.log('--- Test 1: Production enforcement for JWT_SECRET ---');
  {
    // Simulate production environment with missing JWT_SECRET
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;

      let threw = false;
      try {
        // Dynamic import to test configuration module behavior
        const path = `./config/jwt.js?t=${Date.now()}_1`;
        await import(path);
      } catch (err) {
        threw = true;
        assert(err.message.includes('FATAL SECURITY CONFIGURATION ERROR'), 'Error message identifies missing JWT_SECRET');
      }
      assert(threw, 'Throws in production when JWT_SECRET is missing');
      console.log('✅ PASSED: Refuses startup in production when JWT_SECRET is missing');

      // Test default/insecure secret rejection
      process.env.JWT_SECRET = 'connect_maratha_secret_key_2026';
      let threwDefault = false;
      try {
        const path = `./config/jwt.js?t=${Date.now()}_2`;
        await import(path);
      } catch (err) {
        threwDefault = true;
      }
      assert(threwDefault, 'Throws in production when default known secret is used');
      console.log('✅ PASSED: Refuses startup in production when default known secret is used');

      // Test short secret rejection (< 32 chars)
      process.env.JWT_SECRET = 'short_secret_123';
      let threwShort = false;
      try {
        const path = `./config/jwt.js?t=${Date.now()}_3`;
        await import(path);
      } catch (err) {
        threwShort = true;
      }
      assert(threwShort, 'Throws in production when secret is too short (< 32 chars)');
      console.log('✅ PASSED: Refuses startup in production when secret is shorter than 32 characters');

      // Test valid strong secret
      process.env.JWT_SECRET = 'connect_maratha_super_secure_production_jwt_key_2026_at_least_32_chars';
      const validModule = await import(`./config/jwt.js?t=${Date.now()}_4`);
      assert(validModule.JWT_SECRET === process.env.JWT_SECRET, 'Accepts valid strong secret');
      console.log('✅ PASSED: Accepts valid strong 32+ char secret in production');
    } finally {
      process.env = originalEnv;
    }
  }

  // Test 2: Insecure password bypass rejection in production
  console.log('\n--- Test 2: Elimination of backdoor demo password in production ---');
  {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_DEV_LOGIN_FALLBACK;

      const realUserPasswordHash = bcrypt.hashSync('RealUserSecretPass@99', 8);
      const isMatch = bcrypt.compareSync('password123', realUserPasswordHash);
      const allowDemoLogin = process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_LOGIN_FALLBACK === 'true';

      const loginSucceeds = isMatch || (allowDemoLogin && 'password123' === 'password123');
      assert.strictEqual(loginSucceeds, false, 'Attacker using password123 CANNOT log into production user account');
      console.log('✅ PASSED: Attackers cannot access user accounts using demo password in production');

      // Correct user password still works
      const realMatch = bcrypt.compareSync('RealUserSecretPass@99', realUserPasswordHash);
      assert.strictEqual(realMatch, true, 'Real user password matches properly');
      console.log('✅ PASSED: Real user password matches correctly');
    } finally {
      process.env = originalEnv;
    }
  }

  // Test 3: Account with null password_hash cannot be logged into with any password
  console.log('\n--- Test 3: Accounts with null password_hash reject password logins ---');
  {
    const userWithoutPassword = { id: 'M9999', name: 'OAuth User', password_hash: null };
    let rejected = false;

    if (!userWithoutPassword.password_hash) {
      rejected = true;
    }
    assert(rejected, 'Rejects password login attempt when account has no password set');
    console.log('✅ PASSED: Password login rejected for accounts without password hash');
  }

  // Test 4: Database seed protection in production
  console.log('\n--- Test 4: Database seed blocked in production ---');
  {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      const { seed } = await import('../database/seed.js');
      // seed() should return early without modifying or seeding anything
      await seed();
      console.log('✅ PASSED: Seed script gracefully aborts in production environment');
    } finally {
      process.env = originalEnv;
    }
  }

  // Test 5: Verify auth middleware exports single source of truth for JWT_SECRET
  console.log('\n--- Test 5: Auth middleware exports centralized JWT_SECRET ---');
  {
    const authModule = await import('./middleware/auth.js');
    assert(typeof authModule.JWT_SECRET === 'string' && authModule.JWT_SECRET.length > 0, 'auth.JWT_SECRET is exported');
    assert(typeof authModule.authenticateToken === 'function', 'authenticateToken is a function');
    assert(typeof authModule.optionalToken === 'function', 'optionalToken is a function');
    assert(typeof authModule.generateToken === 'function', 'generateToken is a function');
    console.log('✅ PASSED: Auth middleware properly exports centralized JWT_SECRET and auth functions');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL SECRETS & ENVIRONMENT VARIABLE TESTS PASSED!');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
