export {};
// Globally-defined variables
// let allCourseOptions = {};
// let selectedFilters = {};
// let filteredCourseOptions = {};
// let selectedCourseSchedules = {"selections" : []};
// let currentCourseSchedules = {};

// TODO:
//! FIX LOGIC OF THE CODE ASAP
// In Future:
// Refactor to TypeScript
// Feature to save schedules to a list of schedules.
// Feature so that hovering over the button will both:
//     Display the option/section details in a box on the right
//     (Somehow) mark the other buttons where this option conflicts with the other option of other classes
//     OR Come up with a query system
// DONE:
// Clicking on it will display the schedules in the tabular view.
// Checkbox depending on which course should be considered for calculations

// function filterCourseOption(selectedFilters) {
//     let newCourseOptions = {"course_options" : []};
//     allCourseOptions.course_options.forEach(courseOption => {
//         newCourseObj = {};
//         currentCourse = courseOption.course;
//         optionFilter = selectedFilters[currentCourse.code];
//         filteredOptions = courseOption.options.filter(opt => optionFilter === null || opt.id == optionFilter);
//         if (filteredOptions.length !== 0) {
//             newCourseObj.course = currentCourse;
//             newCourseObj.options = filteredOptions;
//             newCourseOptions.course_options.push(newCourseObj);
//         }
//     });
//     return newCourseOptions;
// }
//
// function removeCourseFromTable(courseCode) {
//     const dayColumns = document.getElementsByClassName("day-column");
//     for (let dayColumn of dayColumns) {
//         for (let classCell of dayColumn.children) {
//             const classCellName = classCell.querySelector(".class-name");
//             if (classCellName.textContent.startsWith(courseCode)) {
//                 classCell.remove();
//             }
//         }
//     }
// }
//
// function addCourseToTable(course, section) {
//     const grid = document.querySelector(".schedule-grid-container");
//     const rowHeight = document.querySelector(".schedule-cell").getBoundingClientRect().height;
//     console.log(rowHeight);
//
//     let timeStrToInt = function(timeStr) {
//         const hour = parseInt(timeStr.split(":")[0]);
//         const minute = parseInt(timeStr.split(":")[1]); 
//         return hour + (minute / 60);
//     }
//
//     let timeTo12Hour = function(timeStr) {
//         let hour = timeStr.split(":")[0];
//         let minute = timeStr.split(":")[1]; 
//         let suffix = "AM";
//         if (parseInt(hour) > 12) {
//             hour = parseInt(hour) - 12;
//             suffix = "PM";
//         }
//         return `${hour}:${minute}${suffix}`
//     }
//
//     section.time_slots.forEach(timeSlot => {
//         const day = timeSlot.day;
//         const startHour = timeStrToInt(timeSlot.start);
//         const endHour = timeStrToInt(timeSlot.end);
//         let lectureType = timeSlot.lecture_type;
//         if (lectureType == "LecTheatre")
//             lectureType  = "LecThtr";
//         else
//             lectureType = lectureType.substr(0, 3);
//
//         const durationHours = endHour - startHour;
//         const dayColumn = document.querySelector(
//             `.day-column[data-day=${day}]`
//         );
//
//         const topPos = 2 * (startHour - 8) * rowHeight;
//         const height = 2 * durationHours * rowHeight;
//
//         const classSlot = document.createElement("div");
//         classSlot.className = "class-cell";
//         classSlot.style.top = `${topPos}px`;
//         classSlot.style.height = `${height}px`;
//         const className = document.createElement("p");
//         className.textContent = `${course.code} - ${timeSlot.section_number}`
//         className.className = "class-name";
//         const classLectureType = document.createElement("p");
//         classLectureType.textContent = `${lectureType}`
//         classLectureType.className = "class-lecture-type";
//         const classTime = document.createElement("p");
//         classTime.textContent = `${timeTo12Hour(timeSlot.start)} - ${timeTo12Hour(timeSlot.end)}`;
//         classTime.className = "class-time";
//         const classDetails = document.createElement("p");
//         classDetails.textContent = `Room: ${timeSlot.room_number}`;
//         classDetails.className = "class-details";
//         classSlot.appendChild(className);
//         classSlot.appendChild(classLectureType);
//         classSlot.appendChild(classTime);
//         classSlot.appendChild(classDetails);
//
//         dayColumn.appendChild(classSlot);
//     });
// }
//
// function updateScheduleTable() {
//     selectedCourseSchedules.selections.forEach(selection => {
//         const course = selection.course;
//         const section = selection.option.section;
//         addCourseToTable(course, section);
//     });
// }
//
// function clearScheduleTable() {
//     const dayColumns = document.getElementsByClassName("day-column");
//     for (let i = 0; i < dayColumns.length; i++) {
//         dayColumns[i].innerHTML = "";
//     }
// }
//
// function generateSchedule(courseOptions) {
//     fetch("http://localhost:5000/api/generate", {
//         method: "POST",
//         body: JSON.stringify(courseOptions),
//         headers: {
//         "Content-type": "application/json; charset=UTF-8",
//         "Access-Control-Allow-Origin": "*"
//         }
//     }).then(response => {
//         if (!response.ok) {
//             console.log(response);
//             throw new Error("Network Error");
//         };
//         return response.json();
//     }).then(data => {
//         // const scheduleDisplayText = document.getElementById("scheduleDisplayTextTest");
//         // scheduleDisplayText.innerText = JSON.stringify(data);
//         currentCourseSchedules = data;
//         enableButtonsPerSchedule();
//     }); 
// }

