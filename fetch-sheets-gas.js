/**
 * EMA5 Operations — Google Apps Script CORS Proxy
 * ================================================
 *
 * This script enables the webapp to fetch Google Sheets data
 * without CORS issues by acting as a server-side proxy.
 *
 * DEPLOYMENT INSTRUCTIONS:
 * ------------------------
 * 1. Open https://script.google.com and create a new project
 * 2. Copy ALL the code from this file into the script editor
 * 3. Save the project (File > Save, or Ctrl+S)
 * 4. Deploy > New deployment
 *    - Type: Web app
 *    - Description: "EMA5 Sheets Proxy"
 *    - Execute as: Me
 *    - Who has access: Anyone (or Anyone with Google account)
 * 5. Click Deploy
 * 6. Copy the webapp URL (looks like: https://script.google.com/macros/s/XXXXX/exec)
 * 7. Paste that URL into api.js as GAS_URL constant
 * 8. Done! The webapp will now fetch live data
 *
 * HOW IT WORKS:
 * -------------
 * Browser --> GAS Web App --> Google Sheets API (no CORS issues)
 *
 * The webapp calls:
 *   https://script.google.com/macros/s/{ID}/exec?sheet=Daily%20Log
 *
 * The script fetches the sheet data server-side and returns JSON.
 * No API key needed — the script runs as your Google account.
 */

const SPREADSHEET_ID = '1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ';

const SHEET_CONFIGS = {
  'Daily Log': { sheetId: '141797596', startRow: 1 },
  'Issues':    { sheetId: '1638057795', startRow: 1 },
  'Actions':   { sheetId: '78142974', startRow: 1 },
  'Team':      { sheetId: '1174137464', startRow: 1 },
  'Rota':      { sheetId: '2000016828', startRow: 1 }
};

/**
 * Main doGet handler — serves all sheet requests
 */
function doGet(e) {
  const sheetName = e.parameter.sheet || 'Daily Log';

  try {
    const data = fetchSheetData(sheetName);
    const response = {
      success: true,
      sheet: sheetName,
      data: data,
      fetchedAt: new Date().toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const response = {
      success: false,
      sheet: sheetName,
      error: error.message || 'Unknown error',
      fetchedAt: new Date().toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fetch data from a specific sheet
 */
function fetchSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let sheet;
  if (SHEET_CONFIGS[sheetName]) {
    sheet = ss.getSheetByName(sheetName) || ss.getSheetById(SHEET_CONFIGS[sheetName].sheetId);
  } else {
    sheet = ss.getSheetByName(sheetName);
  }

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) return [];

  const range = sheet.getRange(1, 1, lastRow, lastCol);
  const values = range.getValues();

  if (values.length < 2) return [];

  // First row = headers
  const headers = values[0].map(h => String(h || '').trim());
  const dataRows = values.slice(1);

  const result = dataRows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] !== undefined ? row[i] : '';
    });
    return obj;
  });

  // Filter out empty rows
  return result.filter(row =>
    Object.values(row).some(v => v !== '' && v !== null && v !== undefined)
  );
}

/**
 * Test function — run this to test the script
 */
function testFetch() {
  const result = fetchSheetData('Daily Log');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Test all sheets
 */
function testAllSheets() {
  const sheets = ['Daily Log', 'Issues', 'Actions', 'Team', 'Rota'];
  const results = {};
  sheets.forEach(name => {
    try {
      results[name] = fetchSheetData(name);
    } catch (err) {
      results[name] = { error: err.message };
    }
  });
  console.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * Manual trigger URL for testing:
 * https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec?sheet=Daily%20Log
 */