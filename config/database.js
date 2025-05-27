const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'mfa_system',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log, // Enable logging to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        console.log('Connection details:', {
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        console.error('Connection details used:', {
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        });
        console.error('Please check your .env file and PostgreSQL configuration.');
    }
};

module.exports = {
    sequelize,
    testConnection
}; 