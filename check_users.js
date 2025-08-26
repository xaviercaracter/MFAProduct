const { sequelize } = require('./config/database');
const User = require('./models/User');

async function checkUsers() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Get all users
        const users = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'loginAttempts', 'isLocked', 'createdAt']
        });

        console.log('\n=== Current Users in Database ===');
        console.log(`Total users: ${users.length}\n`);

        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Phone: ${user.phoneNumber}`);
                console.log(`   Login Attempts: ${user.loginAttempts}`);
                console.log(`   Locked: ${user.isLocked ? 'Yes' : 'No'}`);
                console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
