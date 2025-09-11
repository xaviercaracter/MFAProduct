#!/usr/bin/env node

/**
 * Simple test runner for Twilio service tests
 * This script can be used to run Twilio-specific tests without running the full test suite
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Twilio Service Tests...\n');

try {
  // Run only the Twilio service tests
  const testCommand = `npx jest test/twilioService.test.js --verbose`;
  
  console.log(`Executing: ${testCommand}\n`);
  
  execSync(testCommand, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Twilio service tests completed successfully!');
  
} catch (error) {
  console.error('\n❌ Twilio service tests failed!');
  console.error('Make sure you have installed dependencies: npm install');
  console.error('If this is the first time running tests, you may need to install Jest:');
  console.error('npm install --save-dev jest');
  process.exit(1);
}

