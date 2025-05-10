const sql = require('mssql');

const models = {
  user: 'Ahmed',
  password: '22122004',
  server: 'AHMEDNG',
  database: 'SmartBudgetDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const connectToDatabase = async () => {
  try {
    const pool = await sql.connect(models);
    console.log('Connected to SQL Server successfully.');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};

module.exports = {
  sql,
  connectToDatabase // Make sure this is exported
};