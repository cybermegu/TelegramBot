"use strict";
const xlsx = require("node-xlsx");
const xlsx1 = require("xlsx");
const excelParser = require("excel-parser");
const _ = require("lodash");
class Lesson {
    constructor(name, room, teacher, dateTime) {
        this.name = name;
        this.room = room;
        this.teacher = teacher;
        this.dateTime = dateTime;
    }
}
class Group {
    constructor(name, lessons) {
        this.name = name;
        this.lessons = lessons;
    }
}
class ExcelScheduleParser {
    parse(data) {
        var doc = xlsx1.readFile(data);
        var first_sheet_name = doc.SheetNames[0];
        var worksheet = doc.Sheets[first_sheet_name];
        var result = [];
        console.log(worksheet["I11"], worksheet["B11"]);
        ExcelScheduleParser.GroupCells.forEach(element => {
            result.push(this.parseGroupLessons(worksheet, element));
        });
        return result;
    }
    static colName(n) {
        var ordA = 'a'.charCodeAt(0);
        var ordZ = 'z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
        var s = "";
        while (n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s.toUpperCase();
    }
    static getLessonDate(worksheet, groupId, val, day, range) {
        var hourIndex = Math.floor((val - range[0]) / range[0]) + 1;
        var dateString = worksheet[ExcelScheduleParser.DayToDateCell[day]].v;
        //console.log(dateString);
        var nums = dateString.split(" ")[1].split(".");
        var hour = (ExcelScheduleParser.HourIndexToLessonHour[hourIndex] || [0, 0]);
        //console.log(hour, hourIndex, val);
        return new Date(parseInt(nums[2]), parseInt(nums[1]), parseInt(nums[0]), hour[0], hour[1]);
    }
    static getColNumber(col) {
        if (!col)
            throw new Error(`getColNumber - invalid argument passed '${col}'`);
        col = col.toLowerCase();
        var ordA = 'a'.charCodeAt(0);
        var ordZ = 'z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
        var f = col.charCodeAt(0);
        if (col.length < 2)
            return f - ordA;
        var s = col.charCodeAt(1);
        return len + this.getColNumber(col[1]);
    }
    /**
     * Parse lesson name.
     * @param worksheet
     * @param groupId
     * @param val
     */
    parseLessonName(worksheet, groupId, val) {
        var lessonCell = groupId + val;
        var lessonCellVal = worksheet[lessonCell];
        if (!lessonCellVal) {
            // Get previous col number.
            var prevCol = ExcelScheduleParser.colName(ExcelScheduleParser.getColNumber(groupId) - 1);
            // If cell belongs to two groups then original cell value is "undefined"
            // So if it's the case return value for left cell.            
            // If previous column is not the time then its just empty column that belongs to both groups,
            // so we gotta use previous.            
            if (!worksheet[prevCol + val] || !worksheet[prevCol + val].w) {
                var left = ExcelScheduleParser.CellToLeftCell[groupId];
                if (!left)
                    return "--- No Lesson ---";
                return this.parseLessonName(worksheet, left, val);
            }
        }
        return !lessonCellVal ? "--- No Lesson ---" : lessonCellVal.v;
    }
    parseLessonTeacher(worksheet, groupId, val) {
        var teacherCell = worksheet[groupId + (val + 2)];
        return !teacherCell ? "" : teacherCell.v;
    }
    parseLessonNumber(worksheet, groupId, val) {
        var i = val;
        var next = true;
        var colName = groupId;
        var colNumber = ExcelScheduleParser.getColNumber(colName);
        while (i < val + 15 && next) {
            var nextCol = ExcelScheduleParser.colName(colNumber + 1);
            var colAddr = nextCol + val;
            var col = worksheet[colAddr];
            if (col && col.t == "n" && col.v > 1) {
                return col.v;
            }
            colNumber++;
            i++;
        }
        return -1;
    }
    parseLesson(worksheet, groupId, val, range, day) {
        //console.log(val);
        return new Lesson(this.parseLessonName(worksheet, groupId, val), this.parseLessonNumber(worksheet, groupId, val), this.parseLessonTeacher(worksheet, groupId, val), ExcelScheduleParser.getLessonDate(worksheet, groupId, val, day, range));
    }
    parseDay(worksheet, groupId, range, day) {
        var result = [];
        range.forEach(val => {
            result.push(this.parseLesson(worksheet, groupId, val, range, day));
        });
        return result;
    }
    parseGroupLessons(worksheet, groupId) {
        var groupNameId = groupId + "6";
        var group = new Group(worksheet[groupNameId].v, {});
        for (var day = 0; day < 5; day++) {
            var key = Object.keys(ExcelScheduleParser.DayRange)[day];
            var range = ExcelScheduleParser.DayRange[key];
            group.lessons[key] = this.parseDay(worksheet, groupId, range, day + 1);
        }
        return group;
    }
    parseCourses(data) {
        var defer = new Promise((resolve, reject) => {
            try {
                resolve(this.parse(data));
            }
            catch (e) {
                reject(e);
            }
        });
        return defer;
    }
}
ExcelScheduleParser.NameToNumberLetter = {};
ExcelScheduleParser.CellToLeftCell = {
    "Z": "S",
    "J": "C",
    "AP": "AI",
    "BF": "AY",
    "BV": "BO",
};
ExcelScheduleParser.DaysCells = ["A8", "A21", "A34", "A47", "A60"];
ExcelScheduleParser.GroupCells = ["C", "J", "S", "Z", "AI", "AP", "AY", "BF", "BO", "BV", "CE"];
ExcelScheduleParser.DayRange = {
    "Monday": [8, 11, 14, 17],
    "Tuesday": [21, 24, 27, 30],
    "Wednesday": [34, 37, 40, 43],
    "Thursday": [47, 50, 53, 56],
    "Friday": [60, 63, 66, 69],
};
ExcelScheduleParser.DayToDateCell = {
    1: "A8",
    2: "A21",
    3: "A34",
    4: "A47",
    5: "A60"
};
ExcelScheduleParser.HourIndexToLessonHour = {
    1: [8, 30],
    2: [10, 0],
    3: [11, 30],
    4: [13, 0]
};
exports.ExcelScheduleParser = ExcelScheduleParser;
