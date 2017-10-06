// const TelegramBot = require('node-telegram-bot-api');
const Telegraf = require('telegraf');
const { reply, Extra, Markup } = Telegraf;
const request = require('request');
const cheerio = require('cheerio');

const token = '329099307:AAGYQ0B_7N7PATJLJck6RYmRP620jbzmCDI';


function nodeTelegramBot() {
    // // Create a bot that uses 'polling' to fetch new updates
    // const bot = new TelegramBot(token, { polling: true });

    // // Matches "/echo [whatever]"
    // bot.onText(/\/echo (.+)/, (msg, match) => {
    //     // 'msg' is the received Message from Telegram
    //     // 'match' is the result of executing the regexp above on the text content
    //     // of the message

    //     const chatId = msg.chat.id;
    //     const resp = match[1]; // the captured "whatever"

    //     // send back the matched "whatever" to the chat
    //     bot.sendMessage(chatId, resp);
    // });

    // // Listen for any kind of message. There are different kinds of
    // // messages.
    // bot.on('message', (msg) => {
    //     const chatId = msg.chat.id;

    //     var Hi = "hi";

    //     var SheduleTest = '/s';
    //     var Shedule = "/r";
    //     var SheduleUrl = "http://cyber.regi.rovno.ua/rozklad-zanyat/";
    //     var pdfLinks = [];

    //     var Contacts = "/contacts";

    //     var blala = 'Українська освіта стаціонар';

    //     if (msg.text.toLowerCase().indexOf(Hi) === 0) {
    //         bot.sendMessage(chatId, 'Wasup!');
    //     } else if (msg.text.toLowerCase().indexOf(Shedule) === 0) {
    //         request(SheduleUrl, function(error, response, body) {
    //             var $ = cheerio.load(body);
    //             $('a.gde-link').each(function(i, elem) {
    //                 pdfLinks[i] = $(this).attr('href');
    //             });
    //             // var ukrainianShedule = $('a.gde-link').eq(0).attr('href');
    //             var res = pdfLinks.join('\n');
    //             // console.log(res);
    //             bot.sendMessage(chatId, res);
    //         });
    //     } else if (msg.text.toLowerCase().indexOf(Contacts) === 0) {
    //         request(SheduleUrl, function(error, response, body) {
    //             var $ = cheerio.load(body);
    //             var contactText = $('.textwidget', '#text-6').text();
    //             bot.sendMessage(chatId, contactText);
    //         });
    //     } else if (msg.text.toLowerCase().indexOf(SheduleTest) === 0) {
    //         const opts = {
    //             reply_to_message_id: msg.message_id,
    //             reply_markup: JSON.stringify({
    //                 keyboard: [
    //                     ['Українська освіта стаціонар'],
    //                     ['Європейська освіта стаціонар'],
    //                     ['Українська освіта заочне']
    //                 ]
    //             })
    //         };
    //         bot.sendMessage(msg.chat.id, 'Який розклад потрібен?', opts);
    //         // if (msg.text('Українська освіта стаціонар') === 0) {
    //         //     request(SheduleUrl, function(error, response, body) {
    //         //         var $ = cheerio.load(body);
    //         //         var ukrainianShedule = $('a.gde-link').eq(1).text();
    //         //         bot.sendMessage(chatId, ukrainianShedule);
    //         //     });
    //         // }
    //     }
    // });
    // bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    //     const action = callbackQuery.data;
    //     const msg = callbackQuery.message;
    //     const opts = {
    //         chat_id: msg.chat.id,
    //         message_id: msg.message_id,
    //     };
    //     let text;

    //     if (action === 'edit') {
    //         text = 'Edited Text';
    //     }

    //     bot.editMessageText(text, opts);
    // });
}

const bot = new Telegraf(token);
bot.use(Telegraf.log())

