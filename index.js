const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const cheerio = require('cheerio');
const token = '329099307:AAGYQ0B_7N7PATJLJck6RYmRP620jbzmCDI';



// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    var Hi = "hi";

    var SheduleTest = '/s';
    var Shedule = "/r";
    var SheduleUrl = "http://cyber.regi.rovno.ua/rozklad-zanyat/";
    var pdfLinks = [];

    var Contacts = "/contacts";

    var blala = 'Українська освіта стаціонар';

    if (msg.text.toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(chatId, 'Wasup!');
    } else if (msg.text.toLowerCase().indexOf(Shedule) === 0) {
        request(SheduleUrl, function(error, response, body) {
            var $ = cheerio.load(body);
            $('a.gde-link').each(function(i, elem) {
                pdfLinks[i] = $(this).attr('href');
            });
            // var ukrainianShedule = $('a.gde-link').eq(0).attr('href');
            var res = pdfLinks.join('\n');
            // console.log(res);
            bot.sendMessage(chatId, res);
        });
    } else if (msg.text.toLowerCase().indexOf(Contacts) === 0) {
        request(SheduleUrl, function(error, response, body) {
            var $ = cheerio.load(body);
            var contactText = $('.textwidget', '#text-6').text();
            bot.sendMessage(chatId, contactText);
        });
    }
});