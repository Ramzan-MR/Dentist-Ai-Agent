-- Omnichannel tables: customers, conversations, messages, leads
-- Run this after 001_create_appointments_table.sql

-- Customers: identity across channels
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(30) UNIQUE,
  whatsapp_id VARCHAR(50) UNIQUE,
  email VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp_id ON customers(whatsapp_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Conversations: one per channel session
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('web', 'whatsapp', 'voice')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  external_id VARCHAR(255),   -- Twilio CallSid / WhatsApp conversation id
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_external ON conversations(external_id);

-- Messages: individual turns in a conversation
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL,
  external_id VARCHAR(255),   -- Twilio MessageSid
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Leads: captured inquiries
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(255),
  service VARCHAR(255),
  intent TEXT,
  preferred_time VARCHAR(255),
  notes TEXT,
  channel VARCHAR(20) NOT NULL DEFAULT 'web',
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_channel ON leads(channel);

-- Reuse the existing updated_at trigger function from migration 001
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
