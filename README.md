# scheduler-udst-v2

Schedule calculator and visualizer for UDST PeopleSoft classes. Improvized version of previous iteration, now exclusively in a web interface.

## How to run

- Prerequisites: `npm`.

- Install packages
```bash
npm install
```

- Build and run
```bash
npm run build && npm start
```

- For development purposes (with live preview)
```bash
npm run dev
```

## How do I use the app itself?

VIDEO DEMO COMING SOON (whenever enrollment period for next sem.)


- In PeopleSoft, go to the Enrollment page for classes.
- Then, select the class that you want to put in the schedule.
- Copy the entire page (Ctrl + A).
- Paste the text into the *text input box* on the website. Will look something like:


```
SSHA 1004
Ethical Reasoning
Course Information
Class Selection
Select a class option
7 options
Option
Status
Session
Class
Meeting Dates
Days and Times
Room
Instructor
Seats
1
Open
Regular Academic Session
LecTheatre - Class 2518 -Section 1
Lecture - Class 2519 -Section 2
31/12/2024 - 15/04/2025
Sunday
5:00PM to 6:30PM
Tuesday
2:00PM to 3:30PM
01.2.05
05.1.65
Rodney Robertson
Rodney Robertson
Open Seats 109 of 120
Open Seats 28 of 30
...

```
- For adding more classes, repeat the above steps and append to the text:

```
SSHA 1004
Ethical Reasoning
Course Information
Class Selection
...

INFS 3104
Data Structures & Algorithms
Course Information
Class Selection
...
```

 - Hover over the *option buttons* to preview the sections, room numbers, timings of that option. An **option** refers to the course's option you see in PeopleSoft enrollment page.
 ![1-hover-option.png](demo/images/1-hover-option.png)

 - Select an option by clicking on it. This will add it to the schedule and will also filter out conflicting options in other courses.
 ![2-select-option.png](demo/images/2-select-option.png)

 - Exclude a course that you don't want, which will calculate schedules without considering that course (like if wasn't entered at all).
 ![3-exclude-course.png](demo/images/3-exclude-course.png)

 - Play around with the selections to visualize schedules.
