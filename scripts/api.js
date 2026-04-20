/* ============================================================
   EMA5 Operations — Google Sheets API Integration
   ============================================================ */

const API = {
  // Google Sheets API v4 — public sheet read-only
  // The sheet must be shared "Anyone with the link can view"
  SPREADSHEET_ID: '1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ',

  // NOTE: For production use, set up a Google Apps Script as a CORS proxy.
  // See fetch-sheets-gas.js for deployment instructions.
  // Then update GAS_URL below to your deployed webapp URL.
  //
  // Example GAS URL (replace with your deployed URL):
  // Local VPS proxy (CORS-friendly) — EMA5 proxy server on Hostinger
  PROXY_URL: 'https://securities-proposal-affiliate-creative.trycloudflare.com',

  // Fallback: direct Google Sheets API (requires API key with CORS support)
  // For now we use the gviz tqx approach which works without API key
  SHEETS_VIZ_URL: 'https://docs.google.com/spreadsheets/d/1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ/gviz/tq?tqx=out:json',

  state: {
    data: {},
    lastSync: null,
    loading: {},
    errors: {}
  },

  // Fetch all sheets in parallel
  async fetchAll() {
    const sheets = ['Daily Log', 'Issues', 'Actions', 'Team', 'Rota'];
    const results = {};
    const errors = [];

    await Promise.all(
      sheets.map(async (sheet) => {
        try {
          const data = await this.fetchSheet(sheet);
          results[sheet] = data;
        } catch (err) {
          errors.push({ sheet, error: err.message });
          results[sheet] = [];
        }
      })
    );

    this.state.data = results;
    this.state.lastSync = new Date().toISOString();

    if (errors.length > 0) {
      console.warn('Some sheets failed to load:', errors);
    }

    return {
      data: results,
      lastSync: this.state.lastSync,
      errors
    };
  },

  // Fetch a single sheet by name
  async fetchSheet(sheetName) {
    this.state.loading[sheetName] = true;

    try {
      let raw;

      if (this.PROXY_URL) {
        // Use local VPS proxy (CORS-friendly)
        raw = await this.fetchViaProxy(sheetName);
      } else {
        // Use gviz JSON endpoint (no API key required for public sheets)
        raw = await this.fetchViaGviz(sheetName);
      }

      const parsed = this.parseSheetData(raw, sheetName);
      this.state.loading[sheetName] = false;
      return parsed;
    } catch (err) {
      this.state.loading[sheetName] = false;
      this.state.errors[sheetName] = err.message;
      throw err;
    }
  },

  // Method 1: Via local VPS proxy (Cloudflare Tunnel — CORS-friendly)
  async fetchViaProxy(sheetName) {
    const url = `${this.PROXY_URL}/sheets?sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Proxy error');
    return result.data;
  },

  // Method 2: Via Google Apps Script (recommended for production)
  async fetchViaGas(sheetName) {
    const url = `${this.GAS_URL}?sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Method 2: Via Google Visualization API (gviz) — no API key needed
  async fetchViaGviz(sheetName) {
    const url = `${this.SHEETS_VIZ_URL}&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();

    // gviz returns: google.visualization.Query.setResponse({...})
    // We need to extract the JSON from this response
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\)/s);
    if (!jsonMatch) throw new Error('Failed to parse gviz response');

    const vizResponse = JSON.parse(jsonMatch[1]);

    if (vizResponse.errors) {
      throw new Error(vizResponse.errors[0]?.detailed_message || 'Sheet query error');
    }

    return this.parseVizResponse(vizResponse);
  },

  // Parse Google Visualization API response into array of objects
  parseVizResponse(vizResponse) {
    const table = vizResponse.table;
    if (!table || !table.rows) return [];

    const cols = table.cols.map(c => c.label || c.id || 'col');
    const rows = table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[cols[i]] = cell?.v ?? '';
      });
      return obj;
    });

    return rows;
  },

  // Parse raw sheet data into clean JSON
  // Handles both gviz format and direct array format
  parseSheetData(raw, sheetName) {
    if (!raw || !Array.isArray(raw)) return [];
    return raw;
  },

  // Get data for a specific sheet
  getSheet(sheetName) {
    return this.state.data[sheetName] || [];
  },

  // Get last sync time
  getLastSync() {
    return this.state.lastSync;
  },

  // Check if data is stale (older than threshold in ms)
  isStale(thresholdMs = 3600000) {
    if (!this.state.lastSync) return true;
    return Date.now() - new Date(this.state.lastSync).getTime() > thresholdMs;
  }
};

// Make API globally available
window.API = API;