const Telegraf = require('telegraf');
const { reply, Extra, Markup } = Telegraf;
const request = require('request');
const cheerio = require('cheerio');

var _ = require('lodash');
const commandParts = require('telegraf-command-parts');

// Get bot token from command line args.
// TODO: Maybe pass via envinronment?
const token = () => process.argv[2];
const config = require("./config").config;
const ScheduleParser = require("./ScheduleParser").ExcelScheduleParser;
const fs = require('fs');

var parser = new ScheduleParser();
// TODO: Add file download from the server.
var groups = parser.parseCourses(`${__dirname}/schedule.xlsx`);
var schedule;
groups.then((result) => {
    console.log("Parsed groups. Count: ", result.length);
    schedule = result;
});

const app = new Telegraf(token());
app.use(commandParts());
app.use(Telegraf.log());

app.command(config.commands.Start, ({ from, reply }) => {
    console.log("start");
    return reply("Welcome!");
});

app.command(config.commands.Schedule, ({ state: { command }, reply }) => {
    var group = command.args.toLowerCase().replace("/\s+/", "");
    reply("Searching... " + group);
    try {
        var g = _(schedule).find(g => {
            return g.name.toLowerCase().replace("/\s+/", "") == group
        });

        if (!g) return reply("Group wasn't found");
        var lessons = "";
        for (var day in g.lessons) {
            console.log(day);
            var groupLessons = g.lessons[day];
            lessons += day + ": \n";
            for (var i = 0; i < groupLessons.length; i++) {
                var l = groupLessons[i];
                lessons += `${l.name} - ${l.teacher} - Аудиторія: ${l.room}\n`;
            }
            lessons += "---------------------------\n"
        }

        console.log(lessons);
        return reply((lessons || "Not found").toString());
    } catch (e) {
        return reply(e.message);
    }
});

app.command(config.commands.OneTime, ({ reply }) =>
    reply('One time keyboard', Markup
        .keyboard(['/simple', '/inline', '/pyramid'])
        .oneTime()
        .resize()
        .extra()
    )
)

app.command(config.commands.Menu, ({ reply }) => {
    return reply('Головне меню', Markup
        .keyboard([
            ['🔍 Список викладачів', '📅 Розклад'], // Row1 with 2 buttons
            ['🎓 Спеціальності', '📞 Контакти'], // Row2 with 2 buttons
            ['📢 Група'] // Row3 with 3 buttons
        ])
        .oneTime()
        .resize()
        .extra()
    )
})

app.command('special', (ctx) => {
    return ctx.reply('Special buttons keyboard', Extra.markup((markup) => {
        return markup.resize()
            .keyboard([
                markup.contactRequestButton('Send contact'),
                markup.locationRequestButton('Send location')
            ])
    }))
})

app.command(config.commands.Pyramid, (ctx) => {
    return ctx.reply('Keyboard wrap', Extra.markup(
        Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
            wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2
        })
    ))
})

app.command(config.commands.Simple, (ctx) => {
    return ctx.replyWithHTML('<b>Coke</b> or <i>Pepsi?</i>', Extra.markup(
        Markup.keyboard(['Coke', 'Pepsi'])
    ))
})

app.command('inline', (ctx) => {
    return ctx.reply('<b>Coke</b> or <i>Pepsi?</i>', Extra.HTML().markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('Test', 'test'),
            m.callbackButton('Test2', 'test2')
        ])))
})

app.hears('Українська освіта', (ctx) => {
    request(config.urls.Schedule, function(error, response, body) {
        var $ = cheerio.load(body);
        var uaShedule = $('a.gde-link').eq(0).attr('href');
        return ctx.reply(uaShedule)
    });
})
app.hears('Європейська', (ctx) => {
    request(config.urls.Schedule, function(error, response, body) {
        var $ = cheerio.load(body);
        var euShedule = $('a.gde-link').eq(1).attr('href');
        return ctx.reply(euShedule);
    });
})
app.hears('Заочна', (ctx) => {
    request(config.urls.Schedule, function(error, response, body) {
        var $ = cheerio.load(body);
        var partTimeShedule = $('a.gde-link').eq(2).attr('href');
        return ctx.reply(partTimeShedule);
    });
})

app.hears('📅 Розклад', (ctx) => {
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
app.hears('📞 Контакти', (ctx) => {
    request(config.urls.Schedule, function(error, response, body) {
        var $ = cheerio.load(body);
        var contactText = $('.textwidget', '#text-6').text();
        return ctx.reply(contactText);
    });
})
app.hears('📢 Група', (ctx) => {
    return ctx.reply('Наша група в телеграмі @cybermegu')
})
app.on('message', (ctx) => {
    return ctx.reply('Хай! Щоб ввійти в меню введіть /menu');
})

app.action(/.+/, (ctx) => {
    return ctx.answerCallbackQuery(`Oh, ${ctx.match[0]}! Great choise`)
});

app.startPolling();