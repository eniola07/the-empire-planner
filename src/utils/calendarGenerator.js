// utils/calendarGenerator.js
const ics = require('ics');

function generateICS(shifts) {
  if (!shifts || shifts.length === 0) {
    throw new Error("No shifts available to generate ICS.");
  }

  const events = shifts.map(shift => {
    // Convert start and end to Date objects (if not already)
    const startDateObj = new Date(shift.start_datetime);
    const endDateObj = new Date(shift.end_datetime);
    
    return {
      start: [
        startDateObj.getFullYear(),
        startDateObj.getMonth() + 1,
        startDateObj.getDate(),
        startDateObj.getHours(),
        startDateObj.getMinutes()
      ],
      end: [
        endDateObj.getFullYear(),
        endDateObj.getMonth() + 1,
        endDateObj.getDate(),
        endDateObj.getHours(),
        endDateObj.getMinutes()
      ],
      title: `Shift for ${shift.employee}`,
      description: `Work shift: ${startDateObj.toLocaleTimeString()} - ${endDateObj.toLocaleTimeString()}`,
      alarms: [
        {
          action: 'display',
          trigger: { days: -1, before: true } // Alarm 1 day before
        },
        {
          action: 'display',
          trigger: { hours: -2, before: true } // Alarm 2 hours before
        },
      ],
    };
  });

  const { error, value } = ics.createEvents(events);
  if (error) {
    throw new Error(error);
  }
  return value;
}

module.exports = generateICS;
