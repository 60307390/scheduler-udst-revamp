import { CourseOptions, Schedule, StringDict } from "./models.js"
import { ScheduleTable } from "./scheduleTable.js";
import { CoursePicker } from "./coursePicker.js";

type AppState = {
    currentCourseSchedules: Schedule[],
    allCourseOptions: CourseOptions[];
    selectedFilters: StringDict;
    coursePicker?: CoursePicker;
    scheduleTable?: ScheduleTable;
}

let _state: AppState = {
    currentCourseSchedules: [],
    allCourseOptions: [],
    selectedFilters: {}
};

export const state = {
    get currentSchedules(): Schedule[] { return [..._state.currentCourseSchedules]; },
    get allOptions(): CourseOptions[] { return structuredClone(_state.allCourseOptions); },
    get filters(): StringDict { return { ..._state.selectedFilters }; },
    
    get coursePicker(): CoursePicker | undefined {
        return _state.coursePicker;
    },

    get scheduleTable(): ScheduleTable | undefined {
        return _state.scheduleTable;
    },

    update: (updater: (draft: AppState) => void) => {
        const draft = structuredClone(_state); // Create mutable draft
        updater(draft);
        _state = draft; // Commit changes
    },

    reset: () => {
        // if (_state.courseButtons)
        //     _state.courseButtons.disableAllButtons();
        // if (_state.scheduleTable)
        //     _state.scheduleTable.clear();
        _state = {
            currentCourseSchedules: [],
            allCourseOptions: [],
            selectedFilters: {},
            coursePicker: undefined,
            scheduleTable: undefined
        };
    }
};
