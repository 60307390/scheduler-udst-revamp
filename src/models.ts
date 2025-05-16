export enum LectureType {
    LECTURE = "Lecture",
    LEC_THEATRE = "LecTheatre",
    LABORATORY = "Laboratory"
}

export type StringDict = Record<string, any>;

export class TimeSlot {
    constructor(
        public day: string,
        public start: string,
        public end: string,
        public roomNumber: string,
        public lectureType: LectureType,
        public sectionNumber: string
    ) { }

    toDict(): object {
        return {
            "day": this.day,
            "start": this.start,
            "end": this.end,
            "roomNumber": this.roomNumber,
            "lectureType": this.lectureType.valueOf(),
            "sectionNumber": this.sectionNumber,
        }
    }

    static fromDict(data: StringDict): TimeSlot {
        let day = data.day;
        let start = data.start;
        let end = data.end;
        let roomNumber = data.roomNumber;
        let lectureType = data.lectureType;
        let sectionNumber = data.sectionNumber;
        return new TimeSlot(
            day,
            start,
            end,
            roomNumber,
            LectureType[lectureType as keyof typeof LectureType],
            sectionNumber
        );
    }

    overlapsWith(other: TimeSlot): boolean {
        return (this.day === other.day) && !(this.start >= other.end || this.end <= other.start);
    }
}

export class Section {
    constructor(
        public numbers: Array<String>,
        public timeSlots: Array<TimeSlot>
    ) { }

    toDict(): StringDict {
        return {
            "numbers": this.numbers,
            "timeSlots": this.timeSlots.map((timeSlot) => timeSlot.toDict())
        };
    }

    static fromDict(data: StringDict): Section {
        return new Section(
            data["numbers"],
            data["timeSlots"].map((timeSlot: StringDict) => TimeSlot.fromDict(timeSlot))
        );
    }

}

export class OptionSection {
    constructor(
        public id: string,
        public section: Section
    ) { }

    toDict() {
        return {
            "id": this.id,
            "section": this.section.toDict()
        }
    }

    static fromDict(data: StringDict): OptionSection {
        return new OptionSection(
            data["id"],
            Section.fromDict(data["section"])
        )
    }
}

export class Course {
    constructor(
        public code: string,
        public name: string
    ) { }

    toDict() {
        return {
            "code": this.code,
            "name": this.name
        }
    }

    static fromDict(data: StringDict): Course {
        return new Course(
            data["code"],
            data["name"]
        )
    }
}

export class CourseOptions {
    constructor(
        public course: Course,
        public options: Array<OptionSection>
    ) { }

    toDict() {
        return {
            "course": this.course.toDict(),
            "options": this.options.map((option: OptionSection) => option.toDict())
        };
    }

    static fromDict(data: StringDict): CourseOptions {
        return new CourseOptions(
            Course.fromDict(data["course"]),
            data["options"].map((option: StringDict) => OptionSection.fromDict(option))
        )
    }
}

export class Schedule {
    constructor(
        public selections: Map<Course, OptionSection>
    ) { }

    addCourse(course: Course, option: OptionSection): void {
        if (this.selections.has(course)) {
            throw new Error(`Course ${course.code} already in schedule`);
        }
        this.selections.set(course, option);
    }

    hasConflicts(): boolean {
        const allTimeSlots = Array.from(this.selections.values()).flatMap(option => option.section.timeSlots);
        for (let i = 0; i < allTimeSlots.length; i++) {
            for (let j = i + 1; j < allTimeSlots.length; j++) {
                if (allTimeSlots[i].overlapsWith(allTimeSlots[j]))
                    return true;
            }
        }
        return false;
    }

    toDict(): StringDict {
        return {
            "selections": Array.from(this.selections).map(([course, option]) => (
                {
                    "course": course.toDict(),
                    "option": option.toDict()
                }
            ))
        };
    }
}
