const xlsx = require("node-xlsx");
const xlsx1 = require("xlsx");
const excelParser = require("excel-parser");

class Lesson {
    constructor(public name: string, public room: number, public teacher: string) {
        this.name = name;
        this.room = room;
        this.teacher = teacher;
    }
}

class Group {
    constructor(public name: string, public lessons: { [day: string]: Lesson[]}) {
        this.name = name;
        this.lessons = lessons;
    }
}

interface IScheduleParser {
    parseCourses(data: any) : Promise<Group[]>;
}

class ExcelScheduleParser implements IScheduleParser {

    parse( data: any) : Group[] {
        var doc = xlsx1.readFile(data);
        var first_sheet_name = doc.SheetNames[0];        
        var worksheet = doc.Sheets[first_sheet_name];
        var result : Group[] = [];
        
        ExcelScheduleParser.GroupCells.forEach(element => {                 
            result.push(this.parseGroupLessons(worksheet, element));
        });

        return result;
    }

    private static NameToNumberLetter : {[c : string] : string } = {

    };

    private static DaysCells = ["A8", "A21", "A34", "A47", "A60"];
    private static GroupCells = ["C", "J", "S", "Z", "AI", "AP", "AY", "BF", "BO", "BV", "CE"];
    private static DayRange : { [day: string]: number[] } = {
        "Monday": [8, 11, 14, 17],
        "Tuesday": [21, 24, 27, 30],
        "Wednesday": [34, 37, 40, 43],
        "Thursday": [47, 50, 53, 56],
        "Friday": [60, 63, 66, 69],
    };

    static colName(n: number) : string {
        var ordA = 'a'.charCodeAt(0);
        var ordZ = 'z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
      
        var s = "";
        while(n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s.toUpperCase();
    }

    static getColNumber(col: string) : number {
        col = col.toLowerCase();
        var ordA = 'a'.charCodeAt(0);
        var ordZ = 'z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
        var f = col.charCodeAt(0);
        if(col.length < 2) return f - ordA;
        var s = col.charCodeAt(1);       

        return len + this.getColNumber(col[1]);
    }

    parseLessonName(worksheet: any, groupId: string, val: number) : string {
        var lessonCell = groupId + val;
        var lessonCellVal = worksheet[lessonCell];

        return !lessonCellVal ? "--- No Lesson ---" : lessonCellVal.v;
    }

    parseLessonTeacher(worksheet: any, groupId : string, val: number) : string {
        var teacherCell = worksheet[groupId + (val + 2)];

        return !teacherCell ? "" : teacherCell.v;
    }

    parseLessonNumber(worksheet: any, groupId: string, val: number) : number {
        var i = val;
        var next : boolean = true;
        var colName = groupId;
        var colNumber = ExcelScheduleParser.getColNumber(colName); 
        
        while( i < val + 15 && next)  {
            var nextCol = ExcelScheduleParser.colName(colNumber + 1);
            var colAddr= nextCol + val;
            var col = worksheet[colAddr];
            if(col && col.t == "n" && col.v > 1) {
                console.log("Found number for " + groupId + val, col.v);
                return col.v;
            }
            colNumber ++;
            i ++;
        }

        return -1;
    }

    parseLesson(worksheet: any, groupId: string, val: number) : Lesson {
        return new Lesson(
            this.parseLessonName(worksheet, groupId, val),
            this.parseLessonNumber(worksheet, groupId, val),
            this.parseLessonTeacher(worksheet, groupId, val)
        );
    }

    parseDay(worksheet: any, groupId: string, range: number[]) : Lesson[] {
        var result : Lesson[] = [];
        range.forEach(val => { 
            result.push(this.parseLesson(worksheet, groupId, val));            
        });

        return result;
    }    

    parseGroupLessons(worksheet: any, groupId: string) : Group {        
        var groupNameId = groupId + "6";
        var group = new Group(worksheet[groupNameId].v, {});
        console.log("Processing ", group.name);
        for(var day = 0; day < 5; day ++) {
            var key = Object.keys(ExcelScheduleParser.DayRange)[day];
            var range = ExcelScheduleParser.DayRange[key];
            group.lessons[key] = this.parseDay(worksheet, groupId, range);
        }

        return group;        
    }

    parseCourses(data: any) : Promise<Group[]> {
        var defer = new Promise<Group[]>((resolve, reject) => {
            try {
                resolve(this.parse(data));
            } catch(e) {
                reject(e);
            }
        });      
              
        return defer;
    }
}

exports.ExcelScheduleParser = ExcelScheduleParser;