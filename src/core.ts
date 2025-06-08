import { LectureType, TimeSlot, Section, OptionSection, Course, CourseOptions, Schedule, StringDict } from "./models.js";

// DEPRECATED FUNCTIONS
//
// function cartesianProduct<T>(...allEntries: T[][]): T[][] {
//     return allEntries.reduce<T[][]>(
//         (results, entries) =>
//             results
//                 .map(result => entries.map(entry => [...result, entry]))
//                 .reduce((subResults, result) => [...subResults, ...result], []),
//         [[]]
//     )
// }
//
// export function getCompatibleSchedules(courseOptionList: Array<CourseOptions>): Array<Schedule> {
//     const courseList = courseOptionList.map((courseOption) => courseOption.course);
//     const allOptionsList = courseOptionList.map((courseOption) => courseOption.options);
//
//     const optionsCombinations = cartesianProduct(...allOptionsList);
//
//     let compatibleSchedules = [];
//     for (let optionComb of optionsCombinations) {
//         const scheduleMap = new Map();
//         courseList.forEach((course, i) => scheduleMap.set(course, optionComb[i]));
//         const schedule = new Schedule(scheduleMap);
//         if (!schedule.hasConflicts()) {
//             compatibleSchedules.push(schedule);
//         }
//     }
//     return compatibleSchedules;
// }

export function getCompatibleSchedules(courseOptionList: Array<CourseOptions>): Array<Schedule> {
    const courseList = courseOptionList.map(courseOption => courseOption.course);
    const allOptions = courseOptionList.map(courseOption => courseOption.options);

    const compatible: Schedule[] = [];

    function hasConflictWithSelection(option: OptionSection, otherOptions: OptionSection[]) {
        return otherOptions.some(otherOption => {
            const allTimeSlots = option.section.timeSlots.concat(otherOption.section.timeSlots);
            for (let i = 0; i < allTimeSlots.length; i++) {
                for (let j = i + 1; j < allTimeSlots.length; j++) {
                    if (allTimeSlots[i].overlapsWith(allTimeSlots[j])) {
                        return true;
                    }
                }
            }
            return false;
        });
    }

    // Recursive backtracking with conflict checking (basically optimized cartesian product)
    function generateCombinations(index: number, currentSelection: OptionSection[]) {
        if (index === courseList.length) {
            compatible.push(new Schedule(new Map(courseList.map((c, i) => [c, currentSelection[i]]))));
            return;
        }

        for (const option of allOptions[index]) {
            // Check conflict with already selected options
            if (!hasConflictWithSelection(option, currentSelection)) {
                generateCombinations(index + 1, [...currentSelection, option]);
            }
        }
    }

    generateCombinations(0, []);
    return compatible;
}

// export function filterCourseOptions(courseOptions: Array<CourseOptions>, optionFilter: StringDict): Array<CourseOptions> {
//     let filteredCourseOptions: Array<CourseOptions> = [];
//     courseOptions.forEach((courseOption) => {
//         const currentCourse = courseOption.course;
//         let optionRange = optionFilter[currentCourse.code];
//         let filteredOptions;
//         if (optionRange) {
//             // if optionRange exists, then filter
//             filteredOptions = courseOption.options.filter((option) => {
//                 return (parseInt(optionRange[0]) <= parseInt(option.id))
//                     && (parseInt(option.id) <= parseInt(optionRange[1]))
//             });
//         } else {
//             // Otherwise leave unfiltered
//             filteredOptions = courseOption.options;
//         }
//         if (filteredOptions.length !== 0) {
//             const filteredCourseOption = new CourseOptions(
//                 currentCourse,
//                 filteredOptions
//             );
//             filteredCourseOptions.push(filteredCourseOption);
//         }
//     });
//     return filteredCourseOptions;
// }

export function filterCourseOptions(courseOptions: Array<CourseOptions>, selectedOptions: StringDict, excludedOptions: Record<string, Set<Number>>): Array<CourseOptions> {
    let filteredCourseOptions: Array<CourseOptions> = [];
    courseOptions.forEach((courseOption) => {
        const currentCourse = courseOption.course;

        const filteredOptions: OptionSection[] = [];
        for (const option of courseOption.options) {
            if (selectedOptions[currentCourse.code] !== null && option.id === selectedOptions[currentCourse.code]) {
                filteredOptions.push(option);
                break;
            } else if (selectedOptions[currentCourse.code] === null && !(excludedOptions[currentCourse.code].has(parseInt(option.id)))) {
                filteredOptions.push(option);
            }
        }
        // console.log(filteredOptions);
        
        // courseOption.options.forEach(option => {
        //     if (selectedOptions[currentCourse.code] !== null && option.id === selectedOptions[currentCourse.code]) {
        //         filteredOptions.push(option);
        //     } else if (selectedOptions[currentCourse.code] === null && !(option.id in excludedOptions[currentCourse.code])) {
        //         console.log(currentCourse.code + option.id);
        //         filteredOptions.push(option);
        //     }
        // })

        if (filteredOptions.length !== 0) {
            const filteredCourseOption = new CourseOptions(
                currentCourse,
                filteredOptions
            );
            filteredCourseOptions.push(filteredCourseOption);
        }
    });
    return filteredCourseOptions;
}