// function clear() {
//     for (const course in selectedFilters) {
//         if (selectedFilters[course] !== -1)
//             selectedFilters[course] = null;
//     }
//
//     filteredCourseOptions = filterCourseOption(selectedFilters);
//     generateSchedule(filteredCourseOptions);
//
//     disableAllButtons();
//
//     const courseOptionsGrid = document.getElementsByClassName("options-grid");
//     for (let courseOptionRow of courseOptionsGrid) {
//         for (let optionButton of courseOptionRow.children) {
//             optionButton.classList.remove("selected-button");
//         }
//     } 
//
//     enableButtonsPerSchedule();
//
//     selectedCourseSchedules.selections = [];
//
//     clearScheduleTable();
// }
//
// function selectCourse(buttonElem) {
//     const courseCodeBtn = buttonElem.dataset.courseCode;
//     const optionNumberBtn = buttonElem.dataset.optionNumber;
//     selectedFilters[courseCodeBtn] = optionNumberBtn;
//
//     filteredCourseOptions = filterCourseOption(selectedFilters);
//
//     disableAllButtons();
//
//     generateSchedule(filteredCourseOptions);
//
//     buttonElem.classList.add("selected-button");
//
//     let selectionToDisplay;
//
//     currentCourseSchedules.schedules.forEach(schedule => {
//         schedule.selections.forEach(selection => {
//             const courseCode = selection.course.code;
//             const optionNumber = selection.option.id;
//             if (courseCodeBtn === courseCode && optionNumberBtn === optionNumber) {
//                 selectedCourseSchedules.selections.push(selection);
//                 selectionToDisplay = selection;
//                 return;
//             }
//         })
//     });
//
//     start_time = Date.now();
//
//     addCourseToTable(selectionToDisplay.course, selectionToDisplay.option.section)
//
//     end_time = Date.now();
//
//     // console.log("Time elapsed " + (end_time - start_time)/1000 + "s")
// }
//
// function disableAllButtons() {
//     const courseOptionsGrid = document.getElementsByClassName("options-grid");
//     for (let courseOptionRow of courseOptionsGrid) {
//         for (let optionButton of courseOptionRow.children) {
//             optionButton.disabled = true;
//         }
//     }
// }
//
// function enableButtonsPerSchedule() {
//     const courseOptionsGrid = document.getElementsByClassName("options-grid");
//     currentCourseSchedules.schedules.forEach(schedule => {
//         schedule.selections.forEach(selection => {
//             const courseCode = selection.course.code;
//             const optionNumber = selection.option.id;
//             for (let courseOptionRow of courseOptionsGrid) {
//                 for (let optionButton of courseOptionRow.children) {
//                     if (optionButton.dataset.courseCode === courseCode && optionButton.dataset.optionNumber === optionNumber) {
//                         optionButton.disabled = false;
//                     }
//                 }
//             }
//
//         })
//     })
// }
//
// function toggleCourse(checkbox) {
//     const courseCode = checkbox.dataset.courseCode;
//     const allOptionsGrid = document.getElementsByClassName("options-grid");
//     const courseOptionGrid = Array.from(allOptionsGrid).filter(optGrid => optGrid.children[0].dataset.courseCode === courseCode)[0];
//
//     disableAllButtons();
//
//     if (checkbox.checked == true) {
//         // Sentinel value, where this will enable the course to be considered in schedule calculations
//         selectedFilters[courseCode] = null;
//     } else {
//         for (let optionButton of courseOptionGrid.children) {
//             // if (optionButton.dataset.optionNumber === selectedFilters[courseCode]) {
//             optionButton.classList.remove("selected-button");
//             // }
//         };
//         selectedCourseSchedules.selections = selectedCourseSchedules.selections.filter(selection => {
//             selection.course.code !== courseCode;
//         });
//         // Sentinel value, where this will completely filter out the course
//         selectedFilters[courseCode] = -1;
//
//         removeCourseFromTable(courseCode);
//
//     }
//     filteredCourseOptions = filterCourseOption(selectedFilters);
//     generateSchedule(filteredCourseOptions);
// }
//
// function makeCourseButtons(courseOptionData) {
//     const courseContainer = document.getElementsByClassName("course-picker-container")[0];
//     courseContainer.innerHTML = "";
//     courseOptionData.forEach(courseOption => {
//         const courseDetails = courseOption.course;
//         const courseDiv = document.createElement("div");
//         courseDiv.className = "course-container";
//
//         const titleDiv = document.createElement("div");
//         titleDiv.className = "course-title-container";
//
//         const title = document.createElement("p");
//         title.className = "course-title";
//         title.textContent = `${courseDetails.code} - ${courseDetails.name}`;
//
//         const optionsGrid = document.createElement("div");
//         optionsGrid.className = "options-grid";
//
//         const toggleCourseCheckbox = document.createElement("input");
//         toggleCourseCheckbox.setAttribute("type", "checkbox");
//         toggleCourseCheckbox.dataset.courseCode = courseDetails.code;
//         toggleCourseCheckbox.checked = true;
//         toggleCourseCheckbox.addEventListener("click", function() {
//             toggleCourse(this);
//         })
//
//         selectedFilters[courseDetails.code] = null;
//
//         courseOption.options.forEach(option => {
//             const button = document.createElement("button");
//             button.className = `option-button-${option.id}`;
//             button.textContent = `${option.id}`;
//
//             button.dataset.courseCode = courseDetails.code;
//             button.dataset.optionNumber = option.id;
//             button.disabled = true;
//
//             button.addEventListener("click", function() {
//                 selectCourse(button);
//             });
//
//             optionsGrid.appendChild(button);
//         });
//
//         titleDiv.appendChild(toggleCourseCheckbox);
//         titleDiv.appendChild(title);
//         courseDiv.appendChild(titleDiv);
//         courseDiv.appendChild(optionsGrid);
//         courseContainer.appendChild(courseDiv);
//     });
// };

