export interface ClientScenario {
  id: string;
  name: string;
  avatar: string;
  source: 'whatsapp' | 'sms' | 'website';
  contact: string;
  initialMessage: string;
  intent: string;
  companyName?: string;
  crmRecord?: string;
  expectedFlow: string[]; // n8n Node IDs that will activate
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'ai' | 'system';
  text: string;
  timestamp: string;
  metadata?: {
    channel?: 'whatsapp' | 'sms' | 'website';
    latency?: string;
    tokens?: number;
    intent?: string;
    confidence?: number;
    agentName?: string;
    cost?: number;
    nodesTraversed?: string[];
  };
}

export interface ChatSession {
  id: string;
  scenarioId?: string;
  clientName: string;
  avatar: string;
  source: 'whatsapp' | 'sms' | 'website';
  contact: string;
  status: 'auto-replied' | 'needs-review' | 'escalated' | 'active';
  lastMessageTime: string;
  messages: ChatMessage[];
  crmStage: string;
  notes?: string;
}

export interface N8nNode {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  icon: string;
  description: string;
  params: Record<string, any>;
  sampleInput: Record<string, any>;
  sampleOutput: Record<string, any>;
}

export interface N8nEdge {
  from: string;
  to: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'success' | 'error';
  source: string;
  message: string;
}

