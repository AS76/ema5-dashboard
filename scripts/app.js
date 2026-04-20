/* ============================================================
   EMA5 Operations — Main Application
   ============================================================ */

const App = {
  state: {
    currentPage: 'daily-log',
    dataLoaded: false,
    sidebarOpen: false
  },

  // Page titles for topbar
  pageTitles: {
    'daily-log': 'Daily Log',
    'issues': 'Issues Tracker',
    'actions': 'Actions',
    'team': 'Team Contacts',
    'rota': 'Rota'
  },

  // Initialize the app
  async init() {
    // Set up router
    this.setupRouter();

    // Set up UI interactions
    this.setupUI();

    // Load initial data
    await this.loadData();

    // Render initial page
    this.navigateTo(window.location.hash || '#/');

    // Update sync time display
    this.updateSyncTime();
  },

  // Hash-based router
  setupRouter() {
    window.addEventListener('hashchange', () => {
      this.navigateTo(window.location.hash || '#/');
    });
  },

  // Set up hamburger, backdrop, nav clicks
  setupUI() {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    hamburgerBtn.addEventListener('click', () => {
      this.toggleSidebar();
    });

    backdrop.addEventListener('click', () => {
      this.closeSidebar();
    });

    // Sidebar nav items
    document.getElementById('sidebarNav').addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (!navItem) return;

      const page = navItem.dataset.page;
      if (page) {
        this.closeSidebar();
        window.location.hash = `/${page}`;
      }
    });
  },

  // Toggle mobile sidebar
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    this.state.sidebarOpen = !this.state.sidebarOpen;

    if (this.state.sidebarOpen) {
      sidebar.classList.add('open');
      backdrop.classList.add('visible');
    } else {
      sidebar.classList.remove('open');
      backdrop.classList.remove('visible');
    }
  },

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    this.state.sidebarOpen = false;
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
  },

  // Navigate to a page
  navigateTo(hash) {
    const page = hash.replace('#/', '') || 'daily-log';
    this.state.currentPage = page;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update topbar title
    document.getElementById('topbarTitle').textContent = this.pageTitles[page] || page;

    // Update topbar actions (can be overridden per page)
    document.getElementById('topbarActions').innerHTML = '';

    // Render the page
    this.renderPage(page);
  },

  // Render a specific page
  async renderPage(page) {
    const content = document.getElementById('pageContent');
    content.innerHTML = this.getSkeletonHTML(page);

    try {
      let html = '';
      switch (page) {
        case 'daily-log':
          html = await Pages.dailyLog();
          break;
        case 'issues':
          html = await Pages.issues();
          break;
        case 'actions':
          html = await Pages.actions();
          break;
        case 'team':
          html = await Pages.team();
          break;
        case 'rota':
          html = await Pages.rota();
          break;
        default:
          html = '<div class="empty-state"><div class="empty-state-title">Page not found</div></div>';
      }
      content.innerHTML = html;
    } catch (err) {
      console.error('Page render error:', err);
      content.innerHTML = this.getErrorHTML(err.message);
    }
  },

  // Load all data from Google Sheets
  async loadData() {
    try {
      const result = await API.fetchAll();
      this.state.dataLoaded = true;

      if (result.errors.length === 0) {
        this.toast('Data synced successfully', 'success');
      } else {
        this.toast(`Some sheets failed to load`, 'error');
      }
    } catch (err) {
      console.error('Data load error:', err);
      this.toast('Failed to load data. Showing sample data.', 'error');
      this.loadSampleData();
    }
  },

  // Load sample data for development/demo
  loadSampleData() {
    API.state.data = {
      'Daily Log': [
        { Date: '2026-04-20', Day: 'Monday', Presenze: '14 (Team A + 4 subbies)', 'North Status': 'Amber', 'South Status': 'Green', Blockers: 'Awaiting spare part for north sorter — ETA Tuesday', 'Actions Taken': 'Replaced 2 sensors on Pack & Ship line', Notes: 'Amazon supervisor flagged concern on aisle 7 floor markings' },
        { Date: '2026-04-19', Day: 'Sunday', Presenze: '10 (Team A)', 'North Status': 'Green', 'South Status': 'Amber', Blockers: '', 'Actions Taken': 'Preventive maintenance on Sorter 3', Notes: '' },
        { Date: '2026-04-18', Day: 'Saturday', Presenze: '8 (Team B)', 'North Status': 'Amber', 'South Status': 'Amber', Blockers: 'Software update pending approval', 'Actions Taken': 'Weekly deep clean', Notes: '' },
        { Date: '2026-04-17', Day: 'Friday', Presenze: '15 (Full team)', 'North Status': 'Green', 'South Status': 'Green', Blockers: '', 'Actions Taken': 'Completed SAT for Pack & Ship module', Notes: 'All systems nominal' },
      ],
      'Issues': [
        { 'Issue ID': 'ISS-001', Title: 'North sorter encoder failure', Description: 'Encoder on sort module 3 giving intermittent readings', Priority: 'A', Owner: 'Andrea Sassi', Status: 'In Progress', 'Due Date': '2026-04-22', Created: '2026-04-18', Updated: '2026-04-20', 'Linked Actions': 'ACT-003' },
        { 'Issue ID': 'ISS-002', Title: 'South conveyor belt misalignment', Description: 'Belt tracking off-center by 15mm', Priority: 'R', Owner: 'Matej Kovac', Status: 'Open', 'Due Date': '2026-04-21', Created: '2026-04-19', Updated: '2026-04-19', 'Linked Actions': 'ACT-001, ACT-002' },
        { 'Issue ID': 'ISS-003', Title: 'Floor markings Aisle 7 faded', Description: 'Safety markings need repainting', Priority: 'G', Owner: 'William Collings', Status: 'Open', 'Due Date': '2026-04-25', Created: '2026-04-20', Updated: '2026-04-20', 'Linked Actions': '' },
        { 'Issue ID': 'ISS-004', Title: 'Emergency stop button malfunction', Description: 'Button on Station 12 not responding', Priority: 'R', Owner: 'Andrea Sassi', Status: 'Done', 'Due Date': '2026-04-18', Created: '2026-04-16', Updated: '2026-04-18', 'Linked Actions': 'ACT-004' },
        { 'Issue ID': 'ISS-005', Title: 'Software update for WCS', Description: 'Latest firmware pending approval from Amazon', Priority: 'A', Owner: 'Marco Rossi', Status: 'Blocked', 'Due Date': '2026-04-28', Created: '2026-04-15', Updated: '2026-04-20', 'Linked Actions': '' },
      ],
      'Actions': [
        { 'Action ID': 'ACT-001', Title: 'Replace conveyor belt guides', Owner: 'Matej Kovac', Deadline: '2026-04-21', Status: 'Open', 'Linked Issue': 'ISS-002', Notes: 'Part ordered, ETA 20 Apr', Created: '2026-04-19', Updated: '2026-04-19' },
        { 'Action ID': 'ACT-002', Title: 'Re-align belt tracking system', Owner: 'Matej Kovac', Deadline: '2026-04-21', Status: 'Open', 'Linked Issue': 'ISS-002', Notes: 'After part replacement', Created: '2026-04-19', Updated: '2026-04-19' },
        { 'Action ID': 'ACT-003', Title: 'Source replacement encoder', Owner: 'Andrea Sassi', Deadline: '2026-04-22', Status: 'In Progress', 'Linked Issue': 'ISS-001', Notes: 'Contacting TGW procurement', Created: '2026-04-18', Updated: '2026-04-20' },
        { 'Action ID': 'ACT-004', Title: 'Replace emergency stop button', Owner: 'Marco Rossi', Deadline: '2026-04-18', Status: 'Done', 'Linked Issue': 'ISS-004', Notes: 'Completed', Created: '2026-04-16', Updated: '2026-04-18' },
        { 'Action ID': 'ACT-005', Title: 'Schedule WCS update maintenance window', Owner: 'Marco Rossi', Deadline: '2026-04-25', Status: 'Open', 'Linked Issue': 'ISS-005', Notes: 'Requires Amazon approval', Created: '2026-04-15', Updated: '2026-04-20' },
        { 'Action ID': 'ACT-006', Title: 'Repaint Aisle 7 floor markings', Owner: 'William Collings', Deadline: '2026-04-25', Status: 'Open', 'Linked Issue': 'ISS-003', Notes: '', Created: '2026-04-20', Updated: '2026-04-20' },
        { 'Action ID': 'ACT-007', Title: 'Weekly PM checklist review', Owner: 'Andrea Sassi', Deadline: '2026-04-24', Status: 'In Progress', 'Linked Issue': '', Notes: 'Every Thursday', Created: '2026-04-17', Updated: '2026-04-20' },
      ],
      'Team': [
        { Name: 'Andrea Sassi', Role: 'Site Manager', Company: 'TGW', Email: 'andrea.sassi@tgw-group.com', Phone: '+44 7911 123456', 'Site Area': 'Both', Notes: 'Primary contact, splits UK/Italy' },
        { Name: 'Matej Kovac', Role: 'Site Engineer', Company: 'TGW', Email: 'matej.kovac@tgw-group.com', Phone: '+44 7911 234567', 'Site Area': 'North', Notes: 'Mechanical specialist' },
        { Name: 'William Collings', Role: 'Project Manager', Company: 'TGW', Email: 'william.collings@tgw-group.com', Phone: '+44 7484 557866', 'Site Area': 'Both', Notes: 'Dematic PM, EMA5 main contact' },
        { Name: 'Marco Rossi', Role: 'Automation Engineer', Company: 'TGW', Email: 'marco.rossi@tgw-group.com', Phone: '+44 7911 345678', 'Site Area': 'South', Notes: 'WCS/WMS specialist' },
        { Name: 'Luca Bianchi', Role: 'Electrician', Company: 'Subcontractor', Email: 'luca@subbie.com', Phone: '+39 333 1112222', 'Site Area': 'Both', Notes: 'Available Mon-Fri UK' },
        { Name: 'Sarah Chen', Role: 'Amazon Site Lead', Company: 'Amazon', Email: 'schen@amazon.com', Phone: '+44 7911 456789', 'Site Area': 'Both', Notes: 'Amazon supervisor for EMA5' },
        { Name: 'John Murphy', Role: 'H&S Officer', Company: 'Amazon', Email: 'jmurphy@amazon.com', Phone: '+44 7911 567890', 'Site Area': 'Both', Notes: 'Health & Safety lead' },
      ],
      'Rota': [
        { Week: '2026-04-20', Day: 'Monday', Area: 'North', Morning: 'Andrea Sassi', Afternoon: 'Matej Kovac', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Monday', Area: 'South', Morning: 'Marco Rossi', Afternoon: 'Sarah Chen', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Tuesday', Area: 'North', Morning: 'Matej Kovac', Afternoon: 'Andrea Sassi', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Tuesday', Area: 'South', Morning: 'Marco Rossi', Afternoon: 'Marco Rossi', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Wednesday', Area: 'North', Morning: 'Andrea Sassi', Afternoon: 'Matej Kovac', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Wednesday', Area: 'South', Morning: 'Marco Rossi', Afternoon: 'Sarah Chen', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Thursday', Area: 'North', Morning: 'Matej Kovac', Afternoon: 'Andrea Sassi', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Thursday', Area: 'South', Morning: 'Marco Rossi', Afternoon: 'Marco Rossi', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Friday', Area: 'North', Morning: 'Andrea Sassi', Afternoon: 'Matej Kovac', Night: '', Notes: '' },
        { Week: '2026-04-20', Day: 'Friday', Area: 'South', Morning: 'Sarah Chen', Afternoon: 'Marco Rossi', Night: '', Notes: '' },
      ]
    };
  },

  // Update sync time in sidebar
  updateSyncTime() {
    const el = document.getElementById('syncTime');
    const lastSync = API.getLastSync();
    if (lastSync) {
      const date = new Date(lastSync);
      el.textContent = `Synced ${this.formatTime(date)}`;
    } else {
      el.textContent = 'Not synced';
    }
  },

  // Format time as "14:32" or "2:32 PM"
  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  },

  // Toast notification system
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
    `;
    container.appendChild(toast);

    // Auto-dismiss after 3s
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Skeleton HTML for loading state
  getSkeletonHTML(page) {
    const isTable = ['daily-log', 'issues', 'actions'].includes(page);
    const isTeam = page === 'team';
    const isRota = page === 'rota';

    let html = `
      <div class="page-header">
        <div class="page-header-top">
          <div class="skeleton skeleton-line medium" style="height:28px;width:180px;"></div>
        </div>
      </div>
      <div class="stat-cards">
        <div class="skeleton-card" style="height:100px;"></div>
        <div class="skeleton-card" style="height:100px;"></div>
        <div class="skeleton-card" style="height:100px;"></div>
      </div>
    `;

    if (isTable) {
      html += `
        <div class="skeleton skeleton-line medium mb-4" style="height:36px;width:300px;"></div>
        <div class="table-wrapper">
          <div class="skeleton skeleton-line long mb-4" style="height:40px;"></div>
          ${Array(5).fill('<div class="skeleton skeleton-line long mb-4" style="height:48px;"></div>').join('')}
        </div>
      `;
    } else if (isTeam) {
      html += `
        <div class="team-grid">
          ${Array(4).fill('<div class="skeleton-card" style="height:200px;"></div>').join('')}
        </div>
      `;
    } else if (isRota) {
      html += `
        <div class="rota-grid">
          <div class="skeleton skeleton-line long mb-4" style="height:48px;"></div>
          ${Array(5).fill('<div class="skeleton skeleton-line long mb-4" style="height:80px;"></div>').join('')}
        </div>
      `;
    }

    return html;
  },

  // Error state HTML
  getErrorHTML(message) {
    return `
      <div class="error-state">
        <div class="error-state-icon">⚠️</div>
        <div class="error-state-title">Failed to load data</div>
        <div class="error-state-desc">${message || 'An unknown error occurred'}</div>
        <button class="btn btn-secondary" onclick="App.loadData().then(() => App.renderPage(App.state.currentPage))">
          Retry
        </button>
      </div>
    `;
  },

  // Empty state HTML
  getEmptyHTML(title, description) {
    return `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-desc">${description}</div>
      </div>
    `;
  }
};

// Make App globally available
window.App = App;

// Pages module — all page renderers
const Pages = {
  // Helper: format date
  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  },

  // Helper: status dot class
  statusDotClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'green' || s === 'done') return 'green';
    if (s === 'amber' || s === 'in progress') return 'amber';
    if (s === 'red' || s === 'blocked' || s === 'open') return 'red';
    return 'grey';
  },

  // Helper: status badge class
  statusBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'done') return 'badge-done';
    if (s === 'in progress') return 'badge-progress';
    if (s === 'blocked') return 'badge-blocked';
    if (s === 'cancelled') return 'badge-cancelled';
    return 'badge-open';
  },

  // Helper: priority badge class
  priorityBadgeClass(priority) {
    if (priority === 'R') return 'badge-red';
    if (priority === 'A') return 'badge-amber';
    if (priority === 'G') return 'badge-green';
    return 'badge-navy';
  },

  // Helper: company badge class
  companyBadgeClass(company) {
    const c = (company || '').toLowerCase();
    if (c === 'tgw') return 'company-badge tgw';
    if (c === 'amazon') return 'company-badge amazon';
    if (c === 'subcontractor') return 'company-badge subcontractor';
    return 'company-badge other';
  },

  // Helper: initials from name
  initials(name) {
    return (name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
};

// ============================================================
// DAILY LOG PAGE
// ============================================================
Pages.dailyLog = async function () {
  const data = API.getSheet('Daily Log') || [];
  const weekData = data.slice(-7); // last 7 days

  const totalEntries = data.length;
  const blockerCount = data.filter(r => r.Blockers && r.Blockers.trim()).length;
  const openIssues = API.getSheet('Issues')?.filter(r => r.Status !== 'Done').length || 0;

  let rows = '';
  weekData.forEach(entry => {
    const northDot = Pages.statusDotClass(entry['North Status']);
    const southDot = Pages.statusDotClass(entry['South Status']);
    const hasBlocker = entry.Blockers && entry.Blockers.trim();

    rows += `
      <tr>
        <td class="mono">${entry.Date || '—'}</td>
        <td>${entry.Day || '—'}</td>
        <td>${entry.Presenze || '—'}</td>
        <td>
          <div class="status-cell">
            <span class="status-dot ${northDot}"></span>
            ${entry['North Status'] || '—'}
          </div>
        </td>
        <td>
          <div class="status-cell">
            <span class="status-dot ${southDot}"></span>
            ${entry['South Status'] || '—'}
          </div>
        </td>
        <td>
          ${hasBlocker ? `<span class="blocker-badge">🔴 Blocker</span>` : '<span class="text-tertiary">—</span>'}
        </td>
      </tr>
    `;
  });

  if (!rows) {
    return App.getEmptyHTML('No entries yet', 'Daily log entries will appear here once data is synced.');
  }

  return `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Daily Log</h1>
        <button class="btn btn-primary btn-sm" onclick="Pages.refreshDailyLog()">
          ↻ Refresh
        </button>
      </div>
      <p class="page-subtitle">Last 7 days • ${totalEntries} total entries</p>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-label">Total Entries</div>
        <div class="stat-card-value">${totalEntries}</div>
        <div class="stat-card-sub">all time</div>
      </div>
      <div class="stat-card red">
        <div class="stat-card-label">Blockers</div>
        <div class="stat-card-value">${blockerCount}</div>
        <div class="stat-card-sub">active</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-card-label">Open Issues</div>
        <div class="stat-card-value">${openIssues}</div>
        <div class="stat-card-sub">need attention</div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Presenze</th>
            <th>North</th>
            <th>South</th>
            <th>Blockers</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

