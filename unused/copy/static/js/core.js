import { LectureType, TimeSlot, Section, OptionSection, Course, CourseOptions, Schedule } from "./models.js";
function cartesianProduct(...allEntries) {
    return allEntries.reduce((results, entries) => results
        .map(result => entries.map(entry => [...result, entry]))
        .reduce((subResults, result) => [...subResults, ...result], []), [[]]);
}
export function getCompatibleSchedules(courseOptionList) {
    const courseList = courseOptionList.map((courseOption) => courseOption.course);
    const allOptionsList = courseOptionList.map((courseOption) => courseOption.options);
    const optionsCombinations = cartesianProduct(...allOptionsList);
    let compatibleSchedules = [];
    for (let optionComb of optionsCombinations) {
        const scheduleMap = new Map();
        courseList.forEach((course, i) => scheduleMap.set(course, optionComb[i]));
        const schedule = new Schedule(scheduleMap);
        if (!schedule.hasConflicts()) {
            compatibleSchedules.push(schedule);
        }
    }
    return compatibleSchedules;
}
export function filterCourseOptions(courseOptions, optionFilter) {
    let filteredCourseOptions = [];
    courseOptions.forEach((courseOption) => {
        const currentCourse = courseOption.course;
        let optionRange = optionFilter[currentCourse.code];
        let filteredOptions;
        if (optionRange) {
            // if optionRange exists, then filter
            optionRange = optionRange.map(parseInt);
            filteredOptions = courseOption.options.filter((option) => optionRange[0] <= parseInt(option.id) <= optionRange[1]);
        }
        else {
            // Otherwise leave unfiltered
            filteredOptions = courseOption.options;
        }
        const filteredCourseOption = new CourseOptions(currentCourse, filteredOptions);
        filteredCourseOptions.push(filteredCourseOption);
    });
    return filteredCourseOptions;
}
export function getAvailableCourseOptions(text) {
    const courseParts = text.split(/([A-Z]{4} \d{4})/);
    const courses = [];
    for (let i = 1; i < courseParts.length; i += 2) {
        const courseCode = courseParts[i].trim();
        const content = (i + 1 < courseParts.length) ? courseParts[i + 1] : "";
        const courseName = content.split('\n')[1];
        const courseData = new CourseOptions(new Course(courseCode, courseName), []);
        const optionBlocks = content.split(/(?=^\s*\d{1,2}\s*$)/m);
        for (const block of optionBlocks) {
            if (!block.trim())
                continue;
            try {
                const optionMatch = block.match(/^\s*(\d{1,2})\s*$/m);
                if (!optionMatch)
                    continue;
                const sectionNumbers = Array.from(block.matchAll(/Section\s+(\d+)/g)).map(m => m[1]);
                const optionData = new OptionSection(optionMatch[1], new Section(sectionNumbers, []));
                const timeRegex = /(?:^|\n)(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\n(\d{1,2}:\d{2}[AP]M\s+to\s+\d{1,2}:\d{2}[AP]M)/g;
                const dayTimeMatches = Array.from(block.matchAll(timeRegex));
                const roomNumbers = Array.from(block.matchAll(/\d{2}\.\d{1}\.\d{2}/g)).map(m => m[0]);
                const lectureTypes = Array.from(block.matchAll(/Lecture|LecTheatre|Laboratory/g)).map(m => m[0]);
                let sectionIndex = 0;
                let prevStart = null;
                let prevEnd = null;
                let prevRoom = roomNumbers[0];
                // for (const [_, day, timing] of dayTimeMatches) {
                dayTimeMatches.forEach((match, index) => {
                    const [_, day, timing] = match;
                    const [startStr, endStr] = timing.split(" to ").map(s => s.trim());
                    const parseTimeTo24 = (timeStr) => {
                        const [time, suffix] = timeStr.split(/[AP]M/);
                        let [hour, minutes] = time.split(":").map(parseInt);
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
                    optionData.section.timeSlots.push(new TimeSlot(day, start, end, roomNumber, LectureType[lectureType], sectionNumber));
                });
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
