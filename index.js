const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const cheerio = require('cheerio');
var _ = require('lodash');
const Telegraf = require('telegraf');
const commandParts = require('telegraf-command-parts');
const token = '461140243:AAHs1yfaN6Vu5wKO5K2Sz_BAAq3QnFWVPOU';
const config = require("./config").config;
const ScheduleParser = require("./ScheduleParser").ExcelScheduleParser;
const fs = require('fs');

var parser = new ScheduleParser();
var groups = parser.parseCourses(`${__dirname}/schedule.xlsx`);
var schedule;
groups.then((result) => {
    console.log("Groups", schedule = result);
});


const app = new Telegraf(token);
app.use(commandParts());

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
                lessons += `${l.name} ${l.teacher} ${l.room}\n`;
            }
            lessons += "---------------------------\n"
        }
        
        console.log(lessons);
        return reply((lessons || "Not found").toString());
    } catch (e) {
        return reply(e.message);
    }    
});

app.hears('hi', (ctx) => ctx.reply('Hey there!'))
app.on('sticker', (ctx) => ctx.reply('👍'));
app.startPolling();
