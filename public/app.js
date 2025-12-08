// Minimal SPA logic for Medical Records Viewer (doctor-only)
(function(){
  const pages = Array.from(document.querySelectorAll('.page'));
  const navBtns = Array.from(document.querySelectorAll('.nav-btn'));

  function show(id){
    // if attempting to view records while not logged in, redirect to login
    if (id === 'records' && !currentUser()) {
      // show login page and hint
      pages.forEach(p=> p.id==='login' ? p.classList.remove('hidden') : p.classList.add('hidden'));
      navBtns.forEach(b=> b.classList.toggle('active', b.dataset.route==='login'));
      const out = document.getElementById('login-out');
      if (out) out.textContent = 'Please log in to view medical records.';
      return;
    }
    pages.forEach(p=> p.id===id ? p.classList.remove('hidden') : p.classList.add('hidden'));
    navBtns.forEach(b=> b.classList.toggle('active', b.dataset.route===id));
    if (id === 'records') renderRecords();
  }

  function token(){ return localStorage.getItem('mrv_token'); }
  function currentUser(){ try { return JSON.parse(localStorage.getItem('mrv_user')||'null'); } catch(e){ return null; } }

  function updateUserStatus(){
    const usr = currentUser();
    const el = document.getElementById('user-status');
    const loginBtn = document.querySelector('.nav-btn[data-route="login"]');
    const logoutBtn = document.querySelector('.nav-btn[data-route="logout"]');
    if (usr) {
      if (el) el.textContent = (usr.name || usr) ? `Logged in as ${usr.name || (typeof usr === 'string' ? usr : '')}` : 'Logged in';
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
      if (el) el.textContent = 'Not logged in';
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  // Login handler (doctor only)
  async function loginSubmit(e){
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const doctor = formData.get('doctor');
    if (!doctor) return document.getElementById('login-out').textContent='Doctor name required';
    const body = { role: 'doctor', doctor };
    try {
      const res = await fetch('/api/auth/login', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body)});
      const j = await res.json();
      if (j.token) {
        localStorage.setItem('mrv_token', j.token);
        localStorage.setItem('mrv_user', JSON.stringify(j.doctor || j));
        document.getElementById('login-out').textContent = 'Logged in as ' + (j.doctor && j.doctor.name ? j.doctor.name : doctor);
        show('records');
      } else {
        document.getElementById('login-out').textContent = j.error || JSON.stringify(j);
      }
    } catch (err) {
      document.getElementById('login-out').textContent = 'Network error';
    }
  }

  async function renderRecords(){
    const out = document.getElementById('records-list');
    const controls = document.getElementById('records-controls');
    const usr = currentUser();
    const t = token();
    controls.innerHTML = '';
    out.textContent = 'Loading...';
    if (!usr) { out.textContent = 'Not logged in. Please login as doctor.'; return; }
    try {
      const res = await fetch('/api/doctors/records', {headers: t ? {'Authorization':'Bearer '+t} : {}});
      const data = await res.json();
      out.innerHTML = renderRecordsTable(data);
    } catch (err) {
      out.textContent = 'Failed to load records';
    }
  }

  function renderRecordsTable(list){
    if (!list || list.length === 0) return '<div>(no records)</div>';
    let html = '<table class="records"><thead><tr><th>ID</th><th>Patient</th><th>DOB</th><th>Conditions</th><th>Assignments</th><th>Last Visit</th></tr></thead><tbody>';
    for (const r of list) {
      const patient = r.patient || (r.patientId ? { name: '(unknown)', dob: '' } : null);
      const pname = patient ? patient.name : '';
      const pdob = patient ? patient.dob : '';
      const conds = Array.isArray(r.conditions) ? r.conditions.join(', ') : (r.conditions || '');
      const assigns = (r.assignments||[]).map(a=> (a.medication ? a.medication : (a.name || JSON.stringify(a)))).join('; ');
      html += `<tr><td>${r.id}</td><td>${pname||''}</td><td>${pdob||''}</td><td>${conds}</td><td>${assigns}</td><td>${r.lastVisit||''}</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
  }

  // Logout: clear auth and return to home
  function logout(){
    localStorage.removeItem('mrv_token');
    localStorage.removeItem('mrv_user');
    const out = document.getElementById('login-out');
    if (out) out.textContent = 'Logged out';
    updateUserStatus();
    show('home');
  }

  // Navigation: bind if elements exist
  navBtns.forEach(b => b.addEventListener('click', ()=>{
    const route = b.dataset.route;
    if (route === 'logout') return logout();
    show(route);
  }));

  const loginForm = document.getElementById('form-login');
  if (loginForm) loginForm.addEventListener('submit', loginSubmit);

  // initial
  updateUserStatus();
  show('home');
  window._mrv = { renderRecords, updateUserStatus };
})();
