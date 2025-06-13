import { getAvailableCourseOptions } from "./core.js";
import { CoursePicker } from "./coursePicker.js";
import { ScheduleTable } from "./scheduleTable.js";
import { SettingsManager } from "./settingsManager.js";

let coursePicker: CoursePicker | undefined;
const settingsManager = new SettingsManager();
settingsManager.initSettings();

function initialize(): void {
    let scheduleTextInput = document.getElementById("scheduleTextInput")! as HTMLInputElement;

    const scheduleTable = ScheduleTable.getInstance();
    scheduleTable.clear();

    const allCourseOptions = getAvailableCourseOptions(scheduleTextInput.value);
    console.log(allCourseOptions);

    coursePicker = new CoursePicker(allCourseOptions, scheduleTable);
    coursePicker.generateCourseButtons();
    settingsManager.setCoursePicker(coursePicker);
}

function clearAll(): void {
    coursePicker?.clearAll();
}

const clearButton = document.getElementById("clearButton")!;
clearButton.addEventListener("click", clearAll);

const generateScheduleButton = document.getElementById("generateSchedule")!;
generateScheduleButton.addEventListener("click", initialize);

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

// window.addEventListener('beforeunload', function(e) {
//     e.preventDefault();
//     e.returnValue = true;
// });
