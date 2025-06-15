# scheduler-udst-revamp

Schedule calculator and visualizer for UDST classes during enrollment with PeopleSoft. Improvized version of previous iteration (`scheduler-udst`), now exclusively in a web interface.

Works in **PC ONLY** currently.

## How to run the app

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

## How to use the app

### Entering Classes (Schedule Text)

- Works in **PC only**.
- In PeopleSoft, go to the Enrollment page for classes (Manage Classes > Enrol).
- Then, select the class that you want to put in the schedule using "Select Class" button (Or go to the course in **Course Catalog**).
- Copy the entire page.
- Paste the text into the *text input box* on the website.

<!-- ![0-tutorial-demo.mp4](demo/assets/0-tutorial-demo.mp4) -->


#### Demo Video with Course Catalog
https://github.com/user-attachments/assets/d5592a0f-f8fe-47dc-aaab-63456935a131




- For adding more classes, repeat the above steps and append to the text (add to the bottom of what you pasted):

```
DSAI 2201
Introduction to Data Science & AI
Course Information
Class Selection
...

SOFT 2301
Software Project Management
Course Information
Class Selection
...
```
- Recommended to save this text into a `.txt` file after adding everything so it can be easily reused later.

### Creating Schedules

#### Demo Video

https://github.com/user-attachments/assets/99d5a8ac-8593-4bf2-8ed9-c833e863a9c4

<br><br>
  
 - Either refer to the demo video above or read below

 - Hover over the *option buttons* to preview the sections, room numbers, timings of that option. An **option** refers to the course's option you see in PeopleSoft "Course Information" page.
 ![3-hover-option.png](demo/assets/3-hover-option.png)

 - Select an option by clicking on it. This will add it to the schedule and will also *filter out* conflicting options in other courses.
 ![4-select-option.png](demo/assets/4-select-option.png)

 - Exclude a course by unchecking the checkbox. This will calculate schedules without considering that course (like if it wasn't entered at all).
 ![5-exclude-course.png](demo/assets/5-exclude-course.png)

 - Play around with the selections to visualize schedules.

### Advanced Mode

- Optional mode where you can visibly see conflicts, instead of it just being disabled.
- Demo showcasing each feature:

https://github.com/user-attachments/assets/89147849-1bf5-4630-9ebe-87f713398885
