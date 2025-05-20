import { filterCourseOptions, getCompatibleSchedules } from "./core.js";
import { state } from "./state.js";
export class CoursePicker {
    // public courseButtonsContainer: HTMLElement;
    courseOptionData;
    constructor(courseOptionData) {
        this.courseOptionData = courseOptionData;
        // this.courseButtonsContainer = document.querySelector(".course-picker-container")!;
    }
    generateCourseButtons() {
        const courseButtonsContainer = document.querySelector(".course-picker-container");
        courseButtonsContainer.innerHTML = "";
        this.courseOptionData.forEach(courseOption => {
            const courseDetails = courseOption.course;
            const courseDiv = document.createElement("div");
            courseDiv.className = "course-container";
            const titleDiv = document.createElement("div");
            titleDiv.className = "course-title-container";
            const title = document.createElement("p");
            title.className = "course-title";
            title.textContent = `${courseDetails.code} - ${courseDetails.name}`;
            const optionsGrid = document.createElement("div");
            optionsGrid.className = "options-grid";
            optionsGrid.dataset.courseCode = courseDetails.code;
            const toggleCourseCheckbox = document.createElement("input");
            toggleCourseCheckbox.setAttribute("type", "checkbox");
            toggleCourseCheckbox.dataset.courseCode = courseDetails.code;
            toggleCourseCheckbox.checked = true;
            const toggleCourseFunction = this.toggleCourse;
            const coursePickerObject = this;
            toggleCourseCheckbox.addEventListener("click", function () {
                toggleCourseFunction(this, coursePickerObject);
            });
            courseOption.options.forEach(option => {
                const button = document.createElement("button");
                button.className = `option-button`;
                button.textContent = `${option.id}`;
                button.dataset.courseCode = courseDetails.code;
                button.dataset.optionNumber = option.id;
                button.disabled = true;
                const buttonFunction = this.selectCourseOption;
                const coursePickerObject = this;
                button.addEventListener("click", function () {
                    buttonFunction(button, coursePickerObject);
                });
                // button.addEventListener("click", buttonFunction);
                optionsGrid.appendChild(button);
            });
            titleDiv.appendChild(toggleCourseCheckbox);
            titleDiv.appendChild(title);
            courseDiv.appendChild(titleDiv);
            courseDiv.appendChild(optionsGrid);
            courseButtonsContainer.appendChild(courseDiv);
        });
    }
    selectCourseOption(button, coursePickerObject) {
        const courseCodeBtn = button.dataset.courseCode;
        const optionNumberBtn = button.dataset.optionNumber;
        // TODO: FIX
        const courseOptionData = coursePickerObject.courseOptionData;
        const selectedFilters = state.filters;
        selectedFilters[courseCodeBtn] = [optionNumberBtn, optionNumberBtn];
        state.update(draft => {
            draft.selectedFilters = selectedFilters;
        });
        let filteredCourseOptions = filterCourseOptions(courseOptionData, selectedFilters);
        coursePickerObject.disableAllButtons();
        let currentCourseSchedules = getCompatibleSchedules(filteredCourseOptions);
        state.update(draft => {
            draft.currentCourseSchedules = currentCourseSchedules;
        });
        button.classList.add("selected-button");
        // TODO: Debug
        currentCourseSchedules.forEach(schedule => {
            const courseOptionToDisplay = schedule.selections.entries()
                .find(([course, option]) => courseCodeBtn === course.code && optionNumberBtn === option.id);
            if (courseOptionToDisplay) {
                let [course, option] = courseOptionToDisplay;
                state.scheduleTable?.addCourse(course, option);
            }
        });
        console.log(state.scheduleTable?.selectedSchedules);
        coursePickerObject.enableButtonsPerSchedule();
    }
    toggleCourse(checkbox, coursePickerObject) {
        const courseCode = checkbox.dataset.courseCode;
        const allOptionsGrid = document.querySelectorAll(".options-grid");
        // const courseOptionGrid = Array.from(allOptionsGrid).find(optGrid => optGrid.children[0].dataset.courseCode === courseCode);
        const courseOptionGrid = allOptionsGrid.values().find(x => x.dataset.courseCode === courseCode);
        coursePickerObject.disableAllButtons();
        if (checkbox.checked === true) {
            state.update(draft => {
                draft.selectedFilters[courseCode] = null;
            });
        }
        else {
            for (let optionButton of courseOptionGrid.children) {
                optionButton.classList.remove("selected-button");
            }
            state.update(draft => {
                draft.selectedFilters[courseCode] = [-1, -1];
            });
            state.scheduleTable?.removeCourse(courseCode);
        }
        const filteredCourseOptions = filterCourseOptions(state.allOptions, state.filters);
        state.update(draft => {
            draft.currentCourseSchedules = getCompatibleSchedules(filteredCourseOptions);
        });
    }
    enableButtonsPerSchedule() {
        // const courseOptionsGrid = document.querySelectorAll("options-grid");
        const allButtons = document.querySelectorAll(".option-button");
        let currentCourseSchedules = state.currentSchedules;
        currentCourseSchedules.forEach(schedule => {
            schedule.selections.entries().forEach(([course, option]) => {
                const courseCode = course.code;
                const optionNumber = option.id;
                for (let optionButton of allButtons) {
                    if (optionButton.dataset.courseCode === courseCode && optionButton.dataset.optionNumber === optionNumber) {
                        optionButton.disabled = false;
                    }
                }
            });
        });
    }
    disableAllButtons() {
        const allButtons = document.querySelectorAll(".option-button");
        for (let optionButton of allButtons) {
            optionButton.disabled = true;
        }
    }
}
