const pdf = require("pdf-parse");
const fs = require("fs");

async function parseRota(pdfPath) {
  try {
    // Read and parse only the first page of the PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer, { max: 1 }); // Extract only the first page
    const text = data.text;

    console.log("Extracted Text:\n", text); // Debugging output

    // Split text into lines & remove empty ones
    let lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error("PDF format is incorrect. Not enough lines extracted.");
    }

    // 1️⃣ Extract Dates (First row after "Mon Tue Wed Thu...")
    let dateRowIndex = lines.findIndex(line => /\d{2}\/\d{2}\/\d{4}/.test(line));
    if (dateRowIndex === -1) {
      throw new Error("No valid date row found.");
    }

    const dates = lines[dateRowIndex].match(/\d{2}\/\d{2}\/\d{4}/g) || [];
    console.log("Extracted Dates:", dates);

    const shifts = [];

    // 2️⃣ Process Employee Shifts (starting from the next row)
    for (let i = dateRowIndex + 1; i < lines.length; i++) {
      let line = lines[i];

      // Skip unwanted lines (e.g., summaries, keywords, etc.)
      if (/KEY|Available Shifts|Premier League|6 Nations|BARS|Hours/i.test(line)) {
        continue;
      }

      // Extract employee name (removes leading *, keeps full name)
      let nameMatch = line.match(/^(\*+)?([A-Za-z\s-]+)\s+/);
      if (!nameMatch) continue; // Skip if no valid name found

      let employee = nameMatch[2].trim(); // Extract name & remove asterisks (*)
      let shiftData = line.replace(nameMatch[0], "").trim(); // Remove name from shift data

      // Extract shifts (handles cases with extra spaces)
      let shiftEntries = shiftData.match(/(\d{2}:\d{2}\s*-\s*\d{2}:\d{2}|OFF|HOL-\d+)/g) || [];

      // Ensure shifts align with dates
      shiftEntries.forEach((entry, index) => {
        if (!dates[index] || entry === "OFF" || entry.startsWith("HOL")) return;

        const [startTime, endTime] = entry.split("-").map(t => t.trim());

        shifts.push({
          employee,
          date: dates[index],
          startTime,
          endTime,
        });
      });
    }

    console.log("Extracted Shifts:", shifts);
    return shifts;
  } catch (error) {
    console.error("Error parsing rota:", error);
    throw error;
  }
}

module.exports = { parseRota };