// bot.command('start', ({ from, reply }) => {
//     console.log('start', from)
//     return reply('Welcome!')
// })
// bot.hears('hi', (ctx) => ctx.reply('Hey there!'))
// bot.on('sticker', (ctx) => ctx.reply('👍'))
// bot.command('/oldschool', (ctx) => ctx.reply('Hello'))
// bot.command('/modern', ({ reply }) => reply('Yo'))
// bot.command('/r', (ctx) => (
//     request('http://cyber.regi.rovno.ua/rozklad-zanyat/', function(error, response, body) {
//         var $ = cheerio.load(body);
//         var pdfLinks = [];
//         $('a.gde-link').each(function(i, elem) {
//             pdfLinks[i] = $(this).attr('href');
//         });
//         var res = pdfLinks.join('\n');
//         console.log(res)
//         return ctx.reply(res)
//     })
// ))

// bot.startPolling()
var scheduleUrl = 'http://cyber.regi.rovno.ua/rozklad-zanyat/';

bot.command('menu', ({ reply }) => {
    return reply('Custom buttons keyboard', Markup
        .keyboard([
            ['🔍 Список викладачів', '😎 Розклад'], // Row1 with 2 buttons
            ['☸ Список спеціальностей', '📞 Контакти'], // Row2 with 2 buttons
            ['📢 Группа', '⭐️ Оцініти', '👥 Поділитись'] // Row3 with 3 buttons
        ])
        .oneTime()
        .resize()
        .extra()
    )
})

bot.command('special', (ctx) => {
    return ctx.reply('Special buttons keyboard', Extra.markup((markup) => {
        return markup.resize()
            .keyboard([
                markup.contactRequestButton('Send contact'),
                markup.locationRequestButton('Send location')
            ])
    }))
})

bot.command('pyramid', (ctx) => {
    return ctx.reply('Keyboard wrap', Extra.markup(
        Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
            wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2
        })
    ))
})

bot.command('simple', (ctx) => {
    return ctx.replyWithHTML('<b>Coke</b> or <i>Pepsi?</i>', Extra.markup(
        Markup.keyboard(['Coke', 'Pepsi'])
    ))
})

bot.command('inline', (ctx) => {
    return ctx.reply('<b>Coke</b> or <i>Pepsi?</i>', Extra.HTML().markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('Test', 'test'),
            m.callbackButton('Test2', 'test2')
        ])))
})


bot.hears('🔍 Українська освіта', (ctx) => {
    request(scheduleUrl, function(error, response, body) {
        var $ = cheerio.load(body);
        var uaShedule = $('a.gde-link').eq(0).attr('href');
        return ctx.reply(uaShedule)
    });
})
bot.hears('😎 Європейська', (ctx) => {
    request(scheduleUrl, function(error, response, body) {
        var $ = cheerio.load(body);
        var euShedule = $('a.gde-link').eq(1).attr('href');
        return ctx.reply(euShedule)
    });
})
bot.hears('☸ Заочна', (ctx) => {
    request(scheduleUrl, function(error, response, body) {
        var $ = cheerio.load(body);
        var partTimeShedule = $('a.gde-link').eq(2).attr('href');
        return ctx.reply(partTimeShedule)
    });
})

bot.hears('😎 Розклад', (ctx) => {
    return ctx.reply('Який розклад Ви хочете отримати?', Markup
        .keyboard([
            ['🔍 Українська освіта', '😎 Європейська'], // Row1 with 2 buttons
            ['☸ Заочна'], // Row2 with 2 buttons
        ])
        .oneTime()
        .resize()
        .extra()
    )
})
bot.hears('📞 Контакти', (ctx) => {
    request(scheduleUrl, function(error, response, body) {
        var $ = cheerio.load(body);
        var contactText = $('.textwidget', '#text-6').text();
        return ctx.reply(contactText);
    });
})
bot.hears('📢 Группа', (ctx) => {
    return ctx.reply()
})
bot.on('message', (ctx) => {
    return ctx.reply('Хай! Щоб ввійти в меню введіть /menu');
})

bot.action(/.+/, (ctx) => {
    return ctx.answerCallbackQuery(`Oh, ${ctx.match[0]}! Great choise`)
})

bot.startPolling()