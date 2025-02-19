const { parse } = require('date-fns');
const tz = require('date-fns-tz');  // Import the entire module
const zonedTimeToUtc = tz.zonedTimeToUtc; // Extract function manually

function parseRotaDateTime(dateStr, timeStr) {
  const baseDate = parse(dateStr, 'dd/MM/yyyy', new Date());
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Handle overnight shifts (end time < start time)
  let adjustedDate = new Date(baseDate);
  if (hours >= 18) { // Assuming evening/night shifts start after 18:00
    adjustedDate.setDate(adjustedDate.getDate() - 1);
  }

  return zonedTimeToUtc(
    new Date(
      `${adjustedDate.getFullYear()}-${(adjustedDate.getMonth() + 1).toString().padStart(2, '0')}-${adjustedDate.getDate().toString().padStart(2, '0')}T${timeStr}:00`
    ),
    'Europe/London' // Adjust to your timezone
  );
}

module.exports = parseRotaDateTime;
