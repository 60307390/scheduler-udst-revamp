import { Course, LectureType, OptionSection, Schedule, Section } from "./models.js";

export class ScheduleTable {
    public selectedSchedules: Schedule;
    private static instance: ScheduleTable;

    constructor() {
        this.selectedSchedules = new Schedule();
        this.initializeTable();
    }

    // Singleton instance to ensure that only one table exists.
    public static getInstance(): ScheduleTable {
        if (!ScheduleTable.instance) {
            ScheduleTable.instance = new ScheduleTable();
        }
        return ScheduleTable.instance;
    }

    initializeTable(): void {
        const timeColumn = document.querySelector(".time-column")!;
        const template = document.getElementById("timeSlotTemplate")! as HTMLTemplateElement;

        const timeIntTo12Hour = function(hour: number, minute: number) {
            let hourStr = `${hour}`;
            let minuteStr = (minute >= 10) ? `${minute}` : `0${minute}`;
            let suffix = "AM";
            if (hour > 12) {
                hourStr = `${hour - 12}`;
                suffix = "PM";
            }
            return `${hourStr}:${minuteStr}${suffix}`
        };

        for (let hour = 8; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const row = document.createElement("div");
                row.className = "grid-row";

                const clone = template.content.cloneNode(true)! as HTMLElement;
                const timeSlot = clone.querySelector(".time-slot")!;
                const time = timeIntTo12Hour(hour, minute);
                timeSlot.textContent = time;
                timeColumn.appendChild(clone);
            }
        }
    }

    addCourse(course: Course, option: OptionSection): void {
        const section = option.section;
        const rowHeight = document.querySelector(".schedule-cell")!.getBoundingClientRect().height;
        console.log(rowHeight);

        let timeStrToInt = function(timeStr: string) {
            const hour = parseInt(timeStr.split(":")[0]);
            const minute = parseInt(timeStr.split(":")[1]);
            return hour + (minute / 60);
        }

        let timeTo12Hour = function(timeStr: string) {
            let hour: number | string = timeStr.split(":")[0];
            let minute = timeStr.split(":")[1];
            let suffix = "AM";
            if (parseInt(hour) > 12) {
                hour = parseInt(hour) - 12;
                suffix = "PM";
            }
            return `${hour}:${minute}${suffix}`
        }

        section.timeSlots.forEach(timeSlot => {
            const day = timeSlot.day;
            const startHour = timeStrToInt(timeSlot.start);
            const endHour = timeStrToInt(timeSlot.end);

            const lectureType = (timeSlot.lectureType === LectureType.LecTheatre) ?
                "LecThtr"
                : timeSlot.lectureType.valueOf().substring(0, 3);

            const durationHours = endHour - startHour;
            const dayColumn = document.querySelector(
                `.day-column[data-day=${day}]`
            )!;

            const topPos = 2 * (startHour - 8) * rowHeight;
            const height = 2 * durationHours * rowHeight;

            const classSlot = document.createElement("div");
            classSlot.className = "class-cell";
            classSlot.style.top = `${topPos}px`;
            classSlot.style.height = `${height}px`;

            const className = document.createElement("p");
            className.textContent = `${course.code} - ${timeSlot.sectionNumber}`
            className.className = "class-name";
            const classLectureType = document.createElement("p");
            classLectureType.textContent = `${lectureType}`
            classLectureType.className = "class-lecture-type";
            const classTime = document.createElement("p");
            classTime.textContent = `${timeTo12Hour(timeSlot.start)} - ${timeTo12Hour(timeSlot.end)}`;
            classTime.className = "class-time";
            const classDetails = document.createElement("p");
            classDetails.textContent = `Room: ${timeSlot.roomNumber}`;
            classDetails.className = "class-details";

            classSlot.appendChild(className);
            classSlot.appendChild(classLectureType);
            classSlot.appendChild(classTime);
            classSlot.appendChild(classDetails);

            dayColumn.appendChild(classSlot);
        });

        this.selectedSchedules.addCourse(course, option);
    }


    removeCourse(courseCode: string): void {
        const selecetedScheduleEntries = this.selectedSchedules.selections.entries();
        const selectedCourse = selecetedScheduleEntries.find( ([course, _]) => course.code === courseCode);

        if (!selectedCourse) 
            return;

        this.selectedSchedules.selections.delete(selectedCourse[0]);

        const dayColumns = document.querySelectorAll(".day-column");
        for (let dayColumn of dayColumns) {
            for (let i = 0; i < dayColumn.childElementCount; i++) {
                const classCell = dayColumn.children[i];
                const classCellName = classCell.querySelector(".class-name")!;
                if (classCellName.textContent!.startsWith(courseCode)) {
                    classCell.remove();
                    i -= 1;
                }
            }
            // for (let classCell of dayColumn.children) {
            //     const classCellName = classCell.querySelector(".class-name")!;
            //     if (classCellName.textContent!.startsWith(courseCode)) {
                // let currentClassCell = classCell as HTMLElement;
                // if (currentClassCell.innerText!.startsWith(courseCode)) {
                //     classCell.remove();
                // }
            // }
        }
    }

    clear(): void {
        this.selectedSchedules.selections.clear();
        const dayColumns = document.querySelectorAll(".day-column");
            for (let i = 0; i < dayColumns.length; i++) {
                dayColumns[i].innerHTML = "";
            }
    }

}
