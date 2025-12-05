import { GoogleGenAI, FunctionDeclaration, Type, FunctionCall } from "@google/genai";
import { AIConfig } from "../types";
import { constructRAGContext } from "./ragService";
import { addAppointment, generateId, getAllCustomers } from "./dbService";

const DEFAULT_CONFIG: AIConfig = {
  provider: 'gemini',
  apiKey: process.env.API_KEY || '',
  model: 'gemini-2.5-flash'
};

export const getAIConfig = (): AIConfig => {
  try {
    const stored = localStorage.getItem('nexus_ai_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to parse AI config", e);
  }
  return DEFAULT_CONFIG;
};

export const saveAIConfig = (config: AIConfig) => {
  localStorage.setItem('nexus_ai_config', JSON.stringify(config));
};

// --- Function Declarations (Tools) ---

const bookAppointmentTool: FunctionDeclaration = {
  name: 'bookAppointment',
  description: 'Book a new appointment for a customer. Use this when the user explicitly requests to schedule a meeting or call.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: {
        type: Type.STRING,
        description: 'Name of the customer booking the appointment.'
      },
      date: {
        type: Type.STRING,
        description: 'Date of the appointment in YYYY-MM-DD format.'
      },
      time: {
        type: Type.STRING,
        description: 'Time of the appointment in HH:MM format (24hr).'
      },
      type: {
        type: Type.STRING,
        description: 'Type of appointment: "Phone", "Video", or "In-Person". Defaults to "Video".'
      },
      notes: {
        type: Type.STRING,
        description: 'Any specific topic or agenda mentioned.'
      }
    },
    required: ['customerName', 'date', 'time']
  }
};

// --- Execution Logic ---

const executeFunction = async (functionCall: FunctionCall): Promise<any> => {
    if (functionCall.name === 'bookAppointment') {
        const args = functionCall.args as any;
        console.log("AI Attempting to book:", args);
        
        // Try to link to existing customer
        const customers = getAllCustomers();
        const existingCustomer = customers.find(c => c.name.toLowerCase().includes(args.customerName.toLowerCase()));
        
        const newAppt = {
            id: generateId(),
            customerId: existingCustomer ? existingCustomer.id : 'guest',
            customerName: args.customerName,
            title: args.notes ? `Meeting: ${args.notes}` : 'Consultation',
            date: args.date,
            time: args.time,
            duration: 30, // Default duration
            type: (args.type as any) || 'Video',
            status: 'Scheduled' as const,
            notes: args.notes || 'Booked via AI Receptionist'
        };

        addAppointment(newAppt);
        return { success: true, message: `Appointment confirmed for ${args.date} at ${args.time}.` };
    }
    return { error: "Function not found" };
};

// --- Provider Implementations ---

const callGemini = async (config: AIConfig, prompt: string, tools?: FunctionDeclaration[], systemInstruction?: string) => {
  if (!config.apiKey) throw new Error("Gemini API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  
  // 1. First Call: Send Prompt + Tools
  const response = await ai.models.generateContent({
    model: config.model || 'gemini-2.5-flash',
    contents: prompt,
    config: {
        systemInstruction: systemInstruction,
        tools: tools ? [{ functionDeclarations: tools }] : undefined
    }
  });

  const candidate = response.candidates?.[0];
  
  // 2. Check for Function Calls
  // Note: response structure handling for function calls
  const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);

  if (functionCalls && functionCalls.length > 0) {
      // Execute the function
      const call = functionCalls[0]!;
      const executionResult = await executeFunction(call);
      
      // 3. Second Call: Send Result back to model to get natural language confirmation
      // For simplicity in this demo, we will just return the natural confirmation if the model generates one, 
      // or construct a simple one. Ideally, we send the history back.
      // Here we just return a combined string for the UI.
      return `[System: Action Performed] ${executionResult.message}`; 
  }

  return response.text || "No response generated.";
};

// --- Main Interface ---

export const generateEmailReply = async (originalEmailContent: string, tone: string = 'professional'): Promise<string> => {
  const config = getAIConfig();
  const prompt = `Draft a ${tone} email reply to: "${originalEmailContent}"`;
  
  if (config.provider === 'gemini') {
      return await callGemini(config, prompt, undefined, "You are an AI assistant for a business.");
  }
  return "Only Gemini provider supports this feature in this demo.";
};

export const generateReceptionistResponse = async (userQuery: string): Promise<string> => {
    const config = getAIConfig();
    const ragContext = constructRAGContext();
    const today = new Date().toISOString().split('T')[0];
    
    const systemPrompt = `You are an AI Receptionist for a business. 
    Today is ${today}.
    Use the provided BUSINESS CONTEXT to answer questions.
    If the user wants to book an appointment, use the 'bookAppointment' tool.
    
    ${ragContext}`;

    try {
        if (config.provider === 'gemini') {
            return await callGemini(config, userQuery, [bookAppointmentTool], systemPrompt);
        }
        // Fallback for other providers (no tools implemented in this demo for them)
        return "I apologize, but I can only book appointments when using the Gemini provider.";
    } catch (error: any) {
        console.error("AI Service Error:", error);
        return "I apologize, but I'm having trouble accessing my systems right now.";
    }
};

// --- LANDING PAGE SALES BOT ---
export const generateLandingChatResponse = async (userMessage: string): Promise<string> => {
    const config = getAIConfig();
    
    const SALES_CONTEXT = `
    You are 'Nexus', the AI Sales Assistant for the NexusAI SaaS Platform.
    Your goal is to be helpful, friendly, and encourage visitors to sign up for the free trial.
    
    PRODUCT INFO:
    - Name: NexusAI
    - Core Features: AI Receptionist (Voice), Email Automation, CRM, Unified Dashboard, Field Ops & Job Dispatch.
    - Value Prop: Automate 24/7 customer facing tasks, save time, reduce overhead.
    
    PRICING TIERS (Weekly):
    1. Email Only ($100/wk): Email drafts, templates, analytics.
    2. Receptionist Only ($400/wk): Voice AI, call recording, booking.
    3. Pro Bundle ($500/wk): *Most Popular* - Includes Voice + Email + CRM + Analytics.
    4. Business Elite ($700/wk): *New Premium* - Adds Field Ops, Job Dispatch, Worker Management, Priority Support.
    
    KEY RESPONSES:
    - If asked about price, mention the flexible weekly billing and no lock-in contracts.
    - If asked about "Field Ops" or "Dispatch", highlight the new Business Elite plan.
    - If asked how to start, tell them to click "Start Free Trial" at the top or bottom of the page.
    - Keep answers concise (under 3 sentences) unless asked for details.
    - Use emojis occasionally to be friendly.
    `;

    try {
        if (config.provider === 'gemini') {
            return await callGemini(config, userMessage, undefined, SALES_CONTEXT);
        }
        return "I'm simulated right now, but normally I'd tell you about our great features!";
    } catch (error) {
        console.error("Sales Bot Error:", error);
        return "I'm having a bit of trouble connecting to the sales database. Try refreshing!";
    }
};

export const summarizeCustomerNotes = async (notes: string): Promise<string> => {
    const config = getAIConfig();
    if (config.provider === 'gemini') {
        return await callGemini(config, `Summarize these notes: "${notes}"`);
    }
    return "Summary unavailable.";
};