Pages.refreshDailyLog = async function () {
  try {
    await API.fetchSheet('Daily Log');
    App.renderPage('daily-log');
    App.toast('Daily log refreshed', 'success');
  } catch {
    App.toast('Refresh failed', 'error');
  }
};

// ============================================================
// ISSUES PAGE
// ============================================================
Pages.issues = async function () {
  const data = API.getSheet('Issues') || [];

  const total = data.length;
  const rCount = data.filter(r => r.Priority === 'R').length;
  const aCount = data.filter(r => r.Priority === 'A').length;
  const openCount = data.filter(r => r.Status !== 'Done').length;

  let rows = '';
  data.forEach(entry => {
    const priorityClass = Pages.priorityBadgeClass(entry.Priority);
    const statusClass = Pages.statusBadgeClass(entry.Status);

    rows += `
      <tr>
        <td class="mono">${entry['Issue ID'] || '—'}</td>
        <td class="cell-truncate">${entry.Title || '—'}</td>
        <td><span class="badge ${priorityClass}">${entry.Priority || '—'}</span></td>
        <td>${entry.Owner || '—'}</td>
        <td><span class="badge ${statusClass}">${entry.Status || 'Open'}</span></td>
        <td class="mono">${Pages.formatDate(entry['Due Date'])}</td>
      </tr>
    `;
  });

  if (!rows) {
    return App.getEmptyHTML('No issues tracked', 'Issues will appear here once added to the spreadsheet.');
  }

  return `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Issues Tracker</h1>
      </div>
      <p class="page-subtitle">${total} issues • ${openCount} open</p>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-label">Total</div>
        <div class="stat-card-value">${total}</div>
        <div class="stat-card-sub">all issues</div>
      </div>
      <div class="stat-card red">
        <div class="stat-card-label">Critical (R)</div>
        <div class="stat-card-value">${rCount}</div>
        <div class="stat-card-sub">needs immediate action</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-card-label">High (A)</div>
        <div class="stat-card-value">${aCount}</div>
        <div class="stat-card-sub">priority attention</div>
      </div>
    </div>

    <div class="filter-bar mb-4">
      <button class="filter-btn active" data-filter="all">All (${total})</button>
      <button class="filter-btn" data-filter="R">🔴 R (${rCount})</button>
      <button class="filter-btn" data-filter="A">🟡 A (${aCount})</button>
      <button class="filter-btn" data-filter="G">🟢 G (${data.filter(r => r.Priority === 'G').length})</button>
      <button class="filter-btn" data-filter="Open">Open (${openCount})</button>
      <button class="filter-btn" data-filter="Done">Done (${total - openCount})</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

// ============================================================
// ACTIONS PAGE
// ============================================================
Pages.actions = async function () {
  const data = API.getSheet('Actions') || [];

  const total = data.length;
  const openCount = data.filter(r => r.Status === 'Open').length;
  const inProgressCount = data.filter(r => r.Status === 'In Progress').length;

  let rows = '';
  data.forEach(entry => {
    const statusClass = Pages.statusBadgeClass(entry.Status);

    rows += `
      <tr>
        <td class="mono">${entry['Action ID'] || '—'}</td>
        <td class="cell-truncate">${entry.Title || '—'}</td>
        <td>${entry.Owner || '—'}</td>
        <td class="mono">${Pages.formatDate(entry.Deadline)}</td>
        <td><span class="badge ${statusClass}">${entry.Status || 'Open'}</span></td>
        <td class="mono">${entry['Linked Issue'] || '—'}</td>
      </tr>
    `;
  });

  if (!rows) {
    return App.getEmptyHTML('No actions yet', 'Action items will appear here once tracked in the spreadsheet.');
  }

  return `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Actions</h1>
      </div>
      <p class="page-subtitle">${total} actions • ${openCount} open, ${inProgressCount} in progress</p>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-label">Total</div>
        <div class="stat-card-value">${total}</div>
        <div class="stat-card-sub">all actions</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-card-label">Open</div>
        <div class="stat-card-value">${openCount}</div>
        <div class="stat-card-sub">not started</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-card-label">In Progress</div>
        <div class="stat-card-value">${inProgressCount}</div>
        <div class="stat-card-sub">actively working</div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Owner</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Linked Issue</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

// ============================================================
// TEAM PAGE
// ============================================================
Pages.team = async function () {
  const data = API.getSheet('Team') || [];

  if (!data.length) {
    return App.getEmptyHTML('No team contacts', 'Team members will appear here once added to the spreadsheet.');
  }

  let cards = '';
  data.forEach(member => {
    const badgeClass = Pages.companyBadgeClass(member.Company);
    const initials = Pages.initials(member.Name);

    cards += `
      <div class="team-card">
        <div class="team-card-header">
          <div class="team-avatar">${initials}</div>
          <div class="team-info">
            <div class="team-name">${member.Name || '—'}</div>
            <div class="team-role">${member.Role || '—'}</div>
          </div>
          <span class="${badgeClass}">${member.Company || '—'}</span>
        </div>
        <div class="team-card-body">
          ${member.Email ? `
            <div class="team-field">
              <span class="team-field-label">Email</span>
              <span class="team-field-value">
                <a href="mailto:${member.Email}">${member.Email}</a>
              </span>
            </div>
          ` : ''}
          ${member.Phone ? `
            <div class="team-field">
              <span class="team-field-label">Phone</span>
              <span class="team-field-value">${member.Phone}</span>
            </div>
          ` : ''}
          ${member['Site Area'] ? `
            <div class="team-field">
              <span class="team-field-label">Area</span>
              <span class="team-field-value">${member['Site Area']}</span>
            </div>
          ` : ''}
          ${member.Notes ? `
            <div class="team-field">
              <span class="team-field-label">Notes</span>
              <span class="team-field-value text-sm text-secondary">${member.Notes}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  return `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Team Contacts</h1>
      </div>
      <p class="page-subtitle">${data.length} team members</p>
    </div>

    <div class="filter-bar mb-4">
      <input type="text" class="search-input" id="teamSearch" placeholder="Search team members...">
    </div>

    <div class="team-grid" id="teamGrid">
      ${cards}
    </div>
  `;
};

// ============================================================
// ROTA PAGE
// ============================================================
Pages.rota = async function () {
  const data = API.getSheet('Rota') || [];
  const today = new Date().toISOString().split('T')[0];

  if (!data.length) {
    return App.getEmptyHTML('No rota data', 'Shift schedule will appear here once added to the spreadsheet.');
  }

  // Group by day
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daysData = {};
  dayOrder.forEach(d => { daysData[d] = {}; });

  data.forEach(entry => {
    const day = entry.Day;
    if (!daysData[day]) daysData[day] = {};
    const area = (entry.Area || 'other').toLowerCase();
    daysData[day][area] = {
      morning: entry.Morning || entry['Morning (06-14)'] || '',
      afternoon: entry.Afternoon || entry['Afternoon (14-22)'] || '',
      night: entry.Night || entry['Night (22-06)'] || '',
    };
  });

  let rows = '';
  dayOrder.forEach(day => {
    const dayEntries = daysData[day];
    const hasAnyData = Object.values(dayEntries).some(e => e.morning || e.afternoon || e.night);
    if (!hasAnyData) return;

    const isToday = dayEntries['north']?.morning || dayEntries['south']?.morning; // simplified check

    rows += `
      <div class="rota-row ${isToday ? 'today' : ''}">
        <div class="rota-day-cell">
          <span>${day}</span>
        </div>
        <div class="rota-shift-cell">
          <div class="rota-shift-label">Morning</div>
          ${dayEntries['north']?.morning ? `<div class="rota-person">${dayEntries['north'].morning}</div><span class="rota-area north">N</span>` : ''}
          ${dayEntries['south']?.morning ? `<div class="rota-person">${dayEntries['south'].morning}</div><span class="rota-area south">S</span>` : ''}
        </div>
        <div class="rota-shift-cell">
          <div class="rota-shift-label">Afternoon</div>
          ${dayEntries['north']?.afternoon ? `<div class="rota-person">${dayEntries['north'].afternoon}</div><span class="rota-area north">N</span>` : ''}
          ${dayEntries['south']?.afternoon ? `<div class="rota-person">${dayEntries['south'].afternoon}</div><span class="rota-area south">S</span>` : ''}
        </div>
        <div class="rota-shift-cell">
          <div class="rota-shift-label">Night</div>
          ${dayEntries['north']?.night ? `<div class="rota-person">${dayEntries['north'].night}</div><span class="rota-area north">N</span>` : ''}
          ${dayEntries['south']?.night ? `<div class="rota-person">${dayEntries['south'].night}</div><span class="rota-area south">S</span>` : ''}
        </div>
      </div>
    `;
  });

  return `
    <div class="page-header">
      <div class="page-header-top">
        <h1 class="page-title">Rota</h1>
      </div>
      <p class="page-subtitle">Week of ${data[0]?.Week || 'Current'}</p>
    </div>

    <div class="rota-grid">
      <div class="rota-header">
        <div class="rota-header-cell">Day</div>
        <div class="rota-header-cell">Morning 06–14</div>
        <div class="rota-header-cell">Afternoon 14–22</div>
        <div class="rota-header-cell">Night 22–06</div>
      </div>
      ${rows}
    </div>
  `;
};

// ============================================================
// INITIALIZE ON DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});