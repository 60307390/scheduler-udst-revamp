import { getAvailableCourseOptions, getCompatibleSchedules, filterCourseOptions } from "./core.js";
import { CoursePicker } from "./coursePicker.js";
// import { CourseOptions, Schedule, StringDict } from "./models";
import { ScheduleTable } from "./scheduleTable.js";
import { state } from "./state.js";
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
function initialize() {
    let scheduleTextInput = document.getElementById("scheduleTextInput");
    const scheduleTable = new ScheduleTable();
    const allCourseOptions = getAvailableCourseOptions(scheduleTextInput.value);
    console.log(allCourseOptions);
    const currentCourseSchedules = getCompatibleSchedules(allCourseOptions);
    scheduleTable.clear();
    const courseButtons = new CoursePicker(allCourseOptions);
    const filters = {};
    for (let courseOption of allCourseOptions) {
        filters[courseOption.course.code] = null;
    }
    state.update(draft => {
        draft.allCourseOptions = allCourseOptions;
        draft.currentCourseSchedules = currentCourseSchedules;
        draft.scheduleTable = scheduleTable;
        draft.coursePicker = courseButtons;
    });
    state.coursePicker?.generateCourseButtons();
    state.coursePicker?.enableButtonsPerSchedule();
    // state.update(draft => {
    //     draft.courseButtons!.enableButtonsPerSchedule();
    // })
}
function clearAll() {
    const filters = state.filters;
    for (const course in filters) {
        if (filters[course] !== -1)
            filters[course] = null;
    }
    const filteredCourseOptions = filterCourseOptions(state.allOptions, filters);
    state.update(draft => {
        draft.selectedFilters = filters;
        draft.currentCourseSchedules = getCompatibleSchedules(filteredCourseOptions);
    });
}
const clearButton = document.getElementById("clearButton");
clearButton.addEventListener("click", clearAll);
const generateScheduleButton = document.getElementById("generateSchedule");
generateScheduleButton.addEventListener("click", initialize);
// export { CoursePicker as CourseButtons };
const exampleDataButton = document.getElementById("exampleData");
exampleDataButton.addEventListener("click", function () {
    const textFile = "testSchedules.txt";
    const scheduleTextInput = document.getElementById("scheduleTextInput");
    fetch(textFile)
        .then(r => r.text())
        .then(text => {
        scheduleTextInput.value = text;
    });
});