export const SCENARIOS: ClientScenario[] = [
  {
    id: 'whatsapp-buyer',
    name: 'Sarah Jenkins',
    avatar: '👩‍💼',
    source: 'whatsapp',
    contact: '+1 (555) 438-9210',
    initialMessage: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available? What is the school district rating, and can we schedule a walkthrough this weekend?',
    intent: 'Buyer Inquiry / Showings',
    companyName: 'Private Buyer',
    crmRecord: 'Contact created in Follow Up Boss (Sarah Jenkins)',
    expectedFlow: ['webhook', 'router', 'intent', 'crm', 'kb', 'llm', 'guardrails', 'whatsapp']
  },
  {
    id: 'sms-seller',
    name: 'David Miller',
    avatar: '👨‍💻',
    source: 'sms',
    contact: '+1 (415) 883-0948',
    initialMessage: 'Hello, I live at 742 Vista Heights. I want to sell my property and get a free home valuation estimate. Who can help me with listing fees?',
    intent: 'Seller Home Valuation',
    companyName: 'Homeowner',
    crmRecord: 'Lead Stage: Seller Valuation Request',
    expectedFlow: ['webhook', 'router', 'intent', 'crm', 'kb', 'llm', 'guardrails', 'sms']
  },
  {
    id: 'web-tenant',
    name: 'Marcus Brody',
    avatar: '👨‍🎨',
    source: 'website',
    contact: 'Session #820491',
    initialMessage: 'Hey, I am interested in renting the 1-bed condo at Vista Heights. Does the rent include HOA fees and utilities? Can I tour it tomorrow at 5 PM?',
    intent: 'Rental Tour Request',
    companyName: 'Prospective Tenant',
    crmRecord: 'Lead created: Rental Applicant',
    expectedFlow: ['webhook', 'router', 'intent', 'crm', 'kb', 'llm', 'guardrails', 'website']
  },
  {
    id: 'whatsapp-spam',
    name: 'QuickFlip Guru',
    avatar: '🤖',
    source: 'whatsapp',
    contact: '+44 7911 123456',
    initialMessage: '🏡 BUY FORECLOSURES FOR $100! Click here to join our masterclass and learn how to flip homes with zero down payment! Guarantee 500% ROI! www.fake-realty-flipping.com',
    intent: 'Spam Detection',
    crmRecord: 'Discarded (Flagged as Spam)',
    expectedFlow: ['webhook', 'router', 'intent']
  },
  {
    id: 'sms-angry',
    name: 'Karen Smith',
    avatar: '👩‍🎤',
    source: 'sms',
    contact: '+1 (650) 902-1144',
    initialMessage: 'I have been standing outside 104 Pinecrest Ranch for 30 minutes for my 12:00 PM showing and NO agent is here! Nobody is answering the office phone either! Please respond immediately!',
    intent: 'Urgent Showing Handoff',
    companyName: 'Active Client',
    crmRecord: 'Escalated to Agent Hot-Line (Priority High)',
    expectedFlow: ['webhook', 'router', 'intent', 'crm', 'llm', 'guardrails', 'sms']
  }
];

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'chat-sarah',
    scenarioId: 'whatsapp-buyer',
    clientName: 'Sarah Jenkins',
    avatar: '👩‍💼',
    source: 'whatsapp',
    contact: '+1 (555) 438-9210',
    status: 'auto-replied',
    lastMessageTime: '12:04 PM',
    crmStage: 'Showing Scheduled',
    notes: 'Sarah Jenkins & husband. Private tour scheduled for 104 Pinecrest Ranch on Sat at 10:00 AM.',
    messages: [
      {
        id: 'msg-s1',
        sender: 'client',
        text: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available? What is the school district rating, and can we schedule a walkthrough this weekend?',
        timestamp: '12:01 PM',
        metadata: {
          channel: 'whatsapp'
        }
      },
      {
        id: 'msg-s2',
        sender: 'system',
        text: 'n8n Workflow triggered: WhatsApp webhook received. Source: Twilio WhatsApp Gateway.',
        timestamp: '12:01 PM'
      },
      {
        id: 'msg-s3',
        sender: 'system',
        text: 'AI reasoning: Classified as [Buyer Inquiry] (97% confidence). Context loaded from MLS Vector Database (104 Pinecrest Ranch: $585k, available, Round Rock ISD 9/10). CRM record updated in Follow Up Boss.',
        timestamp: '12:01 PM'
      },
      {
        id: 'msg-s4',
        sender: 'ai',
        text: 'Hi Sarah! Thanks for reaching out to Skyline Realty. Yes, **104 Pinecrest Ranch** is active and available! It is listed at **$585,000**.\n\nTo answer your question, it is located in the top-tier **Round Rock School District** (Round Rock High School is rated 9/10). \n\nI can absolutely schedule a tour for you this weekend. We have openings on **Saturday at 10:00 AM** or **Sunday at 2:00 PM**. Do either of those work? Or would you prefer to reserve a slot directly here: https://calendly.com/skyline-realty/tour',
        timestamp: '12:02 PM',
        metadata: {
          channel: 'whatsapp',
          intent: 'Buyer Inquiry / Showings',
          confidence: 0.97,
          latency: '1.3s',
          tokens: 290,
          cost: 0.00058,
          agentName: 'RealtyBot AI'
        }
      },
      {
        id: 'msg-s5',
        sender: 'client',
        text: 'Saturday at 10:00 AM works perfectly for me! Can you reserve that slot for us? I will be coming with my husband.',
        timestamp: '12:03 PM',
        metadata: {
          channel: 'whatsapp'
        }
      },
      {
        id: 'msg-s6',
        sender: 'system',
        text: 'n8n Workflow triggered: Booking confirmation request. Processing appointment scheduler.',
        timestamp: '12:03 PM'
      },
      {
        id: 'msg-s7',
        sender: 'system',
        text: 'n8n Integration: Checked availability on Google Calendar. Slot is free. Creating calendar invitation for Saturday at 10:00 AM EST.',
        timestamp: '12:03 PM'
      },
      {
        id: 'msg-s8',
        sender: 'ai',
        text: 'Fantastic, Sarah! I have successfully reserved the **Saturday, June 13th at 10:00 AM EST** tour slot for you and your husband at **104 Pinecrest Ranch**.\n\nI have paged this to our listing agent on duty, Robert Vance. A Google Calendar invitation has been sent to your email with the property address, directions, and Robert\'s contact details. \n\nWe look forward to showing you the home! Let me know if you need anything else in the meantime.',
        timestamp: '12:04 PM',
        metadata: {
          channel: 'whatsapp',
          intent: 'Showings / Booking',
          confidence: 0.99,
          latency: '1.4s',
          tokens: 210,
          cost: 0.00042,
          agentName: 'RealtyBot AI'
        }
      },
      {
        id: 'msg-s9',
        sender: 'system',
        text: 'Follow Up Boss CRM updated: Stage changed to "Showing Scheduled". Google Calendar invite successfully synced and email dispatch paged.',
        timestamp: '12:04 PM'
      }
    ]
  },
  {
    id: 'chat-david',
    scenarioId: 'sms-seller',
    clientName: 'David Miller',
    avatar: '👨‍💻',
    source: 'sms',
    contact: '+1 (415) 883-0948',
    status: 'auto-replied',
    lastMessageTime: '11:45 AM',
    crmStage: 'Seller - Valuation Request',
    notes: 'Homeowner at 742 Vista Heights. Requested home valuation.',
    messages: [
      {
        id: 'msg-d1',
        sender: 'client',
        text: 'Hello, I live at 742 Vista Heights. I want to sell my property and get a free home valuation estimate. Who can help me with listing fees?',
        timestamp: '11:44 AM',
        metadata: {
          channel: 'sms'
        }
      },
      {
        id: 'msg-d2',
        sender: 'system',
        text: 'n8n Workflow triggered: SMS webhook received via Twilio.',
        timestamp: '11:44 AM'
      },
      {
        id: 'msg-d3',
        sender: 'ai',
        text: 'Hello David! I can definitely help set up a Home Valuation Report for your property at **742 Vista Heights**.\n\nOur brokerage listing fee is a standard **2.5%**, which includes professional HDR photography, 3D home walkthroughs, and listing across Zillow, Redfin, and MLS. \n\nOur system is running a comparative market analysis (CMA) right now. Would you like our senior listing agent, Robert Vance, to call you this afternoon to review the valuation report and discuss our listing strategies?',
        timestamp: '11:45 AM',
        metadata: {
          channel: 'sms',
          intent: 'Seller Home Valuation',
          confidence: 0.98,
          latency: '1.2s',
          tokens: 210,
          cost: 0.00042,
          agentName: 'Listing Assistant AI'
        }
      }
    ]
  },
  {
    id: 'chat-karen',
    scenarioId: 'sms-angry',
    clientName: 'Karen Smith',
    avatar: '👩‍🎤',
    source: 'sms',
    contact: '+1 (650) 902-1144',
    status: 'escalated',
    lastMessageTime: '10:31 AM',
    crmStage: 'Showing - Urgent Hand-off',
    notes: 'Showing issue. Standing outside the property. Triggered urgent agent hot-line pager.',
    messages: [
      {
        id: 'msg-k1',
        sender: 'client',
        text: 'I have been standing outside 104 Pinecrest Ranch for 30 minutes for my 12:00 PM showing and NO agent is here! Nobody is answering the office phone either! Please respond immediately!',
        timestamp: '10:30 AM',
        metadata: {
          channel: 'sms'
        }
      },
      {
        id: 'msg-k2',
        sender: 'system',
        text: 'n8n Workflow triggered: SMS webhook received.',
        timestamp: '10:30 AM'
      },
      {
        id: 'msg-k3',
        sender: 'system',
        text: 'AI WARNING: Sentiment is [Very Negative/Time Critical]. Activating Agent Emergency Handoff protocol.',
        timestamp: '10:30 AM'
      },
      {
        id: 'msg-k4',
        sender: 'ai',
        text: 'Hi Karen! I am incredibly sorry for the delay and the showing scheduling mix-up at 104 Pinecrest Ranch. I have immediately paged our listing agent on duty, Robert Vance, and escalated this to our office manager. \n\nRobert is checking the calendar calendar sync and calling your mobile number (+1 650-902-1144) right now to meet you or give you direct lockbox access. Please stand by for his call.',
        timestamp: '10:31 AM',
        metadata: {
          channel: 'sms',
          intent: 'Urgent Showing Handoff',
          confidence: 0.99,
          latency: '1.5s',
          tokens: 320,
          cost: 0.00064,
          agentName: 'Handoff AI'
        }
      },
      {
        id: 'msg-k5',
        sender: 'system',
        text: 'Lead status updated to [Urgent - Needs Review]. SMS dispatcher sent critical notification pager to Robert Vance (Agent). Slack alert posted in #agent-hotline.',
        timestamp: '10:31 AM'
      }
    ]
  }
];

