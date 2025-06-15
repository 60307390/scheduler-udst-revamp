import { ConflictGraph, filterCourseOptions, getCompatibleSchedules, getConflictsFromCourseOptions, getNodeLookup } from "./core.js";
import { CourseOptionNode, CourseOptions, Schedule, StringDict } from "./models.js";
import { ScheduleTable } from "./scheduleTable.js";
import { Settings } from "./settingsManager.js";

// !!! IMPORTANT
// Note for all future developers who see this code (including myself)
// Don't panic. Yes, this is a mess.
// Yes, it will be cleaned up. But not now.
//
// "Nothing is more permanent than a temporary solution"

type ButtonState =
    | "available-button"
    | "selected-button"
    | "excluded-button"
    | "conflict-highlight-button"
    | "soft-conflict-button"
    | "hard-conflict-button";

const buttonStates: ButtonState[] = [
    "available-button",
    "selected-button",
    "excluded-button",
    "conflict-highlight-button",
    "soft-conflict-button",
    "hard-conflict-button"
];

type Key = string;

export class CoursePicker {
    // TODO: Encapsulation & State Management
    public courseOptionData: CourseOptions[];
    public scheduleTable: ScheduleTable;
    public selectedOptions: StringDict = {};
    public excludedOptions: Record<string, Set<Number>> = {};
    private filteredCourseOptions: CourseOptions[];

    public conflictGraph: ConflictGraph = new Map<string, Set<Key>>();
    public nodeLookUp: Map<Key, CourseOptionNode>;

    public selectedKeys: Set<Key> = new Set<Key>();
    public hardConflictKeys: Set<Key> = new Set<Key>();

    private buttonCache = new Map<Key, HTMLButtonElement>();

    // private advancedMode: boolean = false;

    constructor(courseOptionData: CourseOptions[], scheduleTable: ScheduleTable) {
        this.courseOptionData = courseOptionData;
        this.scheduleTable = scheduleTable;
        for (let courseOption of this.courseOptionData) {
            this.selectedOptions[courseOption.course.code] = null;
            this.excludedOptions[courseOption.course.code] = new Set();
        }
        this.filteredCourseOptions = this.courseOptionData;
        this.conflictGraph = getConflictsFromCourseOptions(this.courseOptionData);
        this.nodeLookUp = getNodeLookup(this.courseOptionData);
    }

    // updateFilteredCourseOptions(): void {
    //     this.filteredCourseOptions = filterCourseOptions(this.courseOptionData, this.selectedOptions, this.excludedOptions);
    // }

    getCurrentCourseSchedules(): Schedule[] {
        return getCompatibleSchedules(this.filteredCourseOptions);
    }

