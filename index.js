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
     schedule = result;
});

const app = new Telegraf(token());
app.use(commandParts());
app.use(Telegraf.log());

app.command(config.commands.Start, ({from, reply}) => {
    console.log("start");
    return reply("Welcome!");
});

app.command(config.commands.Schedule, ({state: {command}, reply}) => {    
    console.log(command);
    var group = command.args.toLowerCase().replace("/\s+/", "");
    reply("Searching... " + group);
    try {
        var g = _(schedule).find(g => g.name.toLowerCase().replace("/\s+/", "") == group)
        console.log(g);
        if(!g) return reply("Group wasn't found");
        var lessons = "";
        for(var day in g.lessons) {
            console.log(day);        
            var groupLessons = g.lessons[day];
            lessons += day + ": \n";
            for(var i = 0; i < groupLessons.length; i ++) {
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

app.command(config.commands.Custom, ({ reply }) => {
    return reply('Custom buttons keyboard', Markup
        .keyboard([
            ['🔍 Search', '😎 Schedule'], // Row1 with 2 buttons
            ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
            ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
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
            m.callbackButton('Coke', 'Coke'),
            m.callbackButton('Pepsi', 'Pepsi')
        ])))
})

app.command(config.commands.Random, (ctx) => {
    return ctx.reply('random example',
        Markup.inlineKeyboard([
            Markup.callbackButton('Coke', 'Coke'),
            Markup.callbackButton('Dr Pepper', 'Dr Pepper', Math.random() > 0.5),
            Markup.callbackButton('Pepsi', 'Pepsi')
        ]).extra()
    )
})

app.hears('😎 Schedule', (ctx) => {
    request(config.urls.Schedule, function(error, response, body) {
        var $ = cheerio.load(body);
        var pdfLinks = [];
        $('a.gde-link').each(function(i, elem) {
            pdfLinks[i] = $(this).attr('href');
        });
        var res = pdfLinks.join('\n');
        console.log(res)
        return ctx.reply(res)
    });
});

app.on('message', (ctx) => {  
});

app.action('😎 Popular', (ctx, next) => {
    return ctx.reply('👍').then(next)
});

app.action(/.+/, (ctx) => {
    return ctx.answerCallbackQuery(`Oh, ${ctx.match[0]}! Great choise`)
});

app.startPolling();
