# Testing Guide

This directory contains test files for the MFA System.

## Setup

1. Install dependencies (including Jest):
   ```bash
   npm install
   ```

2. Run all tests:
   ```bash
   npm test
   ```

3. Run tests in watch mode (for development):
   ```bash
   npm run test:watch
   ```

4. Run tests with coverage report:
   ```bash
   npm run test:coverage
   ```

## Twilio Service Tests

The `twilioService.test.js` file contains comprehensive tests for the Twilio messaging service:

### Test Coverage

- **Constructor Tests**: Validates service initialization with/without credentials
- **sendVerificationCode**: Tests SMS verification code sending
- **sendWelcomeMessage**: Tests welcome message functionality
- **sendAccountLockedMessage**: Tests account lock notification
- **Phone Number Validation**: Tests formatting and validation utilities
- **Error Handling**: Tests various error scenarios and edge cases
- **Integration Scenarios**: Tests multiple operations in sequence

### Running Twilio Tests Only

You can run just the Twilio service tests using:

```bash
# Using the custom test runner
node test-twilio.js

# Or using Jest directly
npx jest test/twilioService.test.js
```

### Test Environment

Tests use mocked Twilio client to avoid:
- Sending actual SMS messages during testing
- Requiring valid Twilio credentials for tests
- Incurring costs during development

**Test Phone Number**: The tests use `+18777804236` as the test phone number for all SMS operations.

**From Number**: The tests use `+18777577620` as the sender number (from `TWILIO_PHONE_NUMBER` environment variable).

### Mocking Strategy

The tests mock the Twilio client using Jest's mocking capabilities:
- `twilio` module is mocked to return a controlled test client
- All SMS operations are intercepted and can be verified
- Error scenarios can be simulated by rejecting promises

### Environment Variables

Tests handle various environment variable scenarios:
- Missing Twilio credentials
- Missing phone number configuration
- Valid configuration setup

## Adding New Tests

When adding new tests:

1. Follow the existing naming convention: `*.test.js`
2. Place test files in the `test/` directory
3. Use descriptive test names and group related tests with `describe` blocks
4. Mock external dependencies appropriately
5. Test both success and error scenarios
6. Include edge cases and boundary conditions

## Test Structure

```javascript
describe('ServiceName', () => {
  beforeEach(() => {
    // Setup for each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('MethodName', () => {
    it('should handle success case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```
