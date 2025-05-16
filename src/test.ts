import { getAvailableCourseOptions } from "./core.js";

function fileTest() {
    const testFile = "test.txt";
    fetch(testFile)
    .then(r => r.text())
    .then(text => {
        console.log(getAvailableCourseOptions(text)); 
    })
}

fileTest();
