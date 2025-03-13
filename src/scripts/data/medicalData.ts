import { MedicalCategory, medicalCategories } from './medicalCategories';

interface MedicalDocument {
  content: string;
  metadata: {
    source: string;
    category: MedicalCategory;
    title: string;
    tags: string[];
  };
}

export const medicalData: MedicalDocument[] = [
  // General Health
  {
    content: `Common cold symptoms include runny nose, sore throat, cough, congestion, and mild body aches. Most colds are caused by viruses and typically last 7-10 days. Treatment focuses on symptom relief through rest, hydration, and over-the-counter medications. Seek medical attention if symptoms worsen or persist beyond 10 days.`,
    metadata: {
      source: 'Medical Knowledge Base',
      category: medicalCategories.GENERAL_HEALTH,
      title: 'Common Cold Overview',
      tags: ['cold', 'virus', 'respiratory', 'symptoms'],
    },
  },

  // First Aid
  {
    content: `For minor burns: 1. Cool the burn under cool (not cold) running water for 10-20 minutes. 2. Cover with a sterile gauze bandage. 3. Take over-the-counter pain medication if needed. Seek immediate medical attention for: severe burns, burns covering large areas, or burns on face/hands/feet.`,
    metadata: {
      source: 'First Aid Guidelines',
      category: medicalCategories.FIRST_AID,
      title: 'Burn Treatment Guide',
      tags: ['burns', 'first aid', 'emergency care', 'wound care'],
    },
  },

  // Emergency Care
  {
    content: `Heart attack warning signs: 1. Chest pain or pressure 2. Pain radiating to arm, neck, or jaw 3. Shortness of breath 4. Cold sweats 5. Nausea. If you suspect a heart attack: 1. Call emergency services immediately 2. Chew aspirin if recommended 3. Rest in a comfortable position. Time is critical - don't wait to seek help.`,
    metadata: {
      source: 'Emergency Medical Guidelines',
      category: medicalCategories.EMERGENCY_CARE,
      title: 'Heart Attack Warning Signs',
      tags: ['heart attack', 'emergency', 'cardiac', 'chest pain'],
    },
  },

  // Chronic Conditions
  {
    content: `Diabetes management essentials: 1. Regular blood sugar monitoring 2. Balanced diet following medical guidelines 3. Regular exercise 4. Medication compliance 5. Regular medical check-ups. Watch for signs of high/low blood sugar and maintain a consistent daily routine. Keep emergency contact information readily available.`,
    metadata: {
      source: 'Chronic Disease Management Guide',
      category: medicalCategories.CHRONIC_CONDITIONS,
      title: 'Diabetes Management',
      tags: ['diabetes', 'chronic disease', 'blood sugar', 'lifestyle'],
    },
  },

  // Mental Health
  {
    content: `Anxiety management techniques: 1. Deep breathing exercises 2. Progressive muscle relaxation 3. Regular exercise 4. Adequate sleep 5. Mindfulness meditation. If anxiety interferes with daily life, seek professional help. Therapy and/or medication can be effective treatments.`,
    metadata: {
      source: 'Mental Health Resources',
      category: medicalCategories.MENTAL_HEALTH,
      title: 'Anxiety Management',
      tags: ['anxiety', 'mental health', 'stress', 'coping strategies'],
    },
  },

  // Nutrition
  {
    content: `A balanced diet should include: 1. Fruits and vegetables (5+ servings daily) 2. Whole grains 3. Lean proteins 4. Healthy fats 5. Limited processed foods and added sugars. Stay hydrated by drinking water throughout the day. Consider portion sizes and eat regular meals.`,
    metadata: {
      source: 'Nutrition Guidelines',
      category: medicalCategories.NUTRITION,
      title: 'Balanced Diet Basics',
      tags: ['nutrition', 'diet', 'healthy eating', 'food groups'],
    },
  },

  // Preventive Care
  {
    content: `Essential health screenings by age: 18-39: Blood pressure, cholesterol, diabetes. 40-64: Add mammograms (women), colonoscopy (45+). 65+: Add bone density, hearing/vision tests. All ages: Annual physical, dental cleanings, eye exams. Vaccinations should be kept up to date.`,
    metadata: {
      source: 'Preventive Care Guidelines',
      category: medicalCategories.PREVENTIVE_CARE,
      title: 'Health Screening Guidelines',
      tags: ['preventive care', 'screenings', 'check-ups', 'health maintenance'],
    },
  },

  // Medications
  {
    content: `Medication safety guidelines: 1. Keep an updated list of all medications 2. Follow prescribed dosages exactly 3. Be aware of potential interactions 4. Store medications properly 5. Don't share prescriptions. Report any adverse reactions to your healthcare provider immediately.`,
    metadata: {
      source: 'Medication Safety Guide',
      category: medicalCategories.MEDICATIONS,
      title: 'Medication Safety',
      tags: ['medications', 'prescriptions', 'drug safety', 'side effects'],
    },
  },

  // Infectious Diseases
  {
    content: `Preventing the spread of infectious diseases: 1. Regular hand washing 2. Proper respiratory hygiene 3. Stay home when sick 4. Keep vaccinations current 5. Practice food safety. If you develop fever, severe symptoms, or have been exposed to an infectious disease, contact your healthcare provider.`,
    metadata: {
      source: 'Infection Control Guidelines',
      category: medicalCategories.INFECTIOUS_DISEASES,
      title: 'Disease Prevention',
      tags: ['infectious diseases', 'prevention', 'hygiene', 'vaccination'],
    },
  },

  // Pediatrics
  {
    content: `Child fever guidelines: 0-3 months: Any fever (100.4°F/38°C or higher) requires immediate medical attention. 3-36 months: Call doctor if fever persists over 24 hours. Over 3 years: Call if fever lasts more than 3 days or is accompanied by other concerning symptoms.`,
    metadata: {
      source: 'Pediatric Care Guidelines',
      category: medicalCategories.PEDIATRICS,
      title: 'Child Fever Guide',
      tags: ['pediatrics', 'fever', 'children', 'temperature'],
    },
  },
]; 