function extractInstructors(optionBlock: string): string[] {
    const lines = optionBlock.split(/\r?\n/);
    const roomIndex = lines.findIndex(line => /\d{2}\.\d\.\d{2,}/.test(line));
    if (roomIndex === -1) return [];

    const instructorLines = [];
    for (let i = roomIndex + 2; i < lines.length; i++) {
        if (/Open Seats/.test(lines[i])) break;
        if (lines[i].trim()) instructorLines.push(lines[i].trim());
    }

    const names = instructorLines.flatMap(line =>  {
        return line.split(/(?<=[a-z])(?=[A-Z])/)
    });

    return names;
}

export function getAvailableCourseOptions(text: string): Array<CourseOptions> {
    const courseParts = text.split(/([A-Z]{4} \d{4})/);
    const courses: Array<CourseOptions> = [];

    for (let i = 1; i < courseParts.length; i += 2) {
        const courseCode = courseParts[i].trim();
        const content = (i + 1 < courseParts.length) ? courseParts[i + 1] : "";
        const courseName = content.split('\n')[1];

        const courseData = new CourseOptions(
            new Course(
                courseCode,
                courseName
            ),
            []
        )

        const optionBlocks = content.split(/(?=^\s*\d{1,2}\s*$)/m);

        for (const block of optionBlocks) {
            if (!block.trim())
                continue;
            try {
                const optionMatch = block.match(/^\s*(\d{1,2})\s*$/m);
                if (!optionMatch)
                    continue;
                const sectionNumbers = Array.from(block.matchAll(/Section\s+(\d+)/g)).map(m => m[1]);

                const optionData = new OptionSection(
                    optionMatch[1],
                    new Section(
                        sectionNumbers,
                        []
                    )
                )
                const dayRegex = /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/g;
                const timeRegex = /(\d{1,2}:\d{2}[AP]M\s+to\s+\d{1,2}:\d{2}[AP]M)/g;
                const dayMatches = Array.from(block.matchAll(dayRegex)).map(m => m[0]);
                const timeMatches = Array.from(block.matchAll(timeRegex)).map(m => m[0]);
                
                // EXPERIMENTAL
                const instructorNames = extractInstructors(block);

                const roomNumbers = Array.from(block.matchAll(/\d{2}\.\d{1}\.\d{2}/g)).map(m => m[0]);
                const lectureTypes = Array.from(block.matchAll(/Lecture|LecTheatre|Laboratory/g)).map(m => m[0]);

                let sectionIndex = 0;
                let prevStart: string | null = null;
                let prevEnd: string | null = null;
                let prevRoom: string = roomNumbers[0];

                // for (const [_, day, timing] of dayTimeMatches) {
                dayMatches.forEach((day, index) => {
                    const timing = timeMatches[index];
                    const [startStr, endStr] = timing.split(" to ").map(s => s.trim());
                    const parseTimeTo24 = (timeStr: string) => {
                        // const [time, suffix] = timeStr.split(/[AP]M/);
                        const time = timeStr.split(/[AP]M/)[0];
                        const suffix = timeStr.slice(-2);
                        let [hour, minutes] = time.split(":").map(Number);
                        if (suffix === "PM" && hour !== 12)
                            hour += 12;
                        if (suffix === "AM" && hour === 12)
                            hour = 0;

                        const hourStr = hour.toString().padStart(2, "0");
                        const minuteStr = minutes.toString().padStart(2, "0");

                        return `${hourStr}:${minuteStr}:00`;
                    };

                    const start = parseTimeTo24(startStr);
                    const end = parseTimeTo24(endStr);
                    const roomNumber = roomNumbers[index] || prevRoom || "";

                    if (prevStart && prevEnd) {
                        if (sectionIndex + 1 < lectureTypes.length && (start !== prevStart || end !== prevEnd || roomNumber !== prevRoom))
                            sectionIndex++;
                    }

                    prevStart = start;
                    prevEnd = end;
                    prevRoom = roomNumber;

                    const lectureType = lectureTypes[sectionIndex];
                    const sectionNumber = sectionNumbers[sectionIndex];

                    const instructor = instructorNames[index];

                    optionData.section.timeSlots.push(new TimeSlot(
                        day,
                        start,
                        end,
                        roomNumber,
                        LectureType[lectureType as keyof typeof LectureType],
                        sectionNumber,
                        instructor
                    ));
                })
                courseData.options.push(optionData);
            }
            catch (err) {
                console.error(`Error while processing: ${err}`);
                continue;
            }
        }
        courses.push(courseData);
    }

    return courses;
}
