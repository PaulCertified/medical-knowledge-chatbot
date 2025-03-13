import fs from 'fs/promises';
import path from 'path';
import knowledgeBaseService from '../services/knowledgeBaseService';
import { KnowledgeBaseDocument } from '../types/knowledgeBase';
import logger from '../utils/logger';

const BATCH_SIZE = 10;

async function loadMedicalData() {
  try {
    const dataDir = path.join(__dirname, '../../data/medical');
    const files = await fs.readdir(dataDir);
    const textFiles = files.filter(file => file.endsWith('.txt'));

    for (let i = 0; i < textFiles.length; i += BATCH_SIZE) {
      const batch: KnowledgeBaseDocument[] = [];
      const batchFiles = textFiles.slice(i, i + BATCH_SIZE);

      for (const file of batchFiles) {
        const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
        batch.push({
          title: file.replace('.txt', ''),
          content: content.trim(),
        });
      }

      await knowledgeBaseService.addDocuments(batch);
      logger.info(`Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(textFiles.length / BATCH_SIZE)}`);
    }

    logger.info('Successfully loaded all medical data');
  } catch (error) {
    logger.error('Error loading medical data:', error);
    throw error;
  }
}

loadMedicalData().catch(error => {
  logger.error('Failed to load medical data:', error);
  process.exit(1);
}); 