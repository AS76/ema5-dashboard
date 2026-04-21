/* ============================================================
   EMA5 Operations — Google Sheets API Integration
   ============================================================ */

const API = {
  // Google Sheets API v4 — public sheet read-only
  // The sheet must be shared "Anyone with the link can view"
  SPREADSHEET_ID: '1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ',

  // Google Apps Script proxy (CORS-free, primary)
  GAS_URL: 'https://script.google.com/macros/s/AKfycbxGtL_0WUsZXjhorA6WhCI2zzv6JqP9kDmtK4q7CExt5Z4v7nyqJDcMtTyg8Nq9UYr76g/exec',

  // Local VPS proxy (CORS-friendly) — EMA5 proxy server on Hostinger
  // PROXY_URL: 'https://ema5.asassi.cloud',

  // Rota from LMS Excel (aggregated counts by qualification)
  ROTA_URL: '',  // rota served from /rota on VPS proxy — offline for now

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

      if (this.GAS_URL) {
        // Google Apps Script (CORS-free, primary)
        raw = await this.fetchViaGas(sheetName);
      } else if (this.PROXY_URL) {
        // Local VPS proxy (CORS-friendly)
        raw = await this.fetchViaProxy(sheetName);
      } else {
        // gviz JSON endpoint (fallback, may have CORS issues)
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

    // GAS returns array-of-arrays: [[headers], [row1], [row2], ...]
    // First row is headers, rest is data
    if (raw.length > 0 && Array.isArray(raw[0]) && !raw[0].Date) {
      const headers = raw[0].map(h => String(h || '').trim());
      return raw.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
        return obj;
      });
    }

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
  },

  // Fetch rota data (aggregated from LMS Excel via VPS proxy)
  rotaCache: null,
  rotaCacheTime: null,

  async fetchRota() {
    if (!this.ROTA_URL) return []; // rota not available without VPS proxy
    const response = await fetch(this.ROTA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Rota fetch error');
    this.rotaCache = result.data;
    this.rotaCacheTime = new Date().toISOString();
    return result.data;
  },

  getRota() {
    return this.rotaCache || [];
  },

  getRotaLastSync() {
    return this.rotaCacheTime;
  }
};

// Make API globally available
window.API = API;