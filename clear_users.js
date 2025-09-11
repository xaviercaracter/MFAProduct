const { sequelize } = require('./config/database');
const User = require('./models/User');
const VerificationCode = require('./models/VerificationCode');

async function clearUsers() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Get counts before deletion
        const userCount = await User.count();
        const verificationCodeCount = await VerificationCode.count();
        
        console.log(`\nFound ${userCount} users in the database.`);
        console.log(`Found ${verificationCodeCount} verification codes in the database.`);

        if (userCount === 0) {
            console.log('No users to delete. Database is already empty.');
            return;
        }

        // Confirm deletion
        console.log('\n⚠️  WARNING: This will permanently delete ALL users and verification codes from the database!');
        console.log('This action cannot be undone.');
        
        // Delete verification codes first (due to foreign key constraint)
        if (verificationCodeCount > 0) {
            const deletedCodes = await VerificationCode.destroy({
                where: {},
                force: true
            });
            console.log(`\n✅ Deleted ${deletedCodes} verification codes.`);
        }
        
        // Delete all users
        const deletedCount = await User.destroy({
            where: {},
            force: true // This ensures hard delete
        });

        console.log(`✅ Successfully deleted ${deletedCount} users from the database.`);

        // Verify deletion
        const remainingUsers = await User.count();
        const remainingCodes = await VerificationCode.count();
        console.log(`\nRemaining users in database: ${remainingUsers}`);
        console.log(`Remaining verification codes in database: ${remainingCodes}`);

    } catch (error) {
        console.error('Error clearing users:', error.message);
        console.error('Full error:', error);
    } finally {
        await sequelize.close();
        console.log('\nDatabase connection closed.');
    }
}

// Run the function
clearUsers();
