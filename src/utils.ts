
// TODO: add more functions, otherwise just keep it as is
// Put here for now
function timeTo12Hour(timeStr: string): string {
    let hour: number = parseInt(timeStr.split(":")[0]);
    let minute = timeStr.split(":")[1];
    let suffix = "AM";
    if (hour > 12) {
        hour -= 12;
        suffix = "PM";
    } else if (hour == 12) {
        suffix = "PM";
    }
    return `${hour}:${minute}${suffix}`
}
