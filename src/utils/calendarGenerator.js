// utils/calendarGenerator.js
const ics = require('ics');

function generateICS(shifts) {
  if (!shifts || shifts.length === 0) {
    throw new Error("No shifts available to generate ICS.");
  }

  const events = shifts.map(shift => {
    // Extract start date and time
    const [startDate, startTime] = shift.start_datetime.split(' ');
    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);

    // Extract end date and time
    const [endDate, endTime] = shift.end_datetime.split(' ');
    const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Handle overnight shifts (e.g., 22:00 - 06:00 should end the next day)
    let adjustedEndDay = endDay;
    let adjustedEndMonth = endMonth;
    let adjustedEndYear = endYear;
    if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
      // Move end time to the next day
      let dateObj = new Date(startYear, startMonth - 1, startDay); // JS months are 0-based
      dateObj.setDate(dateObj.getDate() + 1);
      adjustedEndDay = dateObj.getDate();
      adjustedEndMonth = dateObj.getMonth() + 1; // Convert back to 1-based month
      adjustedEndYear = dateObj.getFullYear();
    }

    return {
      start: [startYear, startMonth, startDay, startHour, startMinute],
      end: [adjustedEndYear, adjustedEndMonth, adjustedEndDay, endHour, endMinute],
      title: `Empire Shift for ${shift.employee}`,
      description: `Work shift: ${startTime} - ${endTime}`,
      alarms: [
        {
            action: 'audio',
            description: 'Reminder',
            trigger: { days:1, before: true }, // 1 day before
        },
        {
            action: 'display',
            trigger: { hours: -2, before: true }, // 2 hours before
        },
    ],
    };
  });

  // Debugging: Check the generated events before creating the ICS file
  console.log("Fixed ICS Events:", events);

  const { error, value } = ics.createEvents(events);
  if (error) {
    throw new Error(error);
  }
  
  return value;
}

module.exports = generateICS;
