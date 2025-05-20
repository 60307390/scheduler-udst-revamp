export var LectureType;
(function (LectureType) {
    LectureType["LECTURE"] = "Lecture";
    LectureType["LEC_THEATRE"] = "LecTheatre";
    LectureType["LABORATORY"] = "Laboratory";
})(LectureType || (LectureType = {}));
export class TimeSlot {
    day;
    start;
    end;
    roomNumber;
    lectureType;
    sectionNumber;
    constructor(day, start, end, roomNumber, lectureType, sectionNumber) {
        this.day = day;
        this.start = start;
        this.end = end;
        this.roomNumber = roomNumber;
        this.lectureType = lectureType;
        this.sectionNumber = sectionNumber;
    }
    toDict() {
        return {
            "day": this.day,
            "start": this.start,
            "end": this.end,
            "roomNumber": this.roomNumber,
            "lectureType": this.lectureType.valueOf(),
            "sectionNumber": this.sectionNumber,
        };
    }
    static fromDict(data) {
        let day = data.day;
        let start = data.start;
        let end = data.end;
        let roomNumber = data.roomNumber;
        let lectureType = data.lectureType;
        let sectionNumber = data.sectionNumber;
        return new TimeSlot(day, start, end, roomNumber, LectureType[lectureType], sectionNumber);
    }
    overlapsWith(other) {
        return (this.day === other.day) && !(this.start >= other.end || this.end <= other.start);
    }
}
export class Section {
    numbers;
    timeSlots;
    constructor(numbers, timeSlots) {
        this.numbers = numbers;
        this.timeSlots = timeSlots;
    }
    toDict() {
        return {
            "numbers": this.numbers,
            "timeSlots": this.timeSlots.map((timeSlot) => timeSlot.toDict())
        };
    }
    static fromDict(data) {
        return new Section(data["numbers"], data["timeSlots"].map((timeSlot) => TimeSlot.fromDict(timeSlot)));
    }
}
export class OptionSection {
    id;
    section;
    constructor(id, section) {
        this.id = id;
        this.section = section;
    }
    toDict() {
        return {
            "id": this.id,
            "section": this.section.toDict()
        };
    }
    static fromDict(data) {
        return new OptionSection(data["id"], Section.fromDict(data["section"]));
    }
}
export class Course {
    code;
    name;
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
    toDict() {
        return {
            "code": this.code,
            "name": this.name
        };
    }
    static fromDict(data) {
        return new Course(data["code"], data["name"]);
    }
}
export class CourseOptions {
    course;
    options;
    constructor(course, options) {
        this.course = course;
        this.options = options;
    }
    toDict() {
        return {
            "course": this.course.toDict(),
            "options": this.options.map((option) => option.toDict())
        };
    }
    static fromDict(data) {
        return new CourseOptions(Course.fromDict(data["course"]), data["options"].map((option) => OptionSection.fromDict(option)));
    }
}
export class Schedule {
    selections;
    constructor(selections = new Map) {
        this.selections = selections;
    }
    addCourse(course, option) {
        if (this.selections.has(course)) {
            throw new Error(`Course ${course.code} already in schedule`);
        }
        this.selections.set(course, option);
    }
    hasConflicts() {
        const allTimeSlots = Array.from(this.selections.values()).flatMap(option => option.section.timeSlots);
        for (let i = 0; i < allTimeSlots.length; i++) {
            for (let j = i + 1; j < allTimeSlots.length; j++) {
                if (allTimeSlots[i].overlapsWith(allTimeSlots[j]))
                    return true;
            }
        }
        return false;
    }
    toDict() {
        return {
            "selections": Array.from(this.selections).map(([course, option]) => ({
                "course": course.toDict(),
                "option": option.toDict()
            }))
        };
    }
}
