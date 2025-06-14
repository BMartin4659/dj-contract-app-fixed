// Script to update song dates in all CSV files with more realistic dates
import fs from 'fs';
import path from 'path';

// Function to generate a random date between two dates
function getRandomDate(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

// Function to format date in iTunes format (YYYY-MM-DD HH:MM:SS)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Function to update dates in a CSV file
function updateCSVDates(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lines.length < 2) {
      console.log(`Skipping ${filePath} - insufficient data`);
      return;
    }
    
    // Keep header line unchanged
    const header = lines[0];
    const updatedLines = [header];
    
    // Define date range: from 2018 to 2024 (6 years of music library growth)
    const startDate = new Date('2018-01-01');
    const endDate = new Date('2024-12-31');
    
    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line handling quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
          current += char;
        } else if (char === ',' && !inQuotes) {
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current); // Add the last value
      
      // iTunes CSV format: Track ID,Name,Artist,Album,Genre,Date Added,Play Count,Location
      if (values.length >= 6) {
        // Generate a random date for this song
        const randomDate = getRandomDate(startDate, endDate);
        const formattedDate = formatDate(randomDate);
        
        // Update the date field (index 5)
        values[5] = formattedDate;
        
        // Reconstruct the line
        const updatedLine = values.join(',');
        updatedLines.push(updatedLine);
      } else {
        // Keep original line if it doesn't have enough fields
        updatedLines.push(line);
      }
    }
    
    // Write updated content back to file
    const updatedContent = updatedLines.join('\n');
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated ${filePath} with ${updatedLines.length - 1} songs`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main function to update all CSV files
function updateAllCSVFiles() {
  const dataDir = './public/data';
  
  try {
    const files = fs.readdirSync(dataDir);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    
    console.log(`Found ${csvFiles.length} CSV files to update:`);
    csvFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');
    
    // Update each CSV file
    csvFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      updateCSVDates(filePath);
    });
    
    console.log(`\n🎉 Successfully updated ${csvFiles.length} CSV files with new dates!`);
    console.log('Date range: 2018-01-01 to 2024-12-31');
    console.log('Each song now has a unique random date within this range.');
    
  } catch (error) {
    console.error('❌ Error reading data directory:', error.message);
  }
}

// Run the update
console.log('=== Updating Song Dates in All CSV Files ===\n');
updateAllCSVFiles(); 