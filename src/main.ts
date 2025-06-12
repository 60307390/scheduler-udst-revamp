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

// const toggleAdvancedCheckbox = document.getElementById("toggleAdvancedMode")! as HTMLInputElement;
// toggleAdvancedCheckbox.addEventListener("click", function() {
//     const advancedModeDisplayItems: NodeListOf<HTMLElement> = document.querySelectorAll(".adv-mode-exclusive");
//     Settings.advancedMode = this.checked;
//     if (this.checked) {
//         for (let element of advancedModeDisplayItems) {
//             element.classList.remove("hidden");
//         }
//     } else {
//         for (let element of advancedModeDisplayItems) {
//             element.classList.add("hidden");
//         }
//     }
//     courseButtons?.refreshButtons();
// })
//
// const showProfessors = document.getElementById("showProfessors")! as HTMLInputElement;
// showProfessors.addEventListener("click", function() {
//     const profPreviewDisplayItems: NodeListOf<HTMLElement> = document.querySelectorAll(".prof-preview-exclusive");
//     Settings.showProfessors = this.checked;
//     if (this.checked) {
//         for (let element of profPreviewDisplayItems)
//             element.classList.remove("hidden");
//     } else {
//         for (let element of profPreviewDisplayItems)
//             element.classList.add("hidden");
//     }
// })
//
// const toggleHardConflictClick = document.getElementById("toggleHardConflictClick")! as HTMLInputElement;
// toggleHardConflictClick.addEventListener("click", function() {
//     Settings.hardConflictClickable = this.checked;
//     courseButtons?.refreshButtons();
// })
//
// window.addEventListener('beforeunload', function(e) {
//     e.preventDefault();
//     e.returnValue = true;
// });