export const N8N_NODES: N8nNode[] = [
  {
    id: 'webhook',
    type: 'trigger',
    name: 'MLS / Channel Webhook',
    x: 80,
    y: 220,
    icon: '⚡',
    description: 'Ingests real-time lead payloads from Zillow Group, Realtor.com, WhatsApp Cloud API, Twilio SMS API, or the Skyline Realty site forms.',
    params: {
      'Webhook Path': '/v1/realty/leads',
      'HTTP Method': 'POST',
      'Authentication': 'Bearer Token',
      'Sources Active': ['Zillow API', 'WhatsApp', 'Twilio SMS', 'RealtyPortal']
    },
    sampleInput: {
      headers: {
        'x-zillow-signature': 'z_sig_8a9df2...',
        'content-type': 'application/json'
      },
      body: {
        lead_source: 'whatsapp',
        contact_name: 'Sarah Jenkins',
        contact_phone: '15554389210',
        message: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available? What is the school district rating, and can we schedule a walkthrough this weekend?'
      }
    },
    sampleOutput: {
      lead_source: 'whatsapp',
      client_name: 'Sarah Jenkins',
      client_phone: '+1 (555) 438-9210',
      message_text: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available? What is the school district rating, and can we schedule a walkthrough this weekend?',
      timestamp: '2026-06-11T12:01:00Z'
    }
  },
  {
    id: 'router',
    type: 'router',
    name: 'Channel Router',
    x: 240,
    y: 220,
    icon: '🔀',
    description: 'Detects the communication gateway (WhatsApp, Twilio, Web Portal API) and routes to set appropriate message characters, formats, and channel tokens.',
    params: {
      'Routing Mode': 'Rules Engine',
      'Rules': [
        { name: 'WhatsApp', expression: '{{ $json.lead_source === "whatsapp" }}' },
        { name: 'SMS', expression: '{{ $json.lead_source === "sms" }}' },
        { name: 'Web', expression: '{{ $json.lead_source === "website" }}' }
      ]
    },
    sampleInput: {
      lead_source: 'whatsapp',
      client_name: 'Sarah Jenkins',
      client_phone: '+1 (555) 438-9210',
      message_text: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available? What is the school district rating, and can we schedule a walkthrough this weekend?'
    },
    sampleOutput: {
      lead_source: 'whatsapp',
      client_name: 'Sarah Jenkins',
      client_phone: '+1 (555) 438-9210',
      message_text: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available? What is the school district rating, and can we schedule a walkthrough this weekend?',
      channel_settings: {
        supports_markdown: true,
        max_characters: 4096,
        opt_in_checked: true
      }
    }
  },
  {
    id: 'intent',
    type: 'llm',
    name: 'Real Estate Intent Classifier',
    x: 420,
    y: 220,
    icon: '🧠',
    description: 'Uses Gemini 2.5 Flash to categorize client messages (Buyer Inquiry, Seller Valuation, Rental Tour, Urgent Showing Handoff, Spam) and score urgency and sentiment.',
    params: {
      'Model': 'Gemini 2.5 Flash',
      'Temperature': 0.0,
      'System Prompt': 'Classify incoming real estate leads. Categorize them into: Buyer Inquiry, Seller Valuation, Tour Request, Urgent Showing Handoff, Spam. Format output as JSON.',
      'Schema': {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          confidence: { type: 'number' },
          urgency_score: { type: 'number', minimum: 1, maximum: 5 },
          is_spam: { type: 'boolean' }
        }
      }
    },
    sampleInput: {
      message_text: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available? What is the school district rating, and can we schedule a walkthrough this weekend?'
    },
    sampleOutput: {
      intent: 'Buyer Inquiry / Showings',
      confidence: 0.97,
      is_spam: false,
      urgency_score: 3,
      extracted_property: '104 Pinecrest Ranch',
      extracted_entities: {
        questions: ['availability', 'school district'],
        action: 'schedule weekend tour'
      }
    }
  },
  {
    id: 'crm',
    type: 'crm',
    name: 'Real Estate CRM Sync (Follow Up Boss)',
    x: 600,
    y: 110,
    icon: '🗄️',
    description: 'Synchronizes client details with Follow Up Boss CRM. Searches for phone matches. Updates listing stage or assigns a new lead card to listing agents.',
    params: {
      'CRM Provider': 'Follow Up Boss API',
      'Action': 'Find or Create Contact',
      'Match Field': 'phone',
      'Lead Stage Mapping': {
        'Buyer Inquiry': 'Lead - Active',
        'Seller Valuation': 'Seller - Valuation Request',
        'Urgent Showing Handoff': 'Showing - Urgent Hand-off'
      }
    },
    sampleInput: {
      client_name: 'Sarah Jenkins',
      client_phone: '+1 (555) 438-9210',
      intent: 'Buyer Inquiry / Showings'
    },
    sampleOutput: {
      crm_status: 'lead_updated',
      contact_id: 'fub_cnt_99042',
      stage: 'Buyer - Active Lead',
      assigned_agent: 'Robert Vance',
      sync_timestamp: '2026-06-11T12:01:04Z'
    }
  },
  {
    id: 'kb',
    type: 'vector',
    name: 'MLS Database Lookup (Vector DB)',
    x: 600,
    y: 330,
    icon: '📖',
    description: 'Performs semantic searches on our vector database of active Skyline Realty MLS listings, HOA rules, local school rankings, and showing calendars.',
    params: {
      'Vector Database': 'Pinecone',
      'Index Name': 'mls-listings-austin',
      'Top Matches': 2,
      'Min Score': 0.70
    },
    sampleInput: {
      query: '104 Pinecrest Ranch availability price school district'
    },
    sampleOutput: {
      context_retrieved: [
        {
          property: '104 Pinecrest Ranch',
          status: 'Active',
          price: '$585,000',
          beds: 3,
          baths: 2.5,
          schools: 'Round Rock ISD (Round Rock HS rated 9/10)'
        },
        {
          showing_slots: 'Saturday 10:00 AM, Sunday 2:00 PM'
        }
      ]
    }
  },
  {
    id: 'llm',
    type: 'llm',
    name: 'Gemini Agent Responder',
    x: 780,
    y: 220,
    icon: '✨',
    description: 'Invokes Gemini 3.5 Flash to compose a context-aware property reply, formatting text with MLS specs, and prompting listing calendar options.',
    params: {
      'Model': 'Gemini 3.5 Flash',
      'Temperature': 0.2,
      'System Prompt': 'System Real Estate Agent Prompt guidelines'
    },
    sampleInput: {
      client_name: 'Sarah Jenkins',
      message_text: 'Hi! I saw the listing for 104 Pinecrest Ranch. Is it still available?',
      context_retrieved: '104 Pinecrest Ranch is Active at $585,000, Round Rock ISD, tours: Saturday 10:00 AM, Sunday 2:00 PM.'
    },
    sampleOutput: {
      raw_response: 'Hi Sarah! Thanks for reaching out to Skyline Realty. Yes, 104 Pinecrest Ranch is active and available! It is listed at $585,000. To answer your question, it is located in the top-tier Round Rock School District (Round Rock High School is rated 9/10). I can absolutely schedule a tour for you this weekend...',
      tokens_used: { input: 490, output: 120 }
    }
  },
  {
    id: 'guardrails',
    type: 'guardrails',
    name: 'Fair Housing & Compliance Check',
    x: 940,
    y: 220,
    icon: '🛡️',
    description: 'Filters LLM outputs for compliance. Enforces: 1) Fair Housing Act guidelines (no demographic or steering comments), 2) Privacy protection, 3) Human handoff on contract drafting requests.',
    params: {
      'Enforce Fair Housing': true,
      'Scan for Steering Words': true,
      'Min Trust Threshold': 0.90,
      'Action on Fail': 'Escalate to human broker review'
    },
    sampleInput: {
      raw_response: 'Hi Sarah! Thanks for reaching out to Skyline Realty. Yes, 104 Pinecrest Ranch is active and available! It is listed at $585,000...'
    },
    sampleOutput: {
      approved: true,
      final_response: 'Hi Sarah! Thanks for reaching out to Skyline Realty. Yes, 104 Pinecrest Ranch is active and available! It is listed at $585,000...',
      escalate_to_human: false,
      compliance_rules_validated: ['fair-housing', 'PII-leakage', 'price-accuracy']
    }
  },
  {
    id: 'whatsapp',
    type: 'output',
    name: 'WhatsApp Dispatcher',
    x: 1100,
    y: 110,
    icon: '💬',
    description: 'Triggers the WhatsApp Cloud API to send the final approved AI response back to the buyer on WhatsApp. Updates Follow Up Boss log.',
    params: {
      'API Endpoint': 'https://graph.facebook.com/v19.0/{{ $vars.wa_phone_id }}/messages',
      'Auth': 'Bearer Token',
      'Body Template': '{{ $json.final_response }}'
    },
    sampleInput: {
      final_response: 'Hi Sarah! Thanks for reaching out to Skyline Realty. Yes, 104 Pinecrest Ranch is active and available!...'
    },
    sampleOutput: {
      status: 'success',
      wa_msg_id: 'wamid.HBgLMTU1NTQzODkyMTAVAgASGBQzQjRDMTIzNDU2Nzg5MEFDOUQzN...'
    }
  },
  {
    id: 'sms',
    type: 'output',
    name: 'Twilio SMS Dispatcher',
    x: 1100,
    y: 220,
    icon: '📱',
    description: 'Uses Twilio SMS REST API to dispatch the final text response back to the client mobile number.',
    params: {
      'Twilio Account SID': 'AC8f092b...',
      'From Number': '+18334094200',
      'Body': '{{ $json.final_response }}'
    },
    sampleInput: {
      final_response: 'Hello David! I can definitely help set up a Home Valuation Report...'
    },
    sampleOutput: {
      status: 'queued',
      sms_sid: 'SM01a88fc26e927c34b12dfa...'
    }
  },
  {
    id: 'website',
    type: 'output',
    name: 'Web Chat Pusher',
    x: 1100,
    y: 330,
    icon: '🌐',
    description: 'Sends the generated response back to the website live chat session over WebSockets for instant rendering on the web portal.',
    params: {
      'WebSocket URL': 'wss://api.skylinerealty.com/chat/stream',
      'Action': 'push_msg',
      'Room ID': '{{ $json.contact }}'
    },
    sampleInput: {
      final_response: 'Hey Marcus, I can tour Vista Heights tomorrow...'
    },
    sampleOutput: {
      socket_status: 'delivered',
      notified: true
    }
  }
];

