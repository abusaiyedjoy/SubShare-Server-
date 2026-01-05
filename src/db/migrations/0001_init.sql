-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  balance REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Subscription Platforms table
CREATE TABLE IF NOT EXISTS subscription_platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,
  status INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Shared Subscriptions table
CREATE TABLE IF NOT EXISTS shared_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL,
  shared_by INTEGER NOT NULL,
  credentials_username TEXT NOT NULL,
  credentials_password TEXT NOT NULL,
  price_per_hour REAL NOT NULL,
  status INTEGER NOT NULL DEFAULT 1,
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_note TEXT,
  verified_by_admin_id INTEGER,
  total_shares_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER,
  FOREIGN KEY (platform_id) REFERENCES subscription_platforms(id),
  FOREIGN KEY (shared_by) REFERENCES users(id),
  FOREIGN KEY (verified_by_admin_id) REFERENCES users(id)
);

-- Subscription Access table
CREATE TABLE IF NOT EXISTS subscription_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shared_subscription_id INTEGER NOT NULL,
  accessed_by INTEGER NOT NULL,
  access_price_paid REAL NOT NULL,
  admin_commission REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
  access_start_time INTEGER NOT NULL DEFAULT (unixepoch()),
  access_end_time INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (shared_subscription_id) REFERENCES shared_subscriptions(id),
  FOREIGN KEY (accessed_by) REFERENCES users(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('topup', 'purchase', 'earning', 'refund', 'commission')),
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'cancelled')),
  admin_commission_percentage REAL,
  admin_commission_amount REAL,
  related_subscription_access_id INTEGER,
  notes TEXT,
  processed_by_admin_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (related_subscription_access_id) REFERENCES subscription_access(id),
  FOREIGN KEY (processed_by_admin_id) REFERENCES users(id)
);

-- Topup Requests table
CREATE TABLE IF NOT EXISTS topup_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  transaction_id TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  reviewed_by_admin_id INTEGER,
  review_notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reported_by_user_id INTEGER NOT NULL,
  shared_subscription_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
  resolved_by_admin_id INTEGER,
  resolution_notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (reported_by_user_id) REFERENCES users(id),
  FOREIGN KEY (shared_subscription_id) REFERENCES shared_subscriptions(id),
  FOREIGN KEY (resolved_by_admin_id) REFERENCES users(id)
);

-- Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Insert default platform settings
INSERT OR IGNORE INTO platform_settings (key, value, description) VALUES
  ('admin_commission_percentage', '10', 'Default admin commission percentage'),
  ('min_topup_amount', '10', 'Minimum topup amount'),
  ('max_topup_amount', '10000', 'Maximum topup amount'),
  ('platform_name', 'SubShare', 'Platform name'),
  ('platform_email', 'admin@subshare.com', 'Platform contact email');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_subscriptions_platform_id ON shared_subscriptions(platform_id);
CREATE INDEX IF NOT EXISTS idx_shared_subscriptions_shared_by ON shared_subscriptions(shared_by);
CREATE INDEX IF NOT EXISTS idx_subscription_access_accessed_by ON subscription_access(accessed_by);
CREATE INDEX IF NOT EXISTS idx_topup_requests_user_id ON topup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_shared_subscription_id ON reports(shared_subscription_id);