    generateCourseButtons(): void {
        const courseButtonsContainer = document.querySelector(".course-picker-container")!;
        courseButtonsContainer.innerHTML = "<p class=\"course-picker-title inner-title\">Select Courses</p>";

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
                button.className = `option-button button-font`;
                button.textContent = `${option.id}`;

                button.dataset.courseCode = courseDetails.code;
                button.dataset.optionNumber = option.id;
                // button.disabled = true;

                const leftClickFunction = this.selectCourseOption;
                const coursePickerObject = this;
                button.addEventListener("click", function() {
                    leftClickFunction(this, coursePickerObject);
                });

                // EXPERIMENTAL
                // TODO: Refine exclusion feature
                // On second thought, this is overengineering?
                // const rightClickFunction = this.excludeCourseOption;
                button.addEventListener("contextmenu", (event) => {
                    event.preventDefault();
                    // rightClickFunction(event.currentTarget! as HTMLButtonElement, coursePickerObject);
                })

                const hoverFunction = this.onButtonHover;
                button.addEventListener("mouseover", function() {
                    hoverFunction(this, coursePickerObject);
                })

                const hoverOutFunction = this.onButtonHoverOut;
                button.addEventListener("mouseout", () => {
                    hoverOutFunction(button, coursePickerObject);
                });

                optionsGrid.appendChild(button);

                this.buttonCache.set(`${courseDetails.code}-${option.id}`, button);
            });

            titleDiv.appendChild(toggleCourseCheckbox);
            titleDiv.appendChild(title);
            courseDiv.appendChild(titleDiv);
            courseDiv.appendChild(optionsGrid);
            courseButtonsContainer.appendChild(courseDiv);
        });
        this.refreshButtons();
    }

    selectCourseOption(button: HTMLButtonElement, coursePickerObject: CoursePicker): void {
        const courseCodeBtn = button.dataset.courseCode!;
        const optionNumberBtn = button.dataset.optionNumber!;
        const courseOptionData = coursePickerObject.courseOptionData;

        // TODO: Generalize and rework this
        if (button.classList.contains("selected-button")) {
            button.classList.remove("selected-button");
            coursePickerObject.selectedOptions[courseCodeBtn] = null;
            coursePickerObject.filteredCourseOptions = filterCourseOptions(courseOptionData, coursePickerObject.selectedOptions, coursePickerObject.excludedOptions);
            coursePickerObject.scheduleTable.removeCourse(courseCodeBtn);

            coursePickerObject.selectedKeys.delete(`${courseCodeBtn}-${optionNumberBtn}`);
            coursePickerObject.refreshButtons();

            // Don't need refreshButtons() after this for now
            const conflictingKeys = coursePickerObject.conflictGraph.get(`${courseCodeBtn}-${optionNumberBtn}`);
            if (!conflictingKeys)
                return;
            for (let key of conflictingKeys) {
                coursePickerObject.hardConflictKeys.delete(key);
            }
            return;
        }

        const style = window.getComputedStyle(document.body);

        // TODO: Redesign if want exclusion feature
        coursePickerObject.selectedOptions[courseCodeBtn] = optionNumberBtn;

        coursePickerObject.filteredCourseOptions = filterCourseOptions(courseOptionData, coursePickerObject.selectedOptions, coursePickerObject.excludedOptions);

        button.classList.add("selected-button");

        const MAX_COLORS = 6;

        const courseOption = courseOptionData.find(courseOptions => {
            return courseOptions.course.code === courseCodeBtn;
        })!;
        const course = courseOption.course;
        const option = courseOption.options.find(option => option.id === optionNumberBtn)!;
        const courseIndex = courseOptionData.findIndex((courseOption) => courseOption.course.code === courseCodeBtn);
        const color = style.getPropertyValue(`--cell-color-${courseIndex % MAX_COLORS + 1}`);
        coursePickerObject.scheduleTable.addCourse(course, option, color);

        coursePickerObject.selectedKeys.add(`${course.code}-${option.id}`);
        coursePickerObject.refreshButtons();

        // Don't need refreshButtons() after this for now
        const conflictingCourseKeys = coursePickerObject.conflictGraph.get(`${course.code}-${option.id}`);
        if (!conflictingCourseKeys)
            return;
        for (let key of conflictingCourseKeys.keys()) {
            coursePickerObject.hardConflictKeys.add(key);
        }

    }

    excludeCourseOption(button: HTMLButtonElement, coursePickerObject: CoursePicker): void {
        const courseCodeBtn = button.dataset.courseCode!;
        const optionNumberBtn = button.dataset.optionNumber!;
        const courseOptionData = coursePickerObject.courseOptionData;

        if (coursePickerObject.selectedOptions[courseCodeBtn] === optionNumberBtn)
            return;

        coursePickerObject.excludedOptions[courseCodeBtn].add(parseInt(optionNumberBtn));
        button.classList.add("excluded-button");

        coursePickerObject.filteredCourseOptions = filterCourseOptions(courseOptionData, coursePickerObject.selectedOptions, coursePickerObject.excludedOptions);
        coursePickerObject.refreshButtons();
    }

    toggleCourse(checkbox: HTMLInputElement, coursePickerObject: CoursePicker): void {
        const courseCode = checkbox.dataset.courseCode!;
        const allOptionsGrid = document.querySelectorAll<HTMLElement>(".options-grid");
        const courseOptionGrid = Array.from(allOptionsGrid.values()).find((x: HTMLElement) => x.dataset.courseCode === courseCode)!;

        if (checkbox.checked === true) {
            coursePickerObject.selectedOptions[courseCode] = null;
        } else {
            for (let optionButton of courseOptionGrid.children) {
                optionButton.classList.remove("selected-button", "available-button");
            }
            const optionNumber = coursePickerObject.selectedOptions[courseCode];
            coursePickerObject.selectedOptions[courseCode] = -1;
            coursePickerObject.scheduleTable.removeCourse(courseCode);
            coursePickerObject.selectedKeys.delete(`${courseCode}-${optionNumber}`);
        }
        coursePickerObject.filteredCourseOptions = filterCourseOptions(coursePickerObject.courseOptionData, coursePickerObject.selectedOptions, coursePickerObject.excludedOptions);

        coursePickerObject.refreshButtons();
    }

    onButtonHover(button: HTMLButtonElement, coursePickerObject: CoursePicker): void {
        coursePickerObject.showCoursePreview(button, coursePickerObject);
        if (!Settings.advancedMode) {
            return;
        }

        // Highlight potential hard conflicts
        const courseCodeBtn = button.dataset.courseCode!;
        const optionNumberBtn = button.dataset.optionNumber!;

        const conflictingCourseKeys = coursePickerObject.conflictGraph.get(`${courseCodeBtn}-${optionNumberBtn}`);
        if (!conflictingCourseKeys)
            return;
        for (let key of conflictingCourseKeys) {
            const button = coursePickerObject.buttonCache.get(key)!;
            if (!button.classList.contains("selected-button"))
                button.classList.add("conflict-highlight-button");
        }
    }

    onButtonHoverOut(button: HTMLButtonElement, coursePickerObject: CoursePicker): void {
        if (!Settings.advancedMode)
            return;
        // Disable hover effect
        const courseCodeBtn = button.dataset.courseCode!;
        const optionNumberBtn = button.dataset.optionNumber!;

        const conflictingCourseKeys = coursePickerObject.conflictGraph.get(`${courseCodeBtn}-${optionNumberBtn}`);
        if (!conflictingCourseKeys)
            return;
        for (let key of conflictingCourseKeys) {
            const button = coursePickerObject.buttonCache.get(key)!;
            button.classList.remove("conflict-highlight-button");
        }
    }

    showCoursePreview(button: HTMLButtonElement, coursePickerObject: CoursePicker): void {
        const courseCodeBtn = button.dataset.courseCode!;
        const optionNumberBtn = button.dataset.optionNumber!;
        const courseOptionData = coursePickerObject.courseOptionData;

        const courseOption = courseOptionData.find(courseOptions => {
            return courseOptions.course.code === courseCodeBtn;
        })!;

        const course = courseOption.course;
        const option = courseOption.options.find(option => option.id === optionNumberBtn)!;

        // see utils.ts
        const timeTo12Hour = function(timeStr: string) {
            let hour: number = parseInt(timeStr.split(":")[0]);
            let minute = timeStr.split(":")[1];
            let suffix = "AM";
            if (hour > 12) {
                hour -= 12;
                suffix = "PM";
            } else if (hour == 12) {
                suffix = "PM";
            }
            return `${hour}:${minute}${suffix}`;
        }

        const previewHeading = document.querySelector(".preview-course-title")! as HTMLElement;
        previewHeading.innerText = `${course.code} - ${course.name} - Option ${option.id}`;

        const table = document.querySelector(".preview-table")! as HTMLTableElement;

        while (table.rows.length > 1) {
            table.deleteRow(-1);
        }

        const MAX_NAME_LENGTH = 15;

        option.section.timeSlots.forEach(timeSlot => {
            const tableRow = table.insertRow(-1);

            const sectionCell = tableRow.insertCell(-1);
            const roomNumberCell = tableRow.insertCell(-1);
            const lectureTypeCell = tableRow.insertCell(-1);
            const dayCell = tableRow.insertCell(-1);
            const timingsCell = tableRow.insertCell(-1);


            sectionCell.className = "preview-section";
            roomNumberCell.className = "preview-room-number";
            lectureTypeCell.className = "preview-lecture-type";
            dayCell.className = "preview-day";
            timingsCell.className = "preview-timings";

            sectionCell.innerText = `${timeSlot.sectionNumber}`;
            roomNumberCell.innerText = `${timeSlot.roomNumber}`;
            lectureTypeCell.innerText = `${timeSlot.lectureType.valueOf()}`
            dayCell.innerText = `${timeSlot.day.substring(0, 3)}`
            timingsCell.innerText = `${timeTo12Hour(timeSlot.start)} - ${timeTo12Hour(timeSlot.end)}`;

            if (!Settings.showProfessors)
                return;

            // EXPERIMENTAL -- Instructor Name Preview
            const instructorsCell = tableRow.insertCell(-1);
            instructorsCell.className = "preview-instructor";
            if (timeSlot.instructor.length > MAX_NAME_LENGTH) {
                const splitName = timeSlot.instructor.split(' ');
                instructorsCell.innerText = splitName[0];
                if (splitName.length > 1)
                    instructorsCell.innerText += " " + splitName[1];
                instructorsCell.innerText += " ...";
            } else {
                instructorsCell.innerText = timeSlot.instructor;
            }
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
        let currentCourseSchedules = this.getCurrentCourseSchedules();

        currentCourseSchedules.forEach(schedule => {
            Array.from(schedule.selections.entries()).forEach(([course, option]) => {
                const key = `${course.code}-${option.id}`;
                const button = this.buttonCache.get(key)!;
                if (!button.classList.contains("selected-button")) {
                    button.classList.remove(...buttonStates);
                    button.disabled = false;
                }
            })
        })
    }

    disableAllButtons(): void {
        const allButtons = document.querySelectorAll<HTMLButtonElement>(".option-button");
        for (let optionButton of allButtons) {
            if (!optionButton.classList.contains("selected-button")) {
                optionButton.classList.remove(...buttonStates);
                optionButton.classList.add("excluded-button");
                optionButton.disabled = true;
            }
        }
    }

    // EXPERIMENTAL
    refreshButtons(): void {
        if (!Settings.advancedMode) {
            this.disableAllButtons();
            this.enableButtonsPerSchedule();
            return;
        }
        // Similar to disableAllButtons
        // Declare all buttons as soft conflict
        const allButtons = document.querySelectorAll<HTMLButtonElement>(".option-button");
        for (let button of allButtons) {
            const courseCodeBtn = button.dataset.courseCode!;
            // const optionNoBtn = button.dataset.optionNumber!;
            if (this.selectedOptions[courseCodeBtn] === -1) {
                button.disabled = true;
                button.classList.add("excluded-button");
            }
            else if (!button.classList.contains("selected-button")) {
                if (this.selectedOptions[courseCodeBtn] !== null) {
                    button.disabled = true;
                    button.classList.add("excluded-button");
                } else {
                    button.disabled = false;
                    button.classList.remove(...buttonStates);
                    button.classList.add("soft-conflict-button");
                }
            }
        }
        
        // Restore all hard conflicts
        // Look at all selected options, and mark all their conflicting options as hard conflicts
        // TODO: Do you really need selectedKeys? Can use selectedOptions?
        this.selectedKeys.forEach(key => {
            const confCourseOptions = this.conflictGraph.get(key);
            if (!confCourseOptions)
                return;
            for (let confKey of confCourseOptions.keys()) {
                const button = this.buttonCache.get(confKey)!;
                button.classList.add("hard-conflict-button");
                button.disabled = !Settings.hardConflictClickable;
            }
        })

        // Similar to enableButtons
        // Declare all options in compatible schedules as 'available'
        let currentCourseSchedules = this.getCurrentCourseSchedules();
        currentCourseSchedules.forEach(schedule => {
            Array.from(schedule.selections.entries()).forEach(([course, option]) => {
                const key = `${course.code}-${option.id}`;
                const button = this.buttonCache.get(key)!;
                if (!button.classList.contains("selected-button") && !button.classList.contains("excluded-button")) {
                    button.classList.remove("soft-conflict-button");
                    button.classList.add("available-button");
                }
            })
        })

    }

    clearAll(): void {
        for (const course in this.selectedOptions) {
            if (this.selectedOptions[course] && this.selectedOptions[course] !== -1) {
                this.selectedOptions[course] = null;
            }
            this.excludedOptions[course].clear();
        }
        this.selectedKeys.clear();

        const allButtons = document.querySelectorAll<HTMLButtonElement>(".option-button");
        for (let optionButton of allButtons) {
            optionButton.classList.remove("selected-button", "excluded-button");
        }

        this.filteredCourseOptions = filterCourseOptions(this.courseOptionData, this.selectedOptions, this.excludedOptions);
        this.refreshButtons();

        this.scheduleTable.clear();
        this.clearCoursePreview();
    }
}