export const N8N_EDGES: N8nEdge[] = [
  { from: 'webhook', to: 'router' },
  { from: 'router', to: 'intent' },
  { from: 'intent', to: 'crm' },
  { from: 'intent', to: 'kb' },
  { from: 'crm', to: 'llm' },
  { from: 'kb', to: 'llm' },
  { from: 'llm', to: 'guardrails' },
  { from: 'guardrails', to: 'whatsapp' },
  { from: 'guardrails', to: 'sms' },
  { from: 'guardrails', to: 'website' }
];

export const DEFAULT_KB = [
  {
    id: 'kb-1',
    category: 'Pricing',
    question: 'Skyline Brokerage Commission & Fees?',
    answer: 'Standard Skyline Realty listing fee is 2.5% of sales price. Includes HDR photography, custom virtual staging, 3D walkthroughs, MLS uploads, syndication to Zillow/Redfin, and premium digital marketing.'
  },
  {
    id: 'kb-2',
    category: 'Product Demo',
    question: 'How to book a property showing?',
    answer: 'Direct them to select a tour slot at: https://calendly.com/skyline-realty/tour. The assistant can also reserve local slots for Saturday at 10:00 AM or Sunday at 2:00 PM.'
  },
  {
    id: 'kb-3',
    category: 'Escalation Policy',
    question: 'When to hand over to a human agent?',
    answer: 'Escalate to a human agent immediately if: 1) Client wants to place a formal legal purchase offer, 2) Client asks for discount on listing agent commission fees, 3) Client has showing scheduling complaints, 4) Query is about HOA contract law details.'
  },
  {
    id: 'kb-4',
    category: 'Integrations',
    question: 'Listing 104 Pinecrest Ranch details?',
    answer: 'Listing: 104 Pinecrest Ranch, Round Rock, TX. Asking Price: $585,000. Features: 3 beds, 2.5 baths, 2,240 sq ft, private pool, fully remodeled kitchen. Schools: Round Rock ISD (Round Rock HS rated 9/10). Status: Active.'
  },
  {
    id: 'kb-5',
    category: 'Integrations',
    question: 'Listing Vista Heights Condo details?',
    answer: 'Listing: Vista Heights Condo #742, Austin, TX. Price: $340,000 (Rent: $2,100/mo). Features: 1 bed, 1 bath, 840 sq ft, fitness center access, gated community, skyline views. Rent includes HOA, tenant pays electricity. Status: Active.'
  }
];

