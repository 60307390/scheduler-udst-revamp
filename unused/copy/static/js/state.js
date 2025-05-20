let _state = {
    currentCourseSchedules: [],
    allCourseOptions: [],
    selectedFilters: {}
};
export const state = {
    get currentSchedules() { return [..._state.currentCourseSchedules]; },
    get allOptions() { return structuredClone(_state.allCourseOptions); },
    get filters() { return { ..._state.selectedFilters }; },
    get coursePicker() {
        return _state.coursePicker;
    },
    get scheduleTable() {
        return _state.scheduleTable;
    },
    update: (updater) => {
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
