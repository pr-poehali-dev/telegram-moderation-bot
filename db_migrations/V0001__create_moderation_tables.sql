
CREATE TABLE IF NOT EXISTS moderation_actions (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    moderator_id BIGINT NOT NULL,
    moderator_username VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banned_users (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    reason TEXT,
    banned_by BIGINT NOT NULL,
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS muted_users (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    reason TEXT,
    muted_by BIGINT NOT NULL,
    muted_until TIMESTAMP,
    muted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS warnings (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    reason TEXT,
    warned_by BIGINT NOT NULL,
    warned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_settings (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL UNIQUE,
    block_links BOOLEAN DEFAULT TRUE,
    block_invites BOOLEAN DEFAULT TRUE,
    anti_spam BOOLEAN DEFAULT TRUE,
    caps_filter BOOLEAN DEFAULT FALSE,
    banned_words TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS moderators (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    added_by BIGINT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
);

CREATE INDEX idx_moderation_actions_chat ON moderation_actions(chat_id);
CREATE INDEX idx_moderation_actions_user ON moderation_actions(user_id);
CREATE INDEX idx_banned_users_chat ON banned_users(chat_id);
CREATE INDEX idx_muted_users_chat ON muted_users(chat_id);
CREATE INDEX idx_warnings_chat_user ON warnings(chat_id, user_id);
CREATE INDEX idx_moderators_chat ON moderators(chat_id);
