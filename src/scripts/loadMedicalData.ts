import dotenv from 'dotenv';
import path from 'path';
import { medicalData } from './data/medicalData';
import knowledgeBaseService from '../services/knowledgeBaseService';
import logger from '../config/logger';

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}
console.log('Environment loaded');

async function loadMedicalData() {
  try {
    // Initialize the knowledge base (creates index if it doesn't exist)
    await knowledgeBaseService.initialize();
    logger.info('Knowledge base initialized');

    // Add documents in batches
    const batchSize = 5;
    for (let i = 0; i < medicalData.length; i += batchSize) {
      const batch = medicalData.slice(i, i + batchSize);
      await knowledgeBaseService.addDocuments(batch);
      logger.info(`Loaded batch ${i / batchSize + 1} of ${Math.ceil(medicalData.length / batchSize)}`);
    }

    logger.info('Successfully loaded all medical data');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to load medical data:', error);
    process.exit(1);
  }
}

// Run the script
loadMedicalData(); 