export const DEFAULT_PROMPT = `You are "RealtyBot AI", an automated real estate assistant for "Skyline Realty Group".
Your job is to read incoming real estate leads, answer their property-specific questions using active MLS database context, and guide them towards booking a property tour showing or scheduling a seller consultation.

RULES:
1. ALWAYS be friendly, professional, and helpful.
2. Rely ONLY on the retrieved listings data in our database. Do not hallucinate price, beds, or features.
3. Strictly abide by Fair Housing compliance: Never state neighborhoods are "safe" or "dangerous", and do not steering buyers based on demographics.
4. If a client wants to make a legal purchase offer, negotiate a price, or gets angry about scheduling, state that you are escalating the ticket for an agent to call them directly.
5. If the channel is SMS, keep responses under 200 characters if possible. If WhatsApp, you can write longer formatted details with bold titles.`;

export const INITIAL_LOGS: SystemLog[] = [
  { id: 'l1', timestamp: '12:00:00 PM', level: 'info', source: 'System', message: 'Real Estate AI Lead Processor Engine initialized.' },
  { id: 'l2', timestamp: '12:00:05 PM', level: 'success', source: 'n8n Webhook', message: 'MLS webhook listener active on port 5678 (HTTPS)' },
  { id: 'l3', timestamp: '12:00:10 PM', level: 'info', source: 'Gemini API', message: 'Connected to Gemini API. MLS prompts loaded.' },
  { id: 'l4', timestamp: '12:00:15 PM', level: 'info', source: 'CRM Integration', message: 'Follow Up Boss and LionDesk API endpoints verified.' },
  { id: 'l5', timestamp: '12:01:02 PM', level: 'success', source: 'Webhook Trigger', message: 'New lead payload from Zillow Gateway. Target: +1 (555) 438-9210 (WhatsApp)' },
  { id: 'l6', timestamp: '12:01:03 PM', level: 'info', source: 'Intent Classifier', message: 'Intent classified as "Buyer Inquiry" (confidence 97%). Urgency: Medium.' },
  { id: 'l7', timestamp: '12:01:04 PM', level: 'success', source: 'CRM Sync', message: 'New lead Sarah Jenkins created in Follow Up Boss CRM (ID: fub_cnt_99042)' },
  { id: 'l8', timestamp: '12:01:05 PM', level: 'info', source: 'Vector Search', message: 'MLS search returned "104 Pinecrest Ranch" specs with 0.94 similarity.' },
  { id: 'l9', timestamp: '12:01:07 PM', level: 'success', source: 'LLM Generator', message: 'Response draft generated using Gemini 3.5 Flash. Duration 1.3s.' },
  { id: 'l10', timestamp: '12:01:08 PM', level: 'info', source: 'Guardrails', message: 'Fair Housing compliance check passed. Content is clean, no demographic steering.' },
  { id: 'l11', timestamp: '12:01:09 PM', level: 'success', source: 'WhatsApp API', message: 'Response sent back successfully. Message ID: wamid.HBgLMTU1...' }
];
