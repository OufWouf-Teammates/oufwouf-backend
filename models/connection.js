const mongoose = require('mongoose');

const connectionString = process.env.CONNECTION_STRING;
 
mongoose.connect(connectionString, {
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,})
  .then(() => {
    console.log('Database connected.');
  })
  .catch((error) => {
    console.error('Erreur de connexion à MongoDB :', error.message);
  });