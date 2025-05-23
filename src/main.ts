import { getAvailableCourseOptions } from "./core.js";
import { CoursePicker } from "./coursePicker.js";
import { ScheduleTable } from "./scheduleTable.js";

// TODO:
// Come up with some way to avoid the global variables
//
// let currentCourseSchedules: Schedule[];
// let allCourseOptions: CourseOptions[];
// let selectedFilters: StringDict = {};
// let courseButtons: CoursePicker;
// let selectedCourseSchedules: Schedule = new Schedule();

// TODO
// Fix

let courseButtons: CoursePicker | undefined;

function initialize(): void {
    let scheduleTextInput = document.getElementById("scheduleTextInput")! as HTMLInputElement;

    const scheduleTable = ScheduleTable.getInstance();

    const allCourseOptions = getAvailableCourseOptions(scheduleTextInput.value);

    console.log(allCourseOptions);

    scheduleTable.clear();

    // const courseButtons = new CoursePicker(allCourseOptions, scheduleTable); (Try to avoid globals)
    courseButtons = new CoursePicker(allCourseOptions, scheduleTable);

    if (courseButtons) {
        courseButtons.generateCourseButtons();
        courseButtons.enableButtonsPerSchedule();
    }

}

function clearAll(): void {
    if (courseButtons) {
        courseButtons.clearAll();
    }
}

const clearButton = document.getElementById("clearButton")!;
clearButton.addEventListener("click", clearAll);

const generateScheduleButton = document.getElementById("generateSchedule")!;
generateScheduleButton.addEventListener("click", initialize);
// export { CoursePicker as CourseButtons };

const exampleDataButton = document.getElementById("exampleData")!;
exampleDataButton.addEventListener("click", function() {
    const textFile = "testSchedules.txt";
    const scheduleTextInput = document.getElementById("scheduleTextInput")! as HTMLInputElement;
    fetch(textFile)
        .then(r => r.text())
        .then(text => {
            scheduleTextInput.value = text;
        })
});

