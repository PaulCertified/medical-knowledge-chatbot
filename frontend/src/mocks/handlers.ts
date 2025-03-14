import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
}

interface ChatRequest {
  query: string;
}

interface SendMessageRequest {
  content: string;
  conversationId?: string;
  userId: string;
  timestamp: string;
}

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
};

// Mock conversation data
const mockConversations = new Map();

// Default conversation
const defaultConversationId = uuidv4();
mockConversations.set(defaultConversationId, [
  {
    id: uuidv4(),
    content: 'Hello! How can I help you with medical information today?',
    role: 'assistant',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
]);

export const handlers = [
  // Auth endpoints
  http.get('/api/auth/session', () => {
    return HttpResponse.json(mockUser);
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const data = await request.json() as LoginRequest;
    if (data.email === 'test@example.com' && data.password === 'password123') {
      return HttpResponse.json(mockUser);
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const data = await request.json() as SignupRequest;
    if (data.email === 'existing@example.com') {
      return new HttpResponse(null, { 
        status: 409,
        statusText: 'Email already registered'
      });
    }
    return HttpResponse.json({ ...mockUser, email: data.email });
  }),

  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Chat endpoints
  http.post('/api/chat/generate', async ({ request }) => {
    const data = await request.json() as ChatRequest;
    return HttpResponse.json({
      id: uuidv4(),
      response: `Mock response to: ${data.query}`,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post('/api/chat/knowledge', async () => {
    return HttpResponse.json({ message: 'Content added successfully' });
  }),

  http.get('/api/chat/knowledge/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    return HttpResponse.json([
      {
        id: '1',
        content: `Mock search result for: ${query}`,
        relevance: 0.95,
      },
    ]);
  }),

  // Chat history endpoint
  http.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/chat/history/:conversationId?`, ({ params }) => {
    const conversationId = params.conversationId as string || defaultConversationId;
    const conversation = mockConversations.get(conversationId) || [];
    return HttpResponse.json(conversation);
  }),

  // Send message endpoint (FIX: This handler wasn't properly responding with the message)
  http.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/chat`, async ({ request }) => {
    const data = await request.json() as SendMessageRequest;
    const { content, conversationId } = data;
    
    // Get or create conversation
    const currentId = conversationId || defaultConversationId;
    if (!mockConversations.has(currentId)) {
      mockConversations.set(currentId, []);
    }
    const conversation = mockConversations.get(currentId);
    
    // Add user message
    const userMessage = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    conversation.push(userMessage);
    
    // Generate bot response based on user question
    const botMessage = {
      id: uuidv4(),
      content: generateMockResponse(content),
      role: 'assistant',
      timestamp: new Date().toISOString(),
    };
    
    // Immediately add the message to the conversation
    conversation.push(botMessage);
    
    return HttpResponse.json({
      conversationId: currentId,
      message: botMessage,
    });
  }),
];

// Helper function to generate more realistic responses
function generateMockResponse(query: string): string {
  // Convert query to lowercase for easier matching
  const lowerQuery = query.toLowerCase();
  
  // Check for different types of medical questions and provide appropriate responses
  if (lowerQuery.includes('diabetes') || lowerQuery.includes('blood sugar')) {
    return `For managing Type 2 diabetes, consider these lifestyle changes:
    
1. **Healthy eating**: Focus on fruits, vegetables, whole grains, and lean proteins. Limit refined carbs, added sugars, and processed foods.

2. **Regular physical activity**: Aim for at least 150 minutes of moderate exercise per week.

3. **Weight management**: Even a modest weight loss of 5-10% can improve insulin sensitivity.

4. **Blood sugar monitoring**: Check your levels regularly as recommended by your healthcare provider.

5. **Medication adherence**: Take prescribed medications consistently.

6. **Stress management**: Practice stress-reduction techniques like meditation or yoga.

7. **Adequate sleep**: Aim for 7-8 hours of quality sleep each night.

8. **Regular check-ups**: Visit your healthcare provider regularly for comprehensive care.

Always consult with your healthcare provider before making significant lifestyle changes.`;
  } 
  else if (lowerQuery.includes('headache') || lowerQuery.includes('migraine')) {
    return `Headaches can have many causes. For common tension headaches:

1. **Rest in a quiet, dark room**
2. **Apply a cold or warm compress** to your head or neck
3. **Take over-the-counter pain relievers** as directed
4. **Stay hydrated** and maintain regular meals
5. **Practice stress management techniques**
6. **Ensure adequate sleep**

For frequent or severe headaches, please consult a healthcare provider. Seek immediate medical attention if a headache is sudden and severe, follows a head injury, or is accompanied by fever, stiff neck, confusion, seizure, double vision, weakness, numbness, or difficulty speaking.`;
  }
  else if (lowerQuery.includes('blood pressure') || lowerQuery.includes('hypertension')) {
    return `To help manage high blood pressure:

1. **Maintain a healthy diet** rich in fruits, vegetables, whole grains, and low-fat dairy
2. **Reduce sodium intake** to less than 2,300mg daily (ideal: 1,500mg)
3. **Regular physical activity** - at least 150 minutes of moderate exercise weekly
4. **Maintain a healthy weight**
5. **Limit alcohol consumption**
6. **Quit smoking**
7. **Manage stress** through relaxation techniques
8. **Take medications as prescribed**
9. **Regular blood pressure monitoring**

Always work with your healthcare provider to develop a personalized plan for blood pressure management.`;
  }
  else if (lowerQuery.includes('covid') || lowerQuery.includes('coronavirus')) {
    return `Regarding COVID-19:

Key prevention measures include:
- Staying up-to-date with recommended vaccines
- Improving ventilation
- Wearing masks in high-risk situations
- Testing if symptomatic
- Following isolation guidelines when infected

Common symptoms include fever, cough, fatigue, muscle aches, headache, sore throat, congestion, shortness of breath, and loss of taste or smell.

If you're experiencing severe symptoms like difficulty breathing, persistent chest pain, confusion, or bluish face/lips, seek emergency medical care immediately.

For the most current information, please consult the CDC or WHO websites.`;
  }
  else if (lowerQuery.includes('strep throat') || lowerQuery.includes('strep') || lowerQuery.includes('sore throat')) {
    return `Common symptoms of strep throat include:

1. **Throat pain** that usually comes on quickly
2. **Painful swallowing**
3. **Red and swollen tonsils**, sometimes with white patches or streaks of pus
4. **Tiny red spots** on the roof of the mouth (soft or hard palate)
5. **Swollen, tender lymph nodes** in the neck
6. **Fever**
7. **Headache**
8. **Rash** (scarlet fever rash)
9. **Body aches**
10. **Nausea or vomiting**, especially in younger children

Strep throat is caused by bacteria (Streptococcus pyogenes) and typically requires antibiotic treatment. If you suspect strep throat, it's important to see a healthcare provider for proper diagnosis, as untreated strep can lead to complications.`;
  }
  else if (lowerQuery.includes('flu') || lowerQuery.includes('influenza')) {
    return `Common flu (influenza) symptoms include:

1. **Fever** or feeling feverish/chills
2. **Cough**
3. **Sore throat**
4. **Runny or stuffy nose**
5. **Muscle or body aches**
6. **Headaches**
7. **Fatigue** (tiredness)
8. **Vomiting and diarrhea** (more common in children)

Flu symptoms typically appear suddenly and can range from mild to severe. Most people recover within a few days to less than two weeks, but some may develop complications like pneumonia.

Prevention methods include annual flu vaccination, good hand hygiene, avoiding close contact with sick people, and staying home when you're sick.`;
  }
  else if (lowerQuery.includes('allergy') || lowerQuery.includes('allergic')) {
    return `Common allergy symptoms include:

1. **Sneezing**
2. **Itchy, runny, or congested nose**
3. **Itchy, red, watering eyes**
4. **Itchy throat or ears**
5. **Hives or skin rashes**
6. **Swelling** of the face, lips, tongue, or throat
7. **Difficulty breathing** (in severe cases)

Allergy management typically includes:

- **Identifying and avoiding triggers**
- **Medications** like antihistamines, decongestants, or nasal steroids
- **Immunotherapy** (allergy shots) for long-term treatment
- **Quick-relief medications** like epinephrine auto-injectors for severe reactions

If you experience severe allergic reactions or symptoms that significantly impact your quality of life, consult with an allergist for proper diagnosis and treatment.`;
  }
  else if (lowerQuery.includes('heart attack') || lowerQuery.includes('cardiac arrest')) {
    return `Warning signs of a heart attack include:

1. **Chest pain or discomfort** - often described as pressure, squeezing, fullness, or pain in the center or left side of the chest
2. **Discomfort in other upper body areas** - including one or both arms, the back, neck, jaw, or stomach
3. **Shortness of breath** - with or without chest discomfort
4. **Cold sweat**
5. **Nausea or vomiting**
6. **Lightheadedness**
7. **Unusual fatigue**

Women may experience less typical symptoms like shortness of breath, nausea/vomiting, and back or jaw pain.

**THIS IS A MEDICAL EMERGENCY. If you suspect someone is having a heart attack, call emergency services (911) immediately.**

Every minute matters during a heart attack. Do not wait to see if symptoms go away or drive yourself to the hospital.`;
  }
  else if (lowerQuery.includes('stroke')) {
    return `Remember the acronym FAST to recognize stroke symptoms:

- **F**ace: Does one side of the face droop when the person smiles?
- **A**rms: Does one arm drift downward when both arms are raised?
- **S**peech: Is speech slurred or strange?
- **T**ime: If you observe any of these signs, call emergency services (911) immediately!

Other stroke symptoms include:
- Sudden numbness or weakness, especially on one side of the body
- Sudden confusion or trouble understanding speech
- Sudden trouble seeing in one or both eyes
- Sudden trouble walking, dizziness, loss of balance or coordination
- Sudden severe headache with no known cause

**THIS IS A MEDICAL EMERGENCY.** Immediate treatment can minimize brain damage and potential complications. Note the time when symptoms first appeared, as certain treatments must be given within specific time windows.`;
  }
  else if (lowerQuery.includes('sleep') || lowerQuery.includes('insomnia')) {
    return `For better sleep quality, consider these recommendations:

1. **Maintain a consistent schedule** - Go to bed and wake up at the same time every day
2. **Create a restful environment** - Keep your bedroom quiet, dark, and at a comfortable temperature
3. **Remove electronic devices** - Keep TVs, computers, and smartphones out of the bedroom
4. **Avoid large meals, caffeine, and alcohol** before bedtime
5. **Exercise regularly** - But not too close to bedtime
6. **Limit daytime naps** - Keep naps under 30 minutes and before 3pm
7. **Manage stress** - Try relaxation techniques like meditation or deep breathing
8. **Limit fluids** before bedtime to reduce nighttime trips to the bathroom
9. **Get exposure to natural light** during the day

Chronic insomnia may require professional evaluation. Consult with a healthcare provider if sleep problems persist despite good sleep hygiene practices.`;
  }
  else {
    return `Thank you for your question about "${query}". While I aim to provide helpful information, please note that I'm demonstrating a prototype medical chatbot and my responses are simulated.

In a fully implemented system, I would provide evidence-based information on your medical query from reliable healthcare sources.

For actual medical advice, please consult with a qualified healthcare professional.`;
  }
} 