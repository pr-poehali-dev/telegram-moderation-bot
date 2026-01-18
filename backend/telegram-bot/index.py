import json
import os
import re
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def init_chat_settings(chat_id):
    """Инициализация настроек чата"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO chat_settings (chat_id, block_links, block_invites, anti_spam, caps_filter)
                VALUES (%s, TRUE, TRUE, TRUE, FALSE)
                ON CONFLICT (chat_id) DO NOTHING
            """, (chat_id,))
        conn.commit()
    finally:
        conn.close()

def get_chat_settings(chat_id):
    """Получить настройки чата"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM chat_settings WHERE chat_id = %s", (chat_id,))
            settings = cur.fetchone()
            if not settings:
                init_chat_settings(chat_id)
                cur.execute("SELECT * FROM chat_settings WHERE chat_id = %s", (chat_id,))
                settings = cur.fetchone()
            return dict(settings)
    finally:
        conn.close()

def check_moderator_role(chat_id, user_id):
    """Проверка роли модератора"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT role FROM moderators 
                WHERE chat_id = %s AND user_id = %s
            """, (chat_id, user_id))
            mod = cur.fetchone()
            return dict(mod)['role'] if mod else None
    finally:
        conn.close()

def log_action(chat_id, user_id, username, action_type, reason, moderator_id, moderator_username):
    """Логирование действий модератора"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO moderation_actions 
                (chat_id, user_id, username, action_type, reason, moderator_id, moderator_username)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (chat_id, user_id, username, action_type, reason, moderator_id, moderator_username))
        conn.commit()
    finally:
        conn.close()

def ban_user(chat_id, user_id, username, reason, banned_by):
    """Забанить пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO banned_users (chat_id, user_id, username, reason, banned_by)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (chat_id, user_id) DO UPDATE 
                SET reason = EXCLUDED.reason, banned_at = CURRENT_TIMESTAMP
            """, (chat_id, user_id, username, reason, banned_by))
        conn.commit()
        return True
    finally:
        conn.close()

