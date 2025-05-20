import { filterCourseOptions, getCompatibleSchedules } from "./core.js";
import { Course, CourseOptions, OptionSection, Schedule, StringDict } from "./models.js";
import { ScheduleTable } from "./scheduleTable.js";

export class CoursePicker {
    // public courseButtonsContainer: HTMLElement;
    public courseOptionData: CourseOptions[];
    public scheduleTable: ScheduleTable;
    public selectedFilters: StringDict = {};
    private filteredCourseOptions: CourseOptions[];

    constructor(courseOptionData: CourseOptions[], scheduleTable: ScheduleTable) {
        this.courseOptionData = courseOptionData;
        this.scheduleTable = scheduleTable;
        for (let courseOption of this.courseOptionData) {
            this.selectedFilters[courseOption.course.code] = null;
        }
        this.filteredCourseOptions = this.courseOptionData;
        // this.courseButtonsContainer = document.querySelector(".course-picker-container")!;
    }

    updateFilteredCourseOptions(): void {
        this.filteredCourseOptions = filterCourseOptions(this.courseOptionData, this.selectedFilters);
    }
    
    getCurrentCourseSchedules(): Schedule[] {
        return getCompatibleSchedules(this.filteredCourseOptions);
    }

    // initializeCoursePreview(): void {
    //
    // }

