const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import modules
const { checkAuthorization } = require('./src/config/auth');
const { setupCommands } = require('./src/handlers/commands');
const { setupDocumentHandlers } = require('./src/handlers/documentHandler');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Store CSV data temporarily for print buttons
const csvDataStore = new Map();

// Apply authorization middleware to all messages and commands
// bot.use(checkAuthorization);

// Setup command handlers
setupCommands(bot);

// Setup document handlers
setupDocumentHandlers(bot, csvDataStore, tempDir);

// Error handling
bot.catch((err, ctx) => {
    console.error('Telegram bot error:', err);
    ctx.reply('❌ Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
});

// Start the bot
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_DOMAIN) {
    // Webhook mode for production
    bot.launch({
        webhook: {
            domain: process.env.WEBHOOK_DOMAIN,
            port: PORT
        }
    }, () => {
        console.log(`🌐 PurplBot läuft im Webhook-Modus auf Port ${PORT} (${process.env.WEBHOOK_DOMAIN})`);
    }).catch((err) => {
        console.error('❌ Fehler beim Starten des Bots:', err);
    });
} else {
    // Polling mode for development (or fallback when WEBHOOK_DOMAIN is not configured)
    if (process.env.NODE_ENV === 'production') {
        console.log('ℹ️ WEBHOOK_DOMAIN nicht gesetzt. Starte Bot im Polling-Modus...');
    }
    bot.launch({}, () => {
        console.log('🧪 PurplBot (Cannabis-Analyse-Bericht-Bot) läuft im Polling-Modus...');
    }).catch((err) => {
        console.error('❌ Fehler beim Starten des Bots:', err);
    });
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 