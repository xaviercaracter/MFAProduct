const { sequelize } = require('./config/database');
const User = require('./models/User');

const testAccounts = [
    {
        firstName: 'John',
        lastName: 'Admin',
        email: 'admin@test.com',
        phoneNumber: '+1 (555) 123-4567',
        password: 'Admin123!'
    },
    {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'user@test.com',
        phoneNumber: '+1 (555) 987-6543',
        password: 'User123!'
    },
    {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'test1@example.com',
        phoneNumber: '+1 (555) 111-2222',
        password: 'Test123!'
    },
    {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'test2@example.com',
        phoneNumber: '+1 (555) 333-4444',
        password: 'Test456!'
    },
    {
        firstName: 'Carol',
        lastName: 'Wilson',
        email: 'test3@example.com',
        phoneNumber: '+1 (555) 555-6666',
        password: 'Test789!'
    },
    {
        firstName: 'Emma',
        lastName: 'Thompson',
        email: 'uk@test.com',
        phoneNumber: '+44 20 7946 0958',
        password: 'UK123!'
    },
    {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'canada@test.com',
        phoneNumber: '+1 (416) 555-0123',
        password: 'Canada123!'
    },
    {
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'australia@test.com',
        phoneNumber: '+61 2 9876 5432',
        password: 'Australia123!'
    }
];

async function seedTestAccounts() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Check if users already exist
        const existingUsers = await User.findAll();
        if (existingUsers.length > 0) {
            console.log(`Found ${existingUsers.length} existing users. Skipping seeding.`);
            console.log('Use check_users.js to view existing users.');
            return;
        }

        console.log('Seeding test accounts...\n');

        // Create test accounts
        for (const account of testAccounts) {
            try {
                await User.create(account);
                console.log(`✓ Created account: ${account.firstName} ${account.lastName} (${account.email})`);
            } catch (error) {
                console.log(`✗ Failed to create account: ${account.email} - ${error.message}`);
            }
        }

        console.log('\n=== Seeding Complete ===');
        
        // Show final count
        const finalCount = await User.count();
        console.log(`Total users in database: ${finalCount}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

seedTestAccounts();
