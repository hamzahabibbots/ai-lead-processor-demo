const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const leads = [
  { 
    id: 1, 
    name: 'Sarah Jenkins', 
    source: 'WhatsApp', 
    property: 'Oceanview Condo', 
    status: 'Qualified', 
    lastMessage: 'I want to schedule a viewing.' 
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    source: 'Website', 
    property: 'Downtown 2BHK', 
    status: 'Handled by AI', 
    lastMessage: 'What is the parking situation?' 
  },
  { 
    id: 3, 
    name: 'Emma Rodriguez', 
    source: 'SMS', 
    property: 'Suburb Family Home', 
    status: 'Viewing Scheduled', 
    lastMessage: 'Saturday works for me.' 
  }
];

const messages = {
  1: [
    { sender: 'client', text: 'Hi, I saw the listing for the Oceanview Condo. Is it still available?', timestamp: '10:00 AM' },
    { sender: 'ai', text: 'Hello Sarah! Yes, the Oceanview Condo is currently available. It features 3 bedrooms and a stunning balcony view. Would you like to see the floor plan?', timestamp: '10:01 AM' },
    { sender: 'client', text: 'Yes please. Also, I want to schedule a viewing.', timestamp: '10:05 AM' },
    { sender: 'ai', text: 'I can certainly help with that. I have openings this Friday at 3:00 PM or Saturday morning at 10:00 AM. Do either of those work for you?', timestamp: '10:06 AM' }
  ],
  2: [
    { sender: 'client', text: 'Hi, inquiring about the Downtown 2BHK. What is the parking situation?', timestamp: '11:15 AM' },
    { sender: 'ai', text: 'Hi Michael! The Downtown 2BHK includes one dedicated underground parking spot. There is also guest parking available in the building. Is parking a top priority for your search?', timestamp: '11:16 AM' }
  ],
  3: [
    { sender: 'client', text: 'Interested in the Suburb Family Home.', timestamp: '09:00 AM' },
    { sender: 'ai', text: 'Great choice, Emma! That home is in a top-rated school district. Would you like to know more about the recent renovations or schedule a visit?', timestamp: '09:01 AM' },
    { sender: 'client', text: 'Saturday works for me for a visit.', timestamp: '09:05 AM' },
    { sender: 'ai', text: 'Perfect! I have you down for Saturday at 11:00 AM. I will send the address details shortly.', timestamp: '09:06 AM' }
  ]
};

app.get('/api/leads', (req, res) => {
  res.json(leads);
});

app.get('/api/leads/:id/messages', (req, res) => {
  const leadId = req.params.id;
  res.json(messages[leadId] || []);
});

app.listen(PORT, () => {
  console.log(`Mock Backend running at http://localhost:${PORT}`);
});
