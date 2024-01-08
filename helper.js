const fs = require('fs').promises;
const { DateTime } = require('luxon');
const path = require('path');


async function history(data) {
  const now = DateTime.now();
  const filePath = `./history/${now.year}-${now.toFormat('MM')}-${now.toFormat('dd')}_history.json`;
  try {
    await fs.access(filePath);
    const existingContent = await fs.readFile(filePath, 'utf8');
    let existingData;
    try {
      existingData = JSON.parse(existingContent);
      if (!Array.isArray(existingData)) {
        throw new Error('Not an array');
      }
    } catch (parseError) {
      existingData = [];
    }
    const existingEntry = existingData.find(entry => entry.name === data.name);
    if (existingEntry) {
      existingEntry.restart += 1;
    } else {
      existingData.push({ name: data.name, restart: 1 });
    }
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    // console.log(`File updated successfully: ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify([{ name: data.name, restart: 1 }], null, 2), 'utf8');
    //   console.log(`File created successfully: ${filePath}`);
    } else {
      console.error(`Error accessing/writing file: ${err.message}`);
    }
  }
}

module.exports = {
    history
};