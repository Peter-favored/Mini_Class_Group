// test-db.js
import sequelize from './src/MySql/database.js';

(async () => {
  try {
    await sequelize.authenticate();            
    console.log('Database connection OK');

    
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();