    generateCourseButtons(): void {
        const courseButtonsContainer = document.querySelector(".course-picker-container")!;
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
            toggleCourseCheckbox.addEventListener("click", function() {
                toggleCourseFunction(this, coursePickerObject);
            })

            courseOption.options.forEach(option => {
                const button = document.createElement("button");
                button.className = `option-button`;
                button.textContent = `${option.id}`;

                button.dataset.courseCode = courseDetails.code;
                button.dataset.optionNumber = option.id;
                button.disabled = true;

                const buttonClickFunction = this.selectCourseOption;
                const coursePickerObject = this;
                button.addEventListener("click", function() {
                    buttonClickFunction(this, coursePickerObject);
                });

                const buttonHoverFunction = this.showCoursePreview;
                button.addEventListener("mouseover", function() {
                    buttonHoverFunction(this, coursePickerObject);
                })
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

    selectCourseOption(button: HTMLButtonElement, coursePickerObject: CoursePicker): void {
        const courseCodeBtn = button.dataset.courseCode!;
        const optionNumberBtn = button.dataset.optionNumber!;
        const courseOptionData = coursePickerObject.courseOptionData;

        coursePickerObject.selectedFilters[courseCodeBtn] = [optionNumberBtn, optionNumberBtn];

        coursePickerObject.filteredCourseOptions = filterCourseOptions(courseOptionData, coursePickerObject.selectedFilters);

        coursePickerObject.disableAllButtons();

        // let currentCourseSchedules = coursePickerObject.getCurrentCourseSchedules();

        button.classList.add("selected-button");

        const courseOption = courseOptionData.find(courseOptions => {
            return courseOptions.course.code === courseCodeBtn;
        })!;
        const course = courseOption.course;
        const option = courseOption.options.find(option => option.id === optionNumberBtn)!;
        coursePickerObject.scheduleTable.addCourse(course, option);

        coursePickerObject.enableButtonsPerSchedule();
    }

    toggleCourse(checkbox: HTMLInputElement, coursePickerObject: CoursePicker): void {
        const courseCode = checkbox.dataset.courseCode!;
        const allOptionsGrid = document.querySelectorAll<HTMLElement>(".options-grid");
        // const courseOptionGrid = Array.from(allOptionsGrid).find(optGrid => optGrid.children[0].dataset.courseCode === courseCode);
        const courseOptionGrid = allOptionsGrid.values().find(x => x.dataset.courseCode === courseCode)!;
        coursePickerObject.disableAllButtons();

        if (checkbox.checked === true) {
            coursePickerObject.selectedFilters[courseCode] = null;
        } else {
            for (let optionButton of courseOptionGrid.children) {
                optionButton.classList.remove("selected-button");
            }
            coursePickerObject.selectedFilters[courseCode] = [-1, -1];
            coursePickerObject.scheduleTable.removeCourse(courseCode); 
        }
        coursePickerObject.filteredCourseOptions = filterCourseOptions(coursePickerObject.courseOptionData, coursePickerObject.selectedFilters);

        coursePickerObject.enableButtonsPerSchedule();
    }

    showCoursePreview(button: HTMLButtonElement, coursePickerObject: CoursePicker) {
        const courseCodeBtn = button.dataset.courseCode!;
        const optionNumberBtn = button.dataset.optionNumber!;
        const courseOptionData = coursePickerObject.courseOptionData;

        const courseOption = courseOptionData.find(courseOptions => {
            return courseOptions.course.code === courseCodeBtn;
        })!;

        const course = courseOption.course;
        const option = courseOption.options.find(option => option.id === optionNumberBtn)!;

        const timeTo12Hour = function(timeStr: string) {
            let hour: number | string = timeStr.split(":")[0];
            let minute = timeStr.split(":")[1];
            let suffix = "AM";
            if (parseInt(hour) > 12) {
                hour = parseInt(hour) - 12;
                suffix = "PM";
            }
            return `${hour}:${minute}${suffix}`
        }

        const previewHeading = document.querySelector(".preview-course-title")! as HTMLElement;
        previewHeading.innerText = `${course.code} - ${course.name}`;

        const table = document.querySelector(".preview-table")! as HTMLTableElement;

        while (table.rows.length > 1) {
            table.deleteRow(-1);
        }

        option.section.timeSlots.forEach(timeSlot => {
            const tableRow = table.insertRow(-1);
            const sectionCell = tableRow.insertCell(-1);
            const roomNumberCell = tableRow.insertCell(-1);
            const timingsCell = tableRow.insertCell(-1);
            sectionCell.innerText = `${timeSlot.sectionNumber}`;
            roomNumberCell.innerText = `${timeSlot.roomNumber}`;
            timingsCell.innerText = `${timeTo12Hour(timeSlot.start)} - ${timeTo12Hour(timeSlot.end)}`;
        })
    }

    clearCoursePreview() {
        const previewHeading = document.querySelector(".preview-course-title")! as HTMLElement;
        previewHeading.innerText = "";

        const table = document.querySelector(".preview-table")! as HTMLTableElement;

        while (table.rows.length > 1) {
            table.deleteRow(-1);
        }

    }

    enableButtonsPerSchedule(): void {
        const allButtons = document.querySelectorAll<HTMLButtonElement>(".option-button");
        let currentCourseSchedules = this.getCurrentCourseSchedules();

        currentCourseSchedules.forEach(schedule => {
            schedule.selections.entries().forEach(([course, option]) => {
                const courseCode = course.code;
                const optionNumber = option.id;
                for (let optionButton of allButtons) {
                    if (optionButton.dataset.courseCode === courseCode && optionButton.dataset.optionNumber === optionNumber) {
                        optionButton.disabled = false;
                    }
                }

            })
        })
    }

    disableAllButtons(): void {
        const allButtons = document.querySelectorAll<HTMLButtonElement>(".option-button");
        for (let optionButton of allButtons) {
            optionButton.disabled = true;
        }
    }

    clearAll(): void {
        for (const course in this.selectedFilters) {
            // if (!this.selectedFilters[course].equals([-1, -1]))
            if (this.selectedFilters[course] && !(this.selectedFilters[course][0] === -1 && this.selectedFilters[course][1] === -1))
                this.selectedFilters[course] = null;
        }

        const allButtons = document.querySelectorAll<HTMLButtonElement>(".option-button");
        for (let optionButton of allButtons) {
            optionButton.classList.remove("selected-button");
        }

        this.disableAllButtons();
        this.filteredCourseOptions = filterCourseOptions(this.courseOptionData, this.selectedFilters);
        this.enableButtonsPerSchedule();

        this.scheduleTable.clear();
        this.clearCoursePreview();
    }
}

