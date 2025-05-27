MFA System
User Creates and acct and their details get added to a user table
The user table will contain:
- FN
- LN
- Email to be used as the username
- Phone Number to send verification codes to
- Generates a user ID unique to this user

Password gets added to a password table for the specific user usung the unique ID created
utilizing a One to Many relationship

On Login:
(Happy Path)
Username and Most recent password are verified to match what was given
generate a 6 digit verification code
send the code to the User's phone number
User enters the given correct verification code
Generate Session ID and Session Token for the user
User logs in and session timer starts
User now has access to the application and their application data

(Not happy path)
- User will be allowed only 3 login attempts before lockout and having to reset password via text message link
- After 3 total failiures in the history of account, lock the user out and have them to to customer service, details to be pulled from config/property file
User attepmpts login
User verification fails
Throw an error to be displayed and increment login attempts by one, show something on screen like "___ login attempts remaining" after reloading the login page
user logs in with correct credentials
6 digit verification code is generated and sent to the user's phone number
User enters incorrect verification code, throw error to be displayed "Verification code is incorrect", generate another code, increment login attempts by 1
User inputs the correct verification code
Generate Session ID and Session Token for the user
User logs in and session timer starts
User now has access to their app data and the application


After 10 minutes of the session timer elapsing with no user activity, automatically log out the user
Make the 6-digit random number generator modular for multiple str or digit lengths and to be used in other apps
Start out utilizing REST api practices and expand into RESTful API practices