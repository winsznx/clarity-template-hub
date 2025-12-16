-- Clarity Template Hub Database Schema

-- Store all NFT mint events
CREATE TABLE IF NOT EXISTS mints (
  id BIGSERIAL PRIMARY KEY,
  tx_id VARCHAR(66) UNIQUE NOT NULL,
  user_address VARCHAR(42) NOT NULL,
  template_id INTEGER NOT NULL,
  block_height INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  network VARCHAR(10) NOT NULL CHECK (network IN ('mainnet', 'testnet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mints_user ON mints(user_address);
CREATE INDEX idx_mints_template ON mints(template_id);
CREATE INDEX idx_mints_timestamp ON mints(timestamp DESC);

-- Store NFT transfer events
CREATE TABLE IF NOT EXISTS transfers (
  id BIGSERIAL PRIMARY KEY,
  tx_id VARCHAR(66) UNIQUE NOT NULL,
  token_id INTEGER NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  block_height INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  network VARCHAR(10) NOT NULL CHECK (network IN ('mainnet', 'testnet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transfers_from ON transfers(from_address);
CREATE INDEX idx_transfers_to ON transfers(to_address);
CREATE INDEX idx_transfers_token ON transfers(token_id);

-- Store contract deployment events
CREATE TABLE IF NOT EXISTS deployments (
  id BIGSERIAL PRIMARY KEY,
  contract_identifier VARCHAR(128) UNIQUE NOT NULL,
  deployer_address VARCHAR(42) NOT NULL,
  template_id INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  similarity_score FLOAT,
  code_hash VARCHAR(64),
  block_height INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  network VARCHAR(10) NOT NULL CHECK (network IN ('mainnet', 'testnet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deployments_deployer ON deployments(deployer_address);
CREATE INDEX idx_deployments_template ON deployments(template_id);
CREATE INDEX idx_deployments_verified ON deployments(verified);

-- Template analytics (aggregated data)
CREATE TABLE IF NOT EXISTS template_analytics (
  template_id INTEGER PRIMARY KEY,
  total_mints INTEGER DEFAULT 0,
  total_deployments INTEGER DEFAULT 0,
  total_revenue_ustx BIGINT DEFAULT 0,
  last_mint_timestamp BIGINT,
  last_deployment_timestamp BIGINT,
  trending_score FLOAT DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analytics (aggregated data)
CREATE TABLE IF NOT EXISTS user_analytics (
  user_address VARCHAR(42) PRIMARY KEY,
  total_mints INTEGER DEFAULT 0,
  total_deployments INTEGER DEFAULT 0,
  total_spent_ustx BIGINT DEFAULT 0,
  reputation_points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_analytics_rank ON user_analytics(rank);
CREATE INDEX idx_user_analytics_reputation ON user_analytics(reputation_points DESC);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_address VARCHAR(42) PRIMARY KEY,
  email VARCHAR(255),
  discord_webhook VARCHAR(255),
  telegram_chat_id VARCHAR(50),
  watch_templates INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  notify_on_mint BOOLEAN DEFAULT TRUE,
  notify_on_transfer BOOLEAN DEFAULT TRUE,
  notify_on_deployment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed (recent events for UI)
CREATE TABLE IF NOT EXISTS activity_feed (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('mint', 'transfer', 'deployment')),
  user_address VARCHAR(42) NOT NULL,
  template_id INTEGER,
  contract_identifier VARCHAR(128),
  tx_id VARCHAR(66) NOT NULL,
  timestamp BIGINT NOT NULL,
  network VARCHAR(10) NOT NULL CHECK (network IN ('mainnet', 'testnet')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_timestamp ON activity_feed(timestamp DESC);
CREATE INDEX idx_activity_feed_type ON activity_feed(event_type);

-- Badges definition
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50),
  requirement_type VARCHAR(20) NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('Early Adopter', 'One of the first 100 users', '🌟', 'user_rank', 100),
  ('Template Collector', 'Minted 5+ templates', '📚', 'total_mints', 5),
  ('Power User', 'Minted 10+ templates', '⚡', 'total_mints', 10),
  ('Template Master', 'Minted 25+ templates', '👑', 'total_mints', 25),
  ('Complete Collection', 'Minted all 50 templates', '💎', 'total_mints', 50),
  ('Builder', 'Deployed 1+ contracts', '🔨', 'total_deployments', 1),
  ('Architect', 'Deployed 5+ contracts', '🏗️', 'total_deployments', 5),
  ('Legend', 'Deployed 10+ contracts', '🚀', 'total_deployments', 10)
ON CONFLICT (name) DO NOTHING;

-- Functions for analytics updates
CREATE OR REPLACE FUNCTION update_template_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO template_analytics (template_id, total_mints, last_mint_timestamp)
  VALUES (NEW.template_id, 1, NEW.timestamp)
  ON CONFLICT (template_id) DO UPDATE SET
    total_mints = template_analytics.total_mints + 1,
    last_mint_timestamp = NEW.timestamp,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_analytics (user_address, total_mints, total_spent_ustx)
  VALUES (NEW.user_address, 1, 100000) -- 0.1 STX in microSTX
  ON CONFLICT (user_address) DO UPDATE SET
    total_mints = user_analytics.total_mints + 1,
    total_spent_ustx = user_analytics.total_spent_ustx + 100000,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_template_analytics ON mints;
CREATE TRIGGER trigger_update_template_analytics
  AFTER INSERT ON mints
  FOR EACH ROW
  EXECUTE FUNCTION update_template_analytics();

DROP TRIGGER IF EXISTS trigger_update_user_analytics ON mints;
CREATE TRIGGER trigger_update_user_analytics
  AFTER INSERT ON mints
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analytics();
