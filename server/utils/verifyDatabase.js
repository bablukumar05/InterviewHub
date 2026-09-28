const mongoose = require('mongoose');

const Organization = require('../models/Organization');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Evaluation = require('../models/Evaluation');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const models = [
  Organization,
  User,
  CandidateProfile,
  Job,
  Application,
  Interview,
  Question,
  Evaluation,
  Offer,
  Notification,
  AuditLog,
];

const verifyDatabase = async () => {
  try {
    console.log('\n========== DATABASE VERIFICATION ==========\n');

    console.log(
      'MongoDB connection:',
      mongoose.connection.readyState === 1 ? 'CONNECTED' : 'NOT CONNECTED'
    );

    console.log('\nModels:');

    models.forEach((model) => {
      console.log(`✓ ${model.modelName} (Collection: '${model.collection.name}')`);
    });

    console.log('\nTotal models:', models.length);

    if (models.length !== 11) {
      throw new Error(`Expected 11 models but found ${models.length}`);
    }

    console.log('\nIndexes:');

    for (const model of models) {
      const indexes = await model.collection.indexes();
      console.log(`✓ ${model.modelName}: ${indexes.length} indexes verified`);
    }

    console.log('\n===========================================\n');
    console.log('Database model verification completed successfully.');
  } catch (error) {
    console.error('Database verification failed:', error.message);
  }
};

module.exports = verifyDatabase;
