import { useState, useEffect, useMemo, useRef } from 'react';
import {
  SCENARIOS,
  INITIAL_CHATS,
  N8N_NODES,
  INITIAL_LOGS,
  DEFAULT_KB,
  DEFAULT_PROMPT,
  type ChatSession,
  type ChatMessage,
  type SystemLog,
  type N8nNode,
  type ClientScenario
} from './mockData';
import { N8nCanvas } from './components/N8nCanvas';
import {
  MessageSquare,
  Settings,
  Activity,
  Layers,
  Send,
  Sparkles,
  Bot,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Database,
  Code,
  Terminal,
  Play,
  Plus,
  Trash2,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'n8n' | 'settings'>('dashboard');
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState<string>('chat-sarah');
  const [kbItems, setKbItems] = useState(DEFAULT_KB);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);

  // n8n workflow interactive states
  const [selectedN8nNode, setSelectedN8nNode] = useState<N8nNode | null>(N8N_NODES[0]);
  const [activeNodeTab, setActiveNodeTab] = useState<'details' | 'params' | 'input' | 'output'>('details');

  // Simulation execution states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(-1);
  const [simFlow, setSimFlow] = useState<string[]>([]);
  const [simNodeRunning, setSimNodeRunning] = useState<string | null>(null);
  const [simNodesExecuted, setSimNodesExecuted] = useState<string[]>([]);
  const [simScenario, setSimScenario] = useState<ClientScenario | null>(null);
  const [simCustomText, setSimCustomText] = useState<string>('');
  const [simChatId, setSimChatId] = useState<string>('');

  // Simulator chat input state
  const [clientInputText, setClientInputText] = useState('');

  // Settings: New KB item input
  const [newKbCategory, setNewKbCategory] = useState('Pricing');
  const [newKbQuestion, setNewKbQuestion] = useState('');
  const [newKbAnswer, setNewKbAnswer] = useState('');

  // Scroll references
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const logsBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chats and logs on updates
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, isSimulating, simStepIndex]);

  useEffect(() => {
    if (logsBottomRef.current) {
      logsBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Selected chat session
  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === selectedChatId) || chats[0];
  }, [chats, selectedChatId]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = chats.reduce((acc, c) => acc + c.messages.filter((m) => m.sender === 'client').length, 0);
    const automated = chats.filter((c) => c.status === 'auto-replied').length;
    const escalated = chats.filter((c) => c.status === 'escalated' || c.status === 'needs-review').length;
    const autoRate = total > 0 ? ((automated / chats.length) * 100).toFixed(1) : '94.2';
    
    return {
      totalLeads: chats.length + 480, // Simulation offset to look real
      autoRate: autoRate,
      avgResponseTime: '1.4s',
      escalationRate: total > 0 ? ((escalated / chats.length) * 100).toFixed(1) : '5.8',
    };
  }, [chats]);

  // Generate dynamic smart response based on input message & configuration
  const generateAIResponse = (message: string, intent: string): string => {
    const msgLower = message.toLowerCase();

    // Check if customized KB context answers the prompt
    for (const item of kbItems) {
      const qKeywords = item.question.toLowerCase().split(' ').filter(w => w.length > 3);
      const matches = qKeywords.filter(k => msgLower.includes(k));
      if (matches.length >= 2) {
        return `Hi there! Regarding your question about **${item.question}**: \n\n${item.answer}\n\nLet me know if there's anything else I can clarify or if you'd like to book a quick onboarding session!`;
      }
    }

    // Default intent matches
    if (intent === 'Spam Detection' || msgLower.includes('crypto') || msgLower.includes('bitcoin') || msgLower.includes('roi')) {
      return 'SECURITY ACTION: Incoming lead content flagged as commercial spam. Message delivery was terminated and blocked. No client response dispatch.';
    }

    if (intent === 'High Priority Complaint' || msgLower.includes('angry') || msgLower.includes('charge') || msgLower.includes('twice') || msgLower.includes('refund') || msgLower.includes('cancel my')) {
      return `Hello, I completely understand your urgency and apologize for this service interruption. I have logged ticket #SR-80942 and escalated your message directly to our billing supervisor for high-priority review. \n\nWe will examine the transaction records and contact you immediately to process refunds and account adjustments. A specialist will call/text you at this number within 15 minutes.`;
    }

    if (intent === 'Demo Request' || msgLower.includes('demo') || msgLower.includes('schedule') || msgLower.includes('book') || msgLower.includes('meeting')) {
      return `I would be delighted to coordinate a product demonstration for you! You can view my available openings and select the most convenient spot on our schedule here: **https://calendly.com/demobot-saasify/15min** \n\nAlternatively, I can reserve a slot for you on next **Tuesday at 2:00 PM EST** or **3:30 PM EST**. Does either of those work?`;
    }

    if (intent === 'Pricing Inquiry' || msgLower.includes('price') || msgLower.includes('cost') || msgLower.includes('plan') || msgLower.includes('startup')) {
      return `Thanks for asking about our plans! For small teams, we offer our **Startup Plan** at **$15/user/month** (billed monthly) which supports up to 15 members. \n\nFor growing teams, our **Pro Plan** is **$25/user/month** and includes integrations, CRM sync, and advanced automation. Would you like me to send a signup invite, or should we schedule a call to review custom requirements?`;
    }

    // Default generic fallback
    return `Hello! Thanks for reaching out. We have logged your request in our sales system. An AI representative has processed your query: \n\n"${message}" \n\nWe recommend booking a brief 10-minute live demonstration here: https://calendly.com/demobot-saasify/15min to explore how our software fits your workflow. Let me know what you think!`;
  };

  // Run n8n simulation step-by-step
  useEffect(() => {
    if (!isSimulating) return;

    if (simStepIndex < simFlow.length) {
      const timer = setTimeout(() => {
        const nodeId = simFlow[simStepIndex];
        setSimNodeRunning(nodeId);
        setSimNodesExecuted((prev) => [...prev, nodeId]);

        // Add matching logs and system messages in chat
        const node = N8N_NODES.find((n) => n.id === nodeId);
        if (node) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          // Generate system messages/logs depending on the node
          let logMessage = `Node [${node.name}] successfully executed.`;
          let chatSysMessage = '';

          if (nodeId === 'webhook') {
            logMessage = `Webhook triggered via ${simScenario?.source || 'web-form'}. Payload received.`;
            chatSysMessage = `n8n Trigger: Incoming lead webhook captured client details (${simScenario?.name || 'New Client'}).`;
          } else if (nodeId === 'router') {
            logMessage = `Channel Router parsed data. Routing to: ${simScenario?.source || 'website'} pipeline.`;
          } else if (nodeId === 'intent') {
            const confidenceVal = Math.round(90 + Math.random() * 9);
            logMessage = `Intent Classifier analyzed query: "${simScenario?.initialMessage || simCustomText}". Result: [${simScenario?.intent || 'General Inquiry'}] (Conf: ${confidenceVal}%).`;
            chatSysMessage = `AI Analysis: Intent identified as [${simScenario?.intent || 'General Inquiry'}] (Confidence: ${confidenceVal}%).`;
          } else if (nodeId === 'crm') {
            logMessage = `CRM sync active. Action: Search/Create record. Stage set to "Lead".`;
            chatSysMessage = `CRM Sync: Successfully created lead record for "${simScenario?.name || 'New Client'}" in CRM Database.`;
          } else if (nodeId === 'kb') {
            logMessage = `Vector Database similarity lookup completed. Loaded context matches.`;
          } else if (nodeId === 'llm') {
            logMessage = `Gemini 3.5 Flash response generation complete. Tokens: 310. Latency: 1.2s.`;
            chatSysMessage = `AI Processor: Gemini 3.5 Flash drafted context-aware reply.`;
          } else if (nodeId === 'guardrails') {
            logMessage = `Guardrails check verified. Safety status: Approved. Competitor check: Passed.`;
          } else if (node.type === 'output') {
            logMessage = `Output node [${node.name}] dispatched message body. Response status: 200 OK.`;
          }

          // Add System Log
          const newLog: SystemLog = {
            id: `log-${Date.now()}-${nodeId}`,
            timestamp,
            level: nodeId === 'intent' || nodeId === 'llm' ? 'info' : 'success',
            source: node.name,
            message: logMessage,
          };
          setLogs((prev) => [...prev, newLog]);

          // Update selected node for inspect panel
          setSelectedN8nNode(node);

          // Add System message in chat history
          if (chatSysMessage) {
            setChats((prevChats) =>
              prevChats.map((c) => {
                if (c.id === simChatId) {
                  return {
                    ...c,
                    messages: [
                      ...c.messages,
                      {
                        id: `sys-${Date.now()}-${nodeId}`,
                        sender: 'system',
                        text: chatSysMessage,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ],
                  };
                }
                return c;
              })
            );
          }
        }

        setSimStepIndex((prev) => prev + 1);
      }, 700); // 700ms delay per node to let the user follow visually

      return () => clearTimeout(timer);
    } else {
      // Simulation finished! Add final AI response
      const timer = setTimeout(() => {
        const promptText = simScenario?.initialMessage || simCustomText;
        const intentText = simScenario?.intent || 'General Inquiry';
        const rawAiMsg = generateAIResponse(promptText, intentText);

        const isSpam = intentText === 'Spam Detection';
        const isEscalation = intentText === 'High Priority Complaint' || intentText === 'Support Escalation';

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === simChatId) {
              const updatedMessages: ChatMessage[] = [...c.messages];

              if (!isSpam) {
                // Add AI Reply
                updatedMessages.push({
                  id: `ai-${Date.now()}`,
                  sender: 'ai',
                  text: rawAiMsg,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  metadata: {
                    channel: c.source,
                    intent: intentText,
                    confidence: 0.96,
                    latency: '1.2s',
                    tokens: 280,
                    cost: 0.00056,
                    agentName: isEscalation ? 'Handoff AI' : 'LeadBot AI',
                  },
                });
              }

              // Set final system message
              updatedMessages.push({
                id: `sys-end-${Date.now()}`,
                sender: 'system',
                text: isSpam
                  ? 'Workflow terminated. Message flagged as spam and discarded.'
                  : isEscalation
                  ? 'Workflow completed. Live chat flagged for Manual Human Handoff.'
                  : 'Workflow completed. AI auto-reply successfully delivered back to customer.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });

              let finalStatus: ChatSession['status'] = 'auto-replied';
              if (isSpam) finalStatus = 'active';
              if (isEscalation) finalStatus = 'escalated';

              let finalStage = c.crmStage;
              if (isSpam) finalStage = 'Discarded (Spam)';
              else if (isEscalation) finalStage = 'Escalated / Ticket Opened';
              else if (intentText === 'Demo Request') finalStage = 'Demo Scheduled';
              else if (intentText === 'Pricing Inquiry') finalStage = 'Pricing Quote Sent';

              return {
                ...c,
                status: finalStatus,
                crmStage: finalStage,
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                messages: updatedMessages,
              };
            }
            return c;
          })
        );

        // Terminate simulation
        setIsSimulating(false);
        setSimNodeRunning(null);
        setSimStepIndex(-1);

        // Add completion log
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs((prev) => [
          ...prev,
          {
            id: `log-end-${Date.now()}`,
            timestamp,
            level: 'info',
            source: 'Workflow Engine',
            message: `Lead workflow for ${simScenario?.name || 'New Lead'} completed. Status: Finished.`,
          },
        ]);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isSimulating, simStepIndex, simFlow, simScenario, simChatId, simCustomText]);

  // Function to trigger simulation for a predefined scenario
  const handleTriggerScenario = (scenarioId: string) => {
    if (isSimulating) return;

    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // Create a new Chat Session object
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      scenarioId: scenario.id,
      clientName: scenario.name,
      avatar: scenario.avatar,
      source: scenario.source,
      contact: scenario.contact,
      status: 'active',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      crmStage: 'Inbound Captured',
      notes: `${scenario.intent} pipeline activated via ${scenario.source.toUpperCase()}.`,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'client',
          text: scenario.initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: {
            channel: scenario.source,
          },
        },
      ],
    };

    // Add session, select it, switch to simulator tab, and initialize execution
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChatId);
    setSimScenario(scenario);
    setSimCustomText('');
    setSimChatId(newChatId);
    setSimFlow(scenario.expectedFlow);
    setSimNodesExecuted([]);
    setSimNodeRunning(null);
    setSimStepIndex(0);
    setIsSimulating(true);

    // Switch tab to simulator to let user watch the simulation
    setActiveTab('simulator');

    // Add initial log
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      ...prev,
      {
        id: `log-start-${Date.now()}`,
        timestamp,
        level: 'info',
        source: 'Workflow Engine',
        message: `Triggered simulation scenario: ${scenario.name} (${scenario.intent}) via ${scenario.source}.`,
      },
    ]);
  };

  // Function to send a custom message as client inside the simulator chat
  const handleSendClientMessage = (text: string) => {
    if (!text.trim() || isSimulating) return;

    // Detect intent
    const textLower = text.toLowerCase();
    let detectedIntent = 'General Inquiry';
    let expectedNodes = ['webhook', 'router', 'intent', 'crm', 'kb', 'llm', 'guardrails', 'website'];

    if (textLower.includes('price') || textLower.includes('cost') || textLower.includes('plan') || textLower.includes('startup')) {
      detectedIntent = 'Pricing Inquiry';
    } else if (textLower.includes('demo') || textLower.includes('schedule') || textLower.includes('book') || textLower.includes('meeting')) {
      detectedIntent = 'Demo Request';
    } else if (textLower.includes('angry') || textLower.includes('charge') || textLower.includes('twice') || textLower.includes('refund') || textLower.includes('cancel')) {
      detectedIntent = 'High Priority Complaint';
    } else if (textLower.includes('crypto') || textLower.includes('bitcoin') || textLower.includes('roi') || textLower.includes('earn')) {
      detectedIntent = 'Spam Detection';
      expectedNodes = ['webhook', 'router', 'intent'];
    }

    // Determine target output node based on active chat channel
    const outputNode = activeChat.source === 'whatsapp' ? 'whatsapp' : activeChat.source === 'sms' ? 'sms' : 'website';
    
    // Set the expected output node in the pipeline
    if (detectedIntent !== 'Spam Detection') {
      expectedNodes[expectedNodes.length - 1] = outputNode;
    }

    // Update conversation with user message
    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === selectedChatId) {
          return {
            ...c,
            lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: [
              ...c.messages,
              {
                id: `client-${Date.now()}`,
                sender: 'client',
                text: text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                metadata: {
                  channel: c.source,
                },
              },
            ],
          };
        }
        return c;
      })
    );

    // Initialize simulation for custom text
    setSimScenario({
      id: 'custom-lead',
      name: activeChat.clientName,
      avatar: activeChat.avatar,
      source: activeChat.source,
      contact: activeChat.contact,
      initialMessage: text,
      intent: detectedIntent,
      expectedFlow: expectedNodes,
    });
    setSimCustomText(text);
    setSimChatId(selectedChatId);
    setSimFlow(expectedNodes);
    setSimNodesExecuted([]);
    setSimNodeRunning(null);
    setSimStepIndex(0);
    setIsSimulating(true);

    setClientInputText('');
  };

  // Add a new FAQ to the knowledge base
  const handleAddKbItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbQuestion.trim() || !newKbAnswer.trim()) return;

    const newItem = {
      id: `kb-${Date.now()}`,
      category: newKbCategory,
      question: newKbQuestion.trim(),
      answer: newKbAnswer.trim(),
    };

    setKbItems((prev) => [...prev, newItem]);
    setNewKbQuestion('');
    setNewKbAnswer('');

    // Log update
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      ...prev,
      {
        id: `log-kb-${Date.now()}`,
        timestamp,
        level: 'success',
        source: 'Knowledge Base',
        message: `Added new FAQ under category [${newKbCategory}]: "${newItem.question.slice(0, 30)}..."`,
      },
    ]);
  };

  // Delete FAQ from knowledge base
  const handleDeleteKbItem = (id: string) => {
    const item = kbItems.find((k) => k.id === id);
    setKbItems((prev) => prev.filter((k) => k.id !== id));
    
    // Log update
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      ...prev,
      {
        id: `log-kb-del-${Date.now()}`,
        timestamp,
        level: 'warning',
        source: 'Knowledge Base',
        message: `Removed FAQ: "${item?.question?.slice(0, 30)}..."`,
      },
    ]);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🤖</div>
          <div>
            <h2>LeadFlow AI</h2>
            <span className="subtitle">n8n + AI Automation</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={18} />
            <span>Dashboard</span>
          </button>
          <button
            className={`menu-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <MessageSquare size={18} />
            <span>Leads</span>
            {isSimulating && (
              <span className="pulse-badge">RUNNING</span>
            )}
          </button>
          <button
            className={`menu-btn ${activeTab === 'n8n' ? 'active' : ''}`}
            onClick={() => setActiveTab('n8n')}
          >
            <Layers size={18} />
            <span>n8n Workflow</span>
          </button>
          <button
            className={`menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Agent Settings</span>
          </button>
        </nav>

        {/* Simulator Preset Injector Panel */}
        <div className="sidebar-presets">
          <h3>Simulate New Lead</h3>
          <p className="presets-desc">Click to inject a fake inbound customer message into the AI workflow pipeline:</p>
          
          <div className="presets-list">
            {SCENARIOS.map((sc) => {
              let tagColor = '#10b981';
              if (sc.source === 'sms') tagColor = '#3b82f6';
              else if (sc.source === 'website') tagColor = '#a855f7';

              return (
                <button
                  key={sc.id}
                  className="preset-card-btn"
                  onClick={() => handleTriggerScenario(sc.id)}
                  disabled={isSimulating}
                  title={sc.initialMessage}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="preset-avatar">{sc.avatar}</span>
                    <div className="preset-info">
                      <span className="preset-name">{sc.name}</span>
                      <span className="preset-intent">{sc.intent}</span>
                    </div>
                  </div>
                  <span className="channel-tag" style={{ border: `1px solid ${tagColor}`, color: tagColor }}>
                    {sc.source}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className="status-dot online"></span>
            <span>AI Lead Engine Active</span>
          </div>
          <span className="version">Demo v1.2.0</span>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="app-main">
        {/* Header */}
        <header className="main-header">
          <div className="header-title">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'simulator' && 'Leads Console'}
              {activeTab === 'n8n' && 'n8n AI Engine Workflow'}
              {activeTab === 'settings' && 'Knowledge Base & Settings'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Real-time performance analytics of automated response flows.'}
              {activeTab === 'simulator' && 'Inspect real-time conversation flows and watch the n8n AI execution chain.'}
              {activeTab === 'n8n' && 'Interactive visual builder showing the active node connectors and schemas.'}
              {activeTab === 'settings' && 'Provide guidelines, prompt templates, and custom facts for the AI.'}
            </p>
          </div>

          <div className="header-actions">
            {isSimulating && (
              <div className="simulating-indicator-bar">
                <Sparkles size={16} className="spin" />
                <span>n8n executing: <strong>{simNodeRunning ? N8N_NODES.find(n => n.id === simNodeRunning)?.name : 'Routing'}</strong>...</span>
              </div>
            )}
            <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="external-link-btn">
              <span>n8n.io Docs</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </header>

        {/* Tab Switcher Body */}
        <div className="main-body">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view animate-fade">
              {/* Stats Cards */}
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span>Total Leads Processed</span>
                    <div className="stat-icon purple"><MessageSquare size={18} /></div>
                  </div>
                  <div className="stat-value">{stats.totalLeads}</div>
                  <div className="stat-subtext text-success">
                    <TrendingUp size={12} />
                    <span>+12.4% from last week</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span>AI Auto-Response Rate</span>
                    <div className="stat-icon green"><Bot size={18} /></div>
                  </div>
                  <div className="stat-value">{stats.autoRate}%</div>
                  <div className="stat-subtext text-success">
                    <TrendingUp size={12} />
                    <span>Optimal engagement threshold</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span>Average Response Time</span>
                    <div className="stat-icon blue"><Clock size={18} /></div>
                  </div>
                  <div className="stat-value">{stats.avgResponseTime}</div>
                  <div className="stat-subtext">
                    <span>Down from 1.5 hr manual reply</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span>Escalation / Review Rate</span>
                    <div className="stat-icon red"><AlertCircle size={18} /></div>
                  </div>
                  <div className="stat-value">{stats.escalationRate}%</div>
                  <div className="stat-subtext">
                    <span>Handoff to human inbox</span>
                  </div>
                </div>
              </section>

              {/* Main Analytics Panels */}
              <div className="dashboard-panels">
                {/* Left panel: Channels Breakdown */}
                <div className="panel-card flex-2">
                  <div className="panel-header">
                    <h3>Inbound Channels Distribution</h3>
                    <span className="panel-desc">Where leads are captured.</span>
                  </div>
                  <div className="channel-breakdown-body">
                    <div className="channel-bar-item">
                      <div className="channel-bar-labels">
                        <span className="channel-bar-name">🟢 WhatsApp Business Cloud</span>
                        <span className="channel-bar-percent">58%</span>
                      </div>
                      <div className="bar-outer"><div className="bar-inner whatsapp" style={{ width: '58%' }}></div></div>
                    </div>

                    <div className="channel-bar-item">
                      <div className="channel-bar-labels">
                        <span className="channel-bar-name">🟣 Website Custom Chat Widget</span>
                        <span className="channel-bar-percent">28%</span>
                      </div>
                      <div className="bar-outer"><div className="bar-inner website" style={{ width: '28%' }}></div></div>
                    </div>

                    <div className="channel-bar-item">
                      <div className="channel-bar-labels">
                        <span className="channel-bar-name">🔵 Twilio SMS Gateways</span>
                        <span className="channel-bar-percent">14%</span>
                      </div>
                      <div className="bar-outer"><div className="bar-inner sms" style={{ width: '14%' }}></div></div>
                    </div>
                  </div>

                  <div className="quick-info-box">
                    <ShieldCheck size={16} className="text-purple" />
                    <p>All integrations leverage secure webhooks that trigger our centralized n8n processing canvas instantly upon message receipt.</p>
                  </div>
                </div>

                {/* Right panel: Active Scenarios Demo Launcher */}
                <div className="panel-card flex-1">
                  <div className="panel-header">
                    <h3>Simulation Control</h3>
                    <span className="panel-desc">Quickly trigger and watch scenario pipelines.</span>
                  </div>
                  <div className="dashboard-presets-grid">
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
                      Select a predefined mock profile to watch the full automation cycle run live in the logs and chat views.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {SCENARIOS.slice(0, 3).map((sc) => (
                        <button
                          key={`dash-${sc.id}`}
                          className="dash-trigger-btn"
                          onClick={() => handleTriggerScenario(sc.id)}
                          disabled={isSimulating}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{sc.avatar}</span>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontWeight: 600, fontSize: '12px', color: '#f3f4f6' }}>{sc.name}</div>
                              <div style={{ fontSize: '10px', color: '#9ca3af' }}>{sc.intent}</div>
                            </div>
                          </div>
                          <div className="btn-go-icon"><Play size={12} fill="#fff" /></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs Console Pane */}
              <div className="logs-panel-card">
                <div className="panel-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={16} className="text-purple" />
                      <h3>n8n Server Execution Stream Logs</h3>
                    </div>
                    <button className="clear-logs-btn" onClick={() => setLogs([])}>
                      Clear console
                    </button>
                  </div>
                </div>
                <div className="logs-console">
                  {logs.length === 0 ? (
                    <div className="empty-logs">No execution history. Trigger a lead scenario to stream events here.</div>
                  ) : (
                    logs.map((log) => {
                      let levelClass = 'info';
                      if (log.level === 'success') levelClass = 'text-success';
                      else if (log.level === 'warning') levelClass = 'text-warning';
                      else if (log.level === 'error') levelClass = 'text-error';

                      return (
                        <div key={log.id} className="log-line">
                          <span className="log-time">[{log.timestamp}]</span>
                          <span className={`log-level ${levelClass}`}>[{log.level.toUpperCase()}]</span>
                          <span className="log-source">[{log.source}]</span>
                          <span className="log-message">{log.message}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={logsBottomRef} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="simulator-view animate-fade">
              <div className="simulator-layout">
                {/* Left column: Conversation sessions list */}
                <div className="chats-sidebar">
                  <div className="chats-sidebar-header">
                    <h3>Active Lead Inboxes</h3>
                    <span className="badge">{chats.length} Sessions</span>
                  </div>
                  <div className="chats-list">
                    {chats.map((c) => {
                      const isSelected = selectedChatId === c.id;
                      const lastMessage = c.messages[c.messages.length - 1];

                      return (
                        <div
                          key={c.id}
                          className={`chat-item-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedChatId(c.id);
                            // Set selected n8n node to output node matching channel
                            const outputNodeId = c.source === 'whatsapp' ? 'whatsapp' : c.source === 'sms' ? 'sms' : 'website';
                            const targetNode = N8N_NODES.find((n) => n.id === outputNodeId);
                            if (targetNode) setSelectedN8nNode(targetNode);
                          }}
                        >
                          <div className="chat-card-top">
                            <div className="chat-card-title">
                              <span className="chat-avatar">{c.avatar}</span>
                              <div>
                                <span className="chat-name">{c.clientName}</span>
                                <span className="chat-contact">{c.contact}</span>
                              </div>
                            </div>
                            <span className="chat-time">{c.lastMessageTime}</span>
                          </div>

                          <div className="chat-card-desc">
                            <p className="last-message-snippet">
                              {lastMessage ? lastMessage.text : 'No messages'}
                            </p>
                          </div>

                          <div className="chat-card-tags">
                            <span className={`channel-tag ${c.source}`}>
                              {c.source}
                            </span>
                            <span className={`status-tag ${c.status}`}>
                              {c.status.replace('-', ' ')}
                            </span>
                            <span className="crm-stage-tag">
                              CRM: {c.crmStage}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Center Column: Chat Console */}
                <div className="chat-console">
                  {/* Chat Console Header */}
                  <div className="chat-console-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="active-avatar">{activeChat.avatar}</span>
                      <div>
                        <h3>{activeChat.clientName}</h3>
                        <span className="active-subtitle">{activeChat.contact} &bull; Pipeline channel: <strong style={{ textTransform: 'uppercase' }}>{activeChat.source}</strong></span>
                      </div>
                    </div>

                    <div className="chat-header-actions">
                      <div className="crm-indicator">
                        <Database size={12} />
                        <span>CRM: <strong>{activeChat.crmStage}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="chat-messages-feed">
                    {activeChat.messages.map((msg) => {
                      if (msg.sender === 'system') {
                        return (
                          <div key={msg.id} className="system-event-message">
                            <div className="sys-badge">n8n core log</div>
                            <span className="sys-text">{msg.text}</span>
                            <span className="sys-time">{msg.timestamp}</span>
                          </div>
                        );
                      }

                      const isAi = msg.sender === 'ai';

                      return (
                        <div key={msg.id} className={`message-bubble-wrapper ${isAi ? 'ai' : 'client'}`}>
                          {!isAi && <span className="msg-avatar">{activeChat.avatar}</span>}
                          
                          <div className="message-bubble-container">
                            <div className={`message-bubble ${isAi ? 'ai-bubble' : 'client-bubble'}`}>
                              {msg.text.split('\n').map((para, i) => (
                                <p key={i} style={{ marginBottom: i < msg.text.split('\n').length - 1 ? '10px' : '0' }}>{para}</p>
                              ))}

                              {/* AI Response Metadata */}
                              {isAi && msg.metadata && (
                                <div className="ai-metadata-footer">
                                  <span title="Gemini latency"><Clock size={10} /> {msg.metadata.latency}</span>
                                  <span title="Tokens consumed"><Code size={10} /> {msg.metadata.tokens} tkn</span>
                                  <span title="Confidence score"><CheckCircle size={10} /> {Math.round((msg.metadata.confidence || 0.95) * 100)}% conf</span>
                                  <span title="Gemini Model"><Sparkles size={10} /> {msg.metadata.agentName}</span>
                                </div>
                              )}
                            </div>
                            <span className="message-timestamp">
                              {isAi ? 'AI Response Assistant' : activeChat.clientName} &bull; {msg.timestamp}
                            </span>
                          </div>

                          {isAi && <span className="msg-avatar">🤖</span>}
                        </div>
                      );
                    })}

                    {isSimulating && simChatId === selectedChatId && (
                      <div className="ai-typing-loader">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>AI workflow routing...</span>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Message Input Panel (Allows user to act as client to test replies) */}
                  <form
                    className="chat-input-bar"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendClientMessage(clientInputText);
                    }}
                  >
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={isSimulating ? "n8n pipeline active, please wait..." : `Type a new inquiry as "${activeChat.clientName}"...`}
                      value={clientInputText}
                      onChange={(e) => setClientInputText(e.target.value)}
                      disabled={isSimulating}
                    />
                    <button
                      type="submit"
                      className="chat-send-btn"
                      disabled={isSimulating || !clientInputText.trim()}
                    >
                      <span>Simulate Reply</span>
                      <Send size={14} />
                    </button>
                  </form>
                </div>

                {/* Right Column: AI Live Node Tracker & Notes */}
                <div className="ai-reasoning-sidebar">
                  <div className="sidebar-header">
                    <h3>n8n Execution Trace</h3>
                  </div>

                  {/* Active Simulation Step View */}
                  {isSimulating && simChatId === selectedChatId ? (
                    <div className="sim-tracker-body">
                      <div className="sim-tracker-headline">
                        <div className="loader-ring"></div>
                        <div>
                          <h4>Active Workflow Trace</h4>
                          <p style={{ fontSize: '10px', color: '#9ca3af' }}>Evaluating nodes...</p>
                        </div>
                      </div>

                      <div className="sim-steps-list">
                        {simFlow.map((nodeId, idx) => {
                          const node = N8N_NODES.find((n) => n.id === nodeId);
                          const isExecuted = simNodesExecuted.includes(nodeId);
                          const isCurrent = simNodeRunning === nodeId;

                          let stepStatus = 'pending';
                          if (isCurrent) stepStatus = 'active';
                          else if (isExecuted) stepStatus = 'completed';

                          return (
                            <div key={nodeId} className={`sim-step-item ${stepStatus}`}>
                              <div className="step-bullet">
                                {isExecuted ? '✓' : idx + 1}
                              </div>
                              <div className="step-info">
                                <div className="step-node-name">{node?.name}</div>
                                <div className="step-node-desc">
                                  {isCurrent && 'Executing node code...'}
                                  {isExecuted && 'Node successfully finished.'}
                                  {stepStatus === 'pending' && 'Queued in workflow.'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="reasoning-sidebar-idle">
                      <div className="idle-icon">⚡</div>
                      <h4>No Active Workflow Execution</h4>
                      <p>Trigger a lead scenario from the sidebar or send a chat message to watch the workflow run node-by-node.</p>
                      
                      {activeChat.notes && (
                        <div className="session-notes-box">
                          <strong>Session Records:</strong>
                          <p>{activeChat.notes}</p>
                          <hr style={{ borderColor: '#2e303a', margin: '10px 0' }} />
                          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>Channel: <span className="channel-tag" style={{ border: 'none', padding: 0 }}>{activeChat.source.toUpperCase()}</span></div>
                            <div>CRM Lead Stage: <strong>{activeChat.crmStage}</strong></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: N8N WORKFLOW CANVAS */}
          {activeTab === 'n8n' && (
            <div className="n8n-view animate-fade">
              {/* Toolbar */}
              <div className="n8n-toolbar">
                <div className="toolbar-left">
                  <span className="n8n-version-tag">n8n workflow</span>
                  <div className="workflow-title-box">
                    <strong>AI Lead Processing Pipeline</strong>
                    <span className="saved-status">✓ Saved (Active)</span>
                  </div>
                </div>

                <div className="toolbar-right">
                  <button
                    className="n8n-run-btn"
                    onClick={() => handleTriggerScenario('whatsapp-pricing')}
                    disabled={isSimulating}
                  >
                    <Play size={14} fill="#fff" />
                    <span>Run Simulation</span>
                  </button>
                </div>
              </div>

              {/* Canvas Layout */}
              <div className="n8n-canvas-layout">
                {/* Visual Node Grid */}
                <div className="n8n-canvas-wrapper">
                  <N8nCanvas
                    activeNodeId={selectedN8nNode?.id || null}
                    onSelectNode={(node) => setSelectedN8nNode(node)}
                    runningNodeId={isSimulating ? simNodeRunning : null}
                    executedNodeIds={isSimulating ? simNodesExecuted : []}
                    simulationActive={isSimulating}
                  />
                  <div className="canvas-instruction-tip">
                    💡 Click on any node in the canvas above to view its parameters, input/output structures, and configurations.
                  </div>
                </div>

                {/* Right Parameter/Details Inspector Drawer */}
                {selectedN8nNode && (
                  <div className="n8n-node-inspector">
                    <div className="inspector-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="inspector-icon">{selectedN8nNode.icon}</span>
                        <div>
                          <h4>{selectedN8nNode.name}</h4>
                          <span className="node-id-label">ID: {selectedN8nNode.id} &bull; Type: {selectedN8nNode.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="inspector-tabs">
                      <button
                        className={`inspector-tab-btn ${activeNodeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveNodeTab('details')}
                      >
                        Description
                      </button>
                      <button
                        className={`inspector-tab-btn ${activeNodeTab === 'params' ? 'active' : ''}`}
                        onClick={() => setActiveNodeTab('params')}
                      >
                        Parameters
                      </button>
                      <button
                        className={`inspector-tab-btn ${activeNodeTab === 'input' ? 'active' : ''}`}
                        onClick={() => setActiveNodeTab('input')}
                      >
                        Sample Input JSON
                      </button>
                      <button
                        className={`inspector-tab-btn ${activeNodeTab === 'output' ? 'active' : ''}`}
                        onClick={() => setActiveNodeTab('output')}
                      >
                        Sample Output JSON
                      </button>
                    </div>

                    <div className="inspector-body">
                      {activeNodeTab === 'details' && (
                        <div className="tab-details-content">
                          <p className="node-long-desc">{selectedN8nNode.description}</p>
                          <div className="node-attributes">
                            <h5>Node Integration Capabilities</h5>
                            <ul>
                              <li>Handles real-time asynchronous API JSON data payloads.</li>
                              <li>Auto-retry enabled (3 attempts, 5s spacing on network dropouts).</li>
                              <li>Direct connection pool validation support.</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeNodeTab === 'params' && (
                        <div className="tab-params-content">
                          <table className="params-table">
                            <thead>
                              <tr>
                                <th>Parameter Name</th>
                                <th>Configured Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(selectedN8nNode.params).map(([key, val]) => (
                                <tr key={key}>
                                  <td className="param-key">{key}</td>
                                  <td className="param-val">
                                    {typeof val === 'object' ? (
                                      <pre style={{ margin: 0, fontSize: '10px' }}>{JSON.stringify(val, null, 2)}</pre>
                                    ) : (
                                      <code>{String(val)}</code>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeNodeTab === 'input' && (
                        <div className="tab-json-content">
                          <pre>{JSON.stringify(selectedN8nNode.sampleInput, null, 2)}</pre>
                        </div>
                      )}

                      {activeNodeTab === 'output' && (
                        <div className="tab-json-content">
                          <pre>{JSON.stringify(selectedN8nNode.sampleOutput, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS & KNOWLEDGE BASE */}
          {activeTab === 'settings' && (
            <div className="settings-view animate-fade">
              <div className="settings-grid">
                {/* Left side: System prompt settings */}
                <div className="settings-card flex-2">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={18} className="text-purple" />
                      <h3>AI Agent Core System Prompt</h3>
                    </div>
                    <span className="card-desc">Instruct the AI how to act, respond, and formulate rules for the simulator.</span>
                  </div>

                  <div className="card-body">
                    <textarea
                      className="system-prompt-textarea"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={12}
                      placeholder="Enter the AI model instructions..."
                    />
                    <div className="prompt-guidelines">
                      <h5>Prompting Guidelines:</h5>
                      <ul>
                        <li>Use clear variables like <code>{'{{client_name}}'}</code> for injection.</li>
                        <li>Explicitly forbid the model from answering custom queries outside the KB context to prevent hallucinations.</li>
                        <li>Provide fallback links (e.g. scheduling Calendly) clearly.</li>
                      </ul>
                    </div>
                    
                    <button
                      className="settings-save-btn"
                      onClick={() => {
                        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        setLogs((prev) => [
                          ...prev,
                          {
                            id: `log-prompt-${Date.now()}`,
                            timestamp,
                            level: 'success',
                            source: 'Settings Panel',
                            message: 'System prompt instructions updated. New configurations set for LLM engine.',
                          },
                        ]);
                        alert('System prompt instructions saved successfully!');
                      }}
                    >
                      Save Prompt Configuration
                    </button>
                  </div>
                </div>

                {/* Right side: Knowledge Base manager */}
                <div className="settings-card flex-3">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Database size={18} className="text-purple" />
                      <h3>AI Agent Knowledge Base (FAQS)</h3>
                    </div>
                    <span className="card-desc">Add business-specific facts. The Vector DB retrieves these to feed into Gemini.</span>
                  </div>

                  <div className="card-body">
                    {/* Add FAQ form */}
                    <form className="add-faq-form" onSubmit={handleAddKbItem}>
                      <h4>Add New Fact / FAQ</h4>
                      <div className="form-row">
                        <div className="form-group flex-1">
                          <label>Category</label>
                          <select
                            value={newKbCategory}
                            onChange={(e) => setNewKbCategory(e.target.value)}
                          >
                            <option value="Pricing">Pricing</option>
                            <option value="Product Demo">Product Demo</option>
                            <option value="Escalation Policy">Escalation Policy</option>
                            <option value="Integrations">Integrations</option>
                          </select>
                        </div>
                        <div className="form-group flex-3">
                          <label>Question / Keyword Trigger</label>
                          <input
                            type="text"
                            placeholder="e.g. Do you support Slack?"
                            value={newKbQuestion}
                            onChange={(e) => setNewKbQuestion(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Answer Text</label>
                        <textarea
                          placeholder="e.g. Yes, we support complete Slack integrations through our webhook nodes..."
                          value={newKbAnswer}
                          onChange={(e) => setNewKbAnswer(e.target.value)}
                          rows={3}
                          required
                        />
                      </div>

                      <button type="submit" className="add-kb-btn">
                        <Plus size={14} />
                        <span>Add Fact to Vector Database</span>
                      </button>
                    </form>

                    <hr className="divider" />

                    {/* FAQ Items list */}
                    <div className="faq-items-list-container">
                      <h4>Active Database Entries ({kbItems.length})</h4>
                      <div className="faq-items-list">
                        {kbItems.map((item) => (
                          <div key={item.id} className="faq-item-card">
                            <div className="faq-item-header">
                              <span className="faq-category-badge">{item.category}</span>
                              <button
                                className="delete-kb-btn"
                                onClick={() => handleDeleteKbItem(item.id)}
                                title="Remove Fact"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div className="faq-item-body">
                              <strong>Q: {item.question}</strong>
                              <p>A: {item.answer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
