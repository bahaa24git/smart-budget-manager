const sql = require('mssql');

const config = {
  user: 'Ahmed',
  password: '22122004',
  server: 'AHMEDNG',
  database: 'SmartBudgetDB', 
  options: {
    encrypt: false, 
    trustServerCertificate: true // Allow self-signed certs
  }
};

const connectToDatabase = async () => {
  try {
    await sql.connect(config);
    console.log('Connected to SQL Server successfully.');
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};

module.exports = {
  sql,
  connectToDatabase
};