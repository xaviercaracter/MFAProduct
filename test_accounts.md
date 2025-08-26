# Test Accounts for MFA System

## Standard Test Accounts

### Admin User
- **Email:** admin@test.com
- **Password:** Admin123!
- **First Name:** John
- **Last Name:** Admin
- **Phone:** +1 (555) 123-4567
- **Role:** Administrator

### Regular User
- **Email:** user@test.com
- **Password:** User123!
- **First Name:** Jane
- **Last Name:** Doe
- **Phone:** +1 (555) 987-6543
- **Role:** Standard User

### Test User 1
- **Email:** test1@example.com
- **Password:** Test123!
- **First Name:** Alice
- **Last Name:** Johnson
- **Phone:** +1 (555) 111-2222
- **Role:** Standard User

### Test User 2
- **Email:** test2@example.com
- **Password:** Test456!
- **First Name:** Bob
- **Last Name:** Smith
- **Phone:** +1 (555) 333-4444
- **Role:** Standard User

### Test User 3
- **Email:** test3@example.com
- **Password:** Test789!
- **First Name:** Carol
- **Last Name:** Wilson
- **Phone:** +1 (555) 555-6666
- **Role:** Standard User

## Edge Case Test Accounts

### Locked Account (for testing account lockout)
- **Email:** locked@test.com
- **Password:** WrongPassword123!
- **First Name:** Locked
- **Last Name:** User
- **Phone:** +1 (555) 777-8888
- **Status:** Account locked after 3 failed attempts

### Expired Session Account
- **Email:** expired@test.com
- **Password:** Expired123!
- **First Name:** Expired
- **Last Name:** Session
- **Phone:** +1 (555) 999-0000
- **Status:** Session expired (for testing session timeout)

## International Test Accounts

### UK User
- **Email:** uk@test.com
- **Password:** UK123!
- **First Name:** Emma
- **Last Name:** Thompson
- **Phone:** +44 20 7946 0958
- **Country:** United Kingdom

### Canadian User
- **Email:** canada@test.com
- **Password:** Canada123!
- **First Name:** Michael
- **Last Name:** Brown
- **Phone:** +1 (416) 555-0123
- **Country:** Canada

### Australian User
- **Email:** australia@test.com
- **Password:** Australia123!
- **First Name:** Sarah
- **Last Name:** Davis
- **Phone:** +61 2 9876 5432
- **Country:** Australia

## Invalid Test Accounts (for negative testing)

### Non-existent User
- **Email:** nonexistent@test.com
- **Password:** AnyPassword123!
- **Expected Result:** "Invalid credentials" error

### Wrong Password
- **Email:** user@test.com
- **Password:** WrongPassword123!
- **Expected Result:** "Invalid credentials" error, increment login attempts

### Invalid Email Format
- **Email:** invalid-email
- **Password:** AnyPassword123!
- **Expected Result:** Email validation error

### Empty Fields
- **Email:** (empty)
- **Password:** (empty)
- **Expected Result:** Required field validation errors

## Password Requirements Test Accounts

### Weak Password (for testing password validation)
- **Email:** weakpass@test.com
- **Password:** weak
- **Expected Result:** Password strength validation error

### Missing Uppercase
- **Email:** noupper@test.com
- **Password:** lowercase123!
- **Expected Result:** Password must contain uppercase letter

### Missing Lowercase
- **Email:** nolower@test.com
- **Password:** UPPERCASE123!
- **Expected Result:** Password must contain lowercase letter

### Missing Number
- **Email:** nonumber@test.com
- **Password:** NoNumber!
- **Expected Result:** Password must contain number

## Phone Number Test Accounts

### Invalid Phone Format
- **Email:** invalidphone@test.com
- **Password:** Valid123!
- **Phone:** 123
- **Expected Result:** Phone number validation error

### International Phone
- **Email:** international@test.com
- **Password:** Valid123!
- **Phone:** +33 1 42 86 87 88
- **Country:** France

## Notes for Testing

1. **Verification Codes**: When testing login, check the console logs for the 6-digit verification codes that are generated
2. **Session Timeout**: Test the 10-minute session timeout by leaving the application idle
3. **Rate Limiting**: Test the 3-attempt login limit before account lockout
4. **MFA Flow**: Test the complete MFA flow: login → receive code → enter code → access application
5. **Account Creation**: Use these accounts to test the create account functionality
6. **Error Handling**: Test various error scenarios using the invalid accounts

## Database Seeding

To populate your database with these test accounts, you can create a seeding script or manually create them through your application's registration process.

## Security Note

⚠️ **IMPORTANT**: These are test accounts only. Never use these credentials in production or share them publicly. Change all passwords and remove these accounts before deploying to production.