def mute_user(chat_id, user_id, username, reason, muted_by, duration_minutes=60):
    """Замутить пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            muted_until = datetime.now() + timedelta(minutes=duration_minutes)
            cur.execute("""
                INSERT INTO muted_users (chat_id, user_id, username, reason, muted_by, muted_until)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (chat_id, user_id) DO UPDATE 
                SET reason = EXCLUDED.reason, muted_until = EXCLUDED.muted_until, muted_at = CURRENT_TIMESTAMP
            """, (chat_id, user_id, username, reason, muted_by, muted_until))
        conn.commit()
        return True
    finally:
        conn.close()

def warn_user(chat_id, user_id, username, reason, warned_by):
    """Выдать предупреждение"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO warnings (chat_id, user_id, username, reason, warned_by)
                VALUES (%s, %s, %s, %s, %s)
            """, (chat_id, user_id, username, reason, warned_by))
            
            cur.execute("""
                SELECT COUNT(*) as count FROM warnings 
                WHERE chat_id = %s AND user_id = %s 
                AND warned_at > NOW() - INTERVAL '24 hours'
            """, (chat_id, user_id))
            count = cur.fetchone()[0]
        conn.commit()
        return count
    finally:
        conn.close()

def check_message_filters(message_text, settings):
    """Проверка сообщения на нарушения"""
    violations = []
    
    if settings['block_links']:
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        if re.search(url_pattern, message_text, re.IGNORECASE):
            violations.append('links')
    
    if settings['block_invites']:
        invite_patterns = [r't\.me/', r'@\w+', r'telegram\.me/', r'joinchat/']
        for pattern in invite_patterns:
            if re.search(pattern, message_text, re.IGNORECASE):
                violations.append('invites')
                break
    
    if settings['caps_filter']:
        caps_ratio = sum(1 for c in message_text if c.isupper()) / max(len(message_text), 1)
        if caps_ratio > 0.7 and len(message_text) > 10:
            violations.append('caps')
    
    if settings['banned_words']:
        for word in settings['banned_words']:
            if word.lower() in message_text.lower():
                violations.append('banned_words')
                break
    
    return violations

def process_telegram_update(update):
    """Обработка обновления от Telegram"""
    if 'message' not in update:
        return {'ok': True, 'message': 'No message in update'}
    
    message = update['message']
    chat_id = message['chat']['id']
    user_id = message['from']['id']
    username = message['from'].get('username', 'unknown')
    text = message.get('text', '')
    
    init_chat_settings(chat_id)
    settings = get_chat_settings(chat_id)
    
    if text.startswith('/'):
        command_parts = text.split()
        command = command_parts[0].lower()
        
        mod_role = check_moderator_role(chat_id, user_id)
        
        if command == '/start':
            return {
                'method': 'sendMessage',
                'chat_id': chat_id,
                'text': '🛡 Бот-модератор активирован!\n\nДоступные команды:\n/ban - забанить пользователя\n/mute - замутить пользователя\n/warn - предупредить\n/stats - статистика\n/settings - настройки'
            }
        
        if command == '/stats':
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) FROM banned_users WHERE chat_id = %s", (chat_id,))
                    bans = cur.fetchone()[0]
                    cur.execute("SELECT COUNT(*) FROM muted_users WHERE chat_id = %s", (chat_id,))
                    mutes = cur.fetchone()[0]
                    cur.execute("SELECT COUNT(*) FROM warnings WHERE chat_id = %s", (chat_id,))
                    warns = cur.fetchone()[0]
                
                stats_text = f"📊 Статистика чата:\n\n🚫 Баны: {bans}\n🔇 Муты: {mutes}\n⚠️ Предупреждения: {warns}"
                return {'method': 'sendMessage', 'chat_id': chat_id, 'text': stats_text}
            finally:
                conn.close()
        
        if command in ['/ban', '/mute', '/warn']:
            if not mod_role:
                return {'method': 'sendMessage', 'chat_id': chat_id, 'text': '❌ У вас нет прав модератора'}
            
            if 'reply_to_message' not in message:
                return {'method': 'sendMessage', 'chat_id': chat_id, 'text': '❌ Ответьте на сообщение пользователя'}
            
            target_user_id = message['reply_to_message']['from']['id']
            target_username = message['reply_to_message']['from'].get('username', 'unknown')
            reason = ' '.join(command_parts[1:]) if len(command_parts) > 1 else 'Нарушение правил'
            
            if command == '/ban':
                if mod_role not in ['admin', 'moderator']:
                    return {'method': 'sendMessage', 'chat_id': chat_id, 'text': '❌ Недостаточно прав'}
                ban_user(chat_id, target_user_id, target_username, reason, user_id)
                log_action(chat_id, target_user_id, target_username, 'ban', reason, user_id, username)
                return {'method': 'sendMessage', 'chat_id': chat_id, 'text': f'🚫 Пользователь @{target_username} забанен\nПричина: {reason}'}
            
            elif command == '/mute':
                mute_user(chat_id, target_user_id, target_username, reason, user_id)
                log_action(chat_id, target_user_id, target_username, 'mute', reason, user_id, username)
                return {'method': 'sendMessage', 'chat_id': chat_id, 'text': f'🔇 Пользователь @{target_username} замучен на 60 минут\nПричина: {reason}'}
            
            elif command == '/warn':
                warn_count = warn_user(chat_id, target_user_id, target_username, reason, user_id)
                log_action(chat_id, target_user_id, target_username, 'warn', reason, user_id, username)
                return {'method': 'sendMessage', 'chat_id': chat_id, 'text': f'⚠️ Предупреждение для @{target_username} ({warn_count}/3)\nПричина: {reason}'}
    
    violations = check_message_filters(text, settings)
    if violations:
        return {
            'method': 'deleteMessage',
            'chat_id': chat_id,
            'message_id': message['message_id']
        }
    
    return {'ok': True}

def handler(event, context):
    """Главный обработчик webhook от Telegram"""
    try:
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': '',
                'isBase64Encoded': False
            }
        
        if event.get('httpMethod') == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            result = process_telegram_update(body)
            
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            if result.get('method') and bot_token:
                import urllib.request
                
                method = result.pop('method')
                url = f'https://api.telegram.org/bot{bot_token}/{method}'
                
                data = json.dumps(result).encode('utf-8')
                req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
                urllib.request.urlopen(req)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'status': 'Bot is running'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }