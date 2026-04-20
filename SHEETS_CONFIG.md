# EMA5 Operations — Google Sheets Configuration

## Spreadsheet

| Property | Value |
|----------|-------|
| **Spreadsheet ID** | `1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ` |
| **Spreadsheet URL** | https://docs.google.com/spreadsheets/d/1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ/edit |
| **Public URL (view-only)** | https://docs.google.com/spreadsheets/d/1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ/edit?usp=sharing |
| **Share status** | Anyone with the link can view |

---

## Sheets

### 1. Daily Log
- **Sheet ID**: `141797596`
- **Columns** (A→K):
  1. Date
  2. Day
  3. Presenze
  4. North Status
  5. North Notes
  6. South Status
  7. South Notes
  8. Blockers
  9. Actions Taken
  10. Notes
  11. Last Updated
- **Sample rows**: 4 (2026-04-17 to 2026-04-20)

### 2. Issues
- **Sheet ID**: `1638057795`
- **Columns** (A→J):
  1. Issue ID
  2. Title
  3. Description
  4. Priority
  5. Owner
  6. Status
  7. Due Date
  8. Created
  9. Updated
  10. Linked Actions
- **Sample rows**: 5 (ISS-001 to ISS-005)

### 3. Actions
- **Sheet ID**: `78142974`
- **Columns** (A→I):
  1. Action ID
  2. Title
  3. Owner
  4. Deadline
  5. Status
  6. Linked Issue
  7. Notes
  8. Created
  9. Updated
- **Sample rows**: 7 (ACT-001 to ACT-007)

### 4. Team
- **Sheet ID**: `1174137464`
- **Columns** (A→G):
  1. Name
  2. Role
  3. Company
  4. Email
  5. Phone
  6. Site Area
  7. Notes
- **Sample rows**: 7 (Andrea, Matej, William, Marco, Luca, Sarah, John)

### 5. Rota
- **Sheet ID**: `2000016828`
- **Columns** (A→G):
  1. Week Of
  2. Day
  3. Area
  4. Morning (06-14)
  5. Afternoon (14-22)
  6. Night (22-06)
  7. Notes
- **Sample rows**: 10 (Mon-Fri, North + South)

---

## Webapp Integration

Use the spreadsheet ID `1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ` in the webapp config.
The webapp should use the public URL for read-only access:
```
https://docs.google.com/spreadsheets/d/1bQdx9pqtCRec8r8HhS4cyryi6t0S5UNJrv71qA_VlqQ/gviz/tq?tqx=out:json
```
Or via Google Sheets API v4:
```
GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{sheetName}
```
