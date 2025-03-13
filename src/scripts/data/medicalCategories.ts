export const medicalCategories = {
  GENERAL_HEALTH: 'general-health',
  FIRST_AID: 'first-aid',
  CHRONIC_CONDITIONS: 'chronic-conditions',
  MEDICATIONS: 'medications',
  PREVENTIVE_CARE: 'preventive-care',
  MENTAL_HEALTH: 'mental-health',
  NUTRITION: 'nutrition',
  EMERGENCY_CARE: 'emergency-care',
  PEDIATRICS: 'pediatrics',
  WOMENS_HEALTH: 'womens-health',
  MENS_HEALTH: 'mens-health',
  SENIOR_HEALTH: 'senior-health',
  INFECTIOUS_DISEASES: 'infectious-diseases',
} as const;

export type MedicalCategory = typeof medicalCategories[keyof typeof medicalCategories];

export const categoryDescriptions: Record<MedicalCategory, string> = {
  'general-health': 'Basic health information and common medical terms',
  'first-aid': 'Emergency first aid procedures and basic wound care',
  'chronic-conditions': 'Long-term health conditions and management',
  'medications': 'Common medications, usage, and general precautions',
  'preventive-care': 'Health maintenance and disease prevention',
  'mental-health': 'Mental health conditions and wellness',
  'nutrition': 'Diet, nutrition, and healthy eating guidelines',
  'emergency-care': 'Emergency medical conditions and when to seek help',
  'pediatrics': 'Child health and development',
  'womens-health': 'Women\'s specific health concerns and conditions',
  'mens-health': 'Men\'s specific health concerns and conditions',
  'senior-health': 'Elderly care and age-related conditions',
  'infectious-diseases': 'Common infections and communicable diseases',
}; 