// function getDayIndex(dayName) {
//     const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
//     return DAYS.indexOf(dayName);
// }
//
// function makeScheduleTable() {
//     const timeColumn = document.querySelector(".time-column");
//     const template = document.getElementById("timeSlotTemplate");
//
//     const timeIntTo12Hour = function(hour, minute) {
//         let hourStr = `${hour}`;
//         let minuteStr = (minute >= 10) ? `${minute}` : `0${minute}`;
//         let suffix = "AM";
//         if (hour > 12) {
//             hourStr = `${hour - 12}`;
//             suffix = "PM";
//         }
//         return `${hourStr}:${minuteStr}${suffix}`
//     };
//
//     for (let hour = 8; hour <= 20; hour++) { 
//         for (let minute = 0; minute < 60; minute += 30) {
//             const row = document.createElement("div");
//             row.className = "grid-row";
//
//             const clone = template.content.cloneNode(true);
//             const timeSlot = clone.querySelector(".time-slot");
//             const time = timeIntTo12Hour(hour, minute);
//             timeSlot.textContent = time;
//             timeColumn.appendChild(clone);
//         } 
//     }
// }

// makeScheduleTable();
//
// const clearButton = document.getElementById("clearButton");
// clearButton.addEventListener("click", clear);
//
// const generateScheduleButton = document.getElementById("generateSchedule");
// generateScheduleButton.addEventListener("click", function() {
//     const scheduleDiv = document.getElementById("scheduleContainer");
//     let scheduleTextInput = document.getElementById("scheduleTextInput");
//
//     fetch("http://localhost:5000/api/parseText", {
//         method: "POST",
//         body: scheduleTextInput.value,
//         headers: {
//             "Content-type": "application/json; charset=UTF-8",
//             "Access-Control-Allow-Origin": "*"
//         }
//     }).then(response =>{
//         if (!response.ok) throw new Error("Network error");
//         return response.json();
//     }).then(data => {
//         // const scheduleDisplayText1 = document.getElementById("scheduleDisplayTextTest1");
//         // scheduleDisplayText1.innerText = JSON.stringify(data.course_options);
//
//         allCourseOptions = data;
//
//         clearScheduleTable();
//
//         makeCourseButtons(data.course_options);
//
//         generateSchedule(data);
//     });
// });

// const exampleDataButton = document.getElementById("exampleData");
// exampleDataButton.addEventListener("click", function() {
//     const textFile = "testSchedules.txt";
//     const scheduleTextInput = document.getElementById("scheduleTextInput");
//     fetch(textFile) 
//     .then(r => r.text())
//     .then(text => {
//         scheduleTextInput.value = text;
//     })
//     .then(() => {
//         generateScheduleButton.click();
//     });
//
// });
