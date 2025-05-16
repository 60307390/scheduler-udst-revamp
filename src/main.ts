import { getAvailableCourseOptions, getCompatibleSchedules } from "./core";
import { CourseOptions, Schedule } from "./models";

let currentCourseSchedules: Schedule[];

function generateSchedule(courseOptions: CourseOptions[]): Schedule[] {
    const result = getCompatibleSchedules(courseOptions); 
    enableButtonsPerSchedule(result);
    return result;
}

function initialize(): void {
    const scheduleDiv = document.getElementById("scheduleContainer")! as HTMLInputElement;
    let scheduleTextInput = document.getElementById("scheduleTextInput")! as HTMLInputElement;

    
    const allCourseOptions = getAvailableCourseOptions(scheduleTextInput.value);

    clearScheduleTable();

    makeCourseButtons(allCourseOptions);

    currentCourseSchedules = generateSchedule(allCourseOptions);
}

function clear(): void {}

const clearButton = document.getElementById("clearButton")!;
clearButton.addEventListener("click", clear);

const generateScheduleButton = document.getElementById("generateSchedule")!;
generateScheduleButton.addEventListener("click", initialize);
