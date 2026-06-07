/**
 * Blue Dale Construction — Main Script (Firebase-Integrated)
 * All page content is loaded dynamically from Firestore.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupPreloader();
  setupNavigation();
  setupMobileMenu();
  setActiveNavLink();

  // Detect which page we are on and load appropriate data
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === '' || page === 'index.html') {
    loadHomePageData();
  } else if (page === 'about.html') {
    loadAboutPageData();
  } else if (page === 'services.html') {
    loadServicesPageData();
  } else if (page === 'works.html') {
    loadWorksPageData();
  } else if (page === 'contact.html') {
    loadContactPageData();
    setupContactForm();
  }
});


// ============================================================
// CORE UI — runs on every page
// ============================================================

function setupPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      initScrollReveals();
    }, 600);
  });
  // Safety fallback
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add('fade-out');
      initScrollReveals();
    }
  }, 3000);
}

function setupNavigation() {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll);
  onScroll();
}

function setupMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    const [s1, s2, s3] = toggle.querySelectorAll('span');
    if (menu.classList.contains('active')) {
      s1.style.transform = 'rotate(45deg) translate(5px, 5px)';
      s2.style.opacity   = '0';
      s3.style.transform = 'rotate(-45deg) translate(7px, -8px)';
    } else {
      s1.style.transform = s3.style.transform = 'none';
      s2.style.opacity = '1';
    }
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      const [s1, s2, s3] = toggle.querySelectorAll('span');
      s1.style.transform = s3.style.transform = 'none';
      s2.style.opacity = '1';
    });
  });
}

function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active',
      (page === '' && href === 'index.html') || page === href
    );
  });
}

function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('reveal-visible'));
    return;
  }
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => obs.observe(el));
}

function animateCounters() {
  document.querySelectorAll('.counter-num').forEach(counter => {
    const target   = parseInt(counter.getAttribute('data-target'), 10);
    const suffix   = counter.getAttribute('data-suffix') || '';
    let current    = 0;
    const steps    = 60;
    const stepVal  = target / steps;
    const timer    = setInterval(() => {
      current += stepVal;
      if (current >= target) {
        counter.innerText = target + suffix;
        clearInterval(timer);
      } else {
        counter.innerText = Math.floor(current) + suffix;
      }
    }, 1500 / steps);
  });
}

function showPublicToast(message) {
  const old = document.getElementById('publicToast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'publicToast';
  t.style.cssText = [
    'position:fixed;bottom:20px;right:20px;',
    'background:#0b1a30;color:#fff;',
    'padding:15px 25px;border-radius:8px;',
    'border-left:4px solid #d4af37;',
    'z-index:9999;font-family:Inter,sans-serif;font-size:0.95rem;',
    'box-shadow:0 10px 25px rgba(0,0,0,0.2);',
    'transform:translateY(100px);opacity:0;transition:all 0.4s ease;'
  ].join('');
  t.innerText = message;
  document.body.appendChild(t);
  setTimeout(() => { t.style.transform = 'translateY(0)'; t.style.opacity = '1'; }, 50);
  setTimeout(() => {
    t.style.transform = 'translateY(100px)'; t.style.opacity = '0';
    setTimeout(() => t.remove(), 400);
  }, 3500);
}


// ============================================================
// DATA FETCHERS  (Firebase live OR localStorage demo fallback)
// ============================================================

function getAboutData(cb) {
  if (window.firebaseEnabled && window.db) {
    window.db.collection('settings').doc('about').get()
      .then(doc => cb(doc.exists ? doc.data() : getFallbackAbout()))
      .catch(() => cb(getFallbackAbout()));
  } else {
    const saved = localStorage.getItem('bd_about');
    cb(saved ? JSON.parse(saved) : getFallbackAbout());
  }
}

function getServicesData(cb) {
  if (window.firebaseEnabled && window.db) {
    window.db.collection('services').get()
      .then(snap => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        cb(list.length ? list : getFallbackServices());
      })
      .catch(() => cb(getFallbackServices()));
  } else {
    const saved = localStorage.getItem('bd_services');
    cb(saved ? JSON.parse(saved) : getFallbackServices());
  }
}

function getWorksData(cb) {
  if (window.firebaseEnabled && window.db) {
    window.db.collection('works').get()
      .then(snap => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        cb(list.length ? list : getFallbackWorks());
      })
      .catch(() => cb(getFallbackWorks()));
  } else {
    const saved = localStorage.getItem('bd_works');
    cb(saved ? JSON.parse(saved) : getFallbackWorks());
  }
}


// ============================================================
// FALLBACK DATA  (shown before Firebase loads or in demo mode)
// ============================================================

function getFallbackAbout() {
  return {
    story: "Founded over a decade ago, Blue Dale Construction began with a simple vision: to design and build structures that offer both structural safety and elegant architectural beauty. Today, we are recognized as one of the leading construction agencies, catering to both residential homeowners and corporate developers.",
    experience: 12,
    projectsCompleted: 250,
    email: "shakthiarasu@gmail.com",
    phone: "+91 88380 37125",
    whatsapp: "919345827074",
    instagram: "https://www.instagram.com/bluedaleconstructions?igsh=bmR3aHUxeHY4am5m",
    address: "Blue Dale Constructions, No-4 Telugu Bramana Street, Gandhipark, Coimbatore - 641001, Tamil Nadu, India",
    hours: "Monday - Saturday: 9:00 AM - 6:00 PM"
  };
}

function getFallbackServices() {
  return [
    { id: "s1", title: "Residential Build",    icon: "fa-home",        description: "Creating spectacular custom homes, luxury villas, and contemporary apartments tailored to modern lifestyles.",    features: "Custom Luxury Villas & Bungalows\nHigh-Rise Apartment Blocks\nEco-Friendly Smart Residences\nDuplex & Multi-Family Houses" },
    { id: "s2", title: "Commercial Dev",        icon: "fa-building",    description: "Constructing sleek, efficient business hubs, retail malls, showrooms, and industrial structures.",              features: "State-of-the-Art Office Parks\nRetail Outlets & Showrooms\nHigh-End Restaurants & Hotels\nStructural Steel Complexes" },
    { id: "s3", title: "Renovations",           icon: "fa-tools",       description: "Transforming outdated structures with modern retrofitting, structural repairs, and high-end finishing.",          features: "Modern Kitchen & Bath Remodels\nStructural Retrofitting & Repairs\nCommercial Office Redesigns\nExterior Facade Upgrades" },
    { id: "s4", title: "Architectural Design",  icon: "fa-pencil-ruler", description: "High-precision 2D drafts, 3D renders, and zoning layout planning to bring your project concept to life.",    features: "3D Elevation & Walkthrough Renders\nMunicipal Approvals & Permits\nStructural Engineering Blueprints\nBudget Estimation & Cost Sheets" }
  ];
}

function getFallbackWorks() {
  return [
    { id: "w1", name: "The Horizon Villa",   year: 2024, category: "residential", location: "Green Valley Suburbs", description: "A premium double-story custom residential villa built with modern glass facades and wooden panel cladding.",                       imageUrl: "assets/work_villa.png" },
    { id: "w2", name: "Apex Business Hub",   year: 2023, category: "commercial",  location: "Tech Park Central",    description: "A modern state-of-the-art office corporate complex featuring sleek structural glass curtain walls and steel framings.",          imageUrl: "assets/work_commercial.png" },
    { id: "w3", name: "Skyline Residency",   year: 2025, category: "residential", location: "North Ridge Blvd",     description: "A luxury mid-rise apartment complex featuring private botanical balconies and architectural lighting.",                           imageUrl: "assets/work_apartment.png" },
    { id: "w4", name: "Maple Wood Estate",   year: 2024, category: "renovations", location: "Maple Wood Suburbs",   description: "Complete exterior and interior makeover of a suburban family residence with structural frame updates and modern cladding.",        imageUrl: "assets/work_residence.png" }
  ];
}


// ============================================================
// PAGE: HOME  (index.html)
// ============================================================

function loadHomePageData() {
  // Update stats counters from database
  getAboutData(data => {
    document.querySelectorAll('.counter-num').forEach(el => {
      const t = el.getAttribute('data-target');
      if (t === '250' && data.projectsCompleted) el.setAttribute('data-target', data.projectsCompleted);
      if (t === '12'  && data.experience)         el.setAttribute('data-target', data.experience);
    });
  });

  // Animate counters on scroll
  const statsSection = document.querySelector('.stats-grid, .intro-badge');
  if (statsSection && 'IntersectionObserver' in window) {
    let fired = false;
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    obs.observe(statsSection);
  }

  // Load 2 featured works
  const grid = document.getElementById('featuredWorksGrid');
  if (!grid) return;
  getWorksData(works => {
    grid.innerHTML = '';
    works.slice(0, 2).forEach((w, i) => {
      const card = document.createElement('div');
      card.className = `portfolio-card reveal ${i === 0 ? 'reveal-left' : 'reveal-right'}`;
      card.innerHTML = `
        <img src="${w.imageUrl || 'assets/work_villa.png'}" alt="${w.name}" class="portfolio-img" onerror="this.src='assets/work_villa.png'">
        <div class="portfolio-overlay">
          <span class="portfolio-year">Completed: ${w.year}</span>
          <h3 class="portfolio-name">${w.name}</h3>
          <p class="portfolio-desc">${w.description}</p>
          <a href="works.html" class="portfolio-link">View Details <i class="fas fa-arrow-right"></i></a>
        </div>`;
      grid.appendChild(card);
    });
    initScrollReveals();
  });
}


// ============================================================
// PAGE: ABOUT  (about.html)
// ============================================================

function loadAboutPageData() {
  getAboutData(data => {
    if (!data) return;

    setText('aboutStoryText', data.story);

    // Experience badge counter
    const exp = document.getElementById('experienceCounter');
    if (exp) {
      exp.setAttribute('data-target', data.experience || 12);
      exp.innerText = (data.experience || 12) + '+';
    }

    // Contact channel cards
    setAttr('channelEmailLink',      'href', 'mailto:' + data.email);
    setText('channelEmailText',      data.email);
    setAttr('channelPhoneLink',      'href', 'tel:' + (data.phone || '').replace(/\s/g, ''));
    setText('channelPhoneText',      data.phone);
    setAttr('channelWhatsappLink',   'href', 'https://wa.me/' + data.whatsapp);
    setAttr('channelInstagramLink',  'href', getInstagramUrl(data.instagram));
    setText('channelInstagramText',  getInstagramLabel(data.instagram));
  });
}


// ============================================================
// PAGE: SERVICES  (services.html)
// ============================================================

function loadServicesPageData() {
  const grid = document.getElementById('servicesDetailedGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="text-align:center;padding:60px;grid-column:1/-1;">
      <i class="fas fa-spinner fa-spin" style="font-size:2.5rem;color:#d4af37;"></i>
      <p style="margin-top:15px;color:#64748b;">Loading services...</p>
    </div>`;

  getServicesData(services => {
    grid.innerHTML = '';
    services.forEach((srv, index) => {
      const features = (srv.features || '').split('\n').filter(f => f.trim());
      const isEven   = index % 2 === 0;
      const row      = document.createElement('div');
      row.className  = 'service-detailed-row';
      row.innerHTML  = `
        <div class="service-detailed-image reveal ${isEven ? 'reveal-left' : 'reveal-right'}">
          <div style="background:linear-gradient(135deg,#0b1a30 0%,#162a4d 100%);height:300px;border-radius:12px;display:flex;align-items:center;justify-content:center;">
            <i class="fas ${srv.icon}" style="font-size:5rem;color:#d4af37;opacity:0.85;"></i>
          </div>
        </div>
        <div class="service-detailed-text reveal ${isEven ? 'reveal-right' : 'reveal-left'}">
          <h3><i class="fas ${srv.icon}"></i> ${srv.title}</h3>
          <p>${srv.description}</p>
          <ul class="service-features-list">
            ${features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
          </ul>
        </div>`;
      grid.appendChild(row);
    });
    initScrollReveals();
  });
}


// ============================================================
// PAGE: WORKS  (works.html)
// ============================================================

function loadWorksPageData() {
  const grid = document.getElementById('worksGridAll');
  if (!grid) return;

  grid.innerHTML = `
    <div style="text-align:center;padding:80px;grid-column:1/-1;">
      <i class="fas fa-spinner fa-spin" style="font-size:2.5rem;color:#d4af37;"></i>
      <p style="margin-top:15px;color:#64748b;">Loading projects...</p>
    </div>`;

  getWorksData(works => {
    grid.innerHTML = '';
    works.forEach(w => {
      const card = document.createElement('div');
      card.className = 'portfolio-card reveal reveal-scale';
      card.setAttribute('data-category', w.category || 'residential');
      card.style.height = '400px';
      card.innerHTML = `
        <img src="${w.imageUrl || 'assets/work_villa.png'}" alt="${w.name}" class="portfolio-img" onerror="this.src='assets/work_villa.png'">
        <div class="portfolio-overlay" style="opacity:1;transform:translateY(0);background:linear-gradient(to top,rgba(11,26,48,0.98) 15%,rgba(11,26,48,0.5) 60%,rgba(11,26,48,0.15) 100%);">
          <span class="portfolio-year"><i class="far fa-calendar-alt"></i> Year Completed: ${w.year}</span>
          <h3 class="portfolio-name">${w.name}</h3>
          <p class="portfolio-desc">${w.description}</p>
          <span style="color:var(--accent);font-weight:500;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;">
            <i class="fas fa-map-marker-alt"></i> ${w.location}
          </span>
        </div>`;
      grid.appendChild(card);
    });
    initScrollReveals();
    setupPortfolioFilter();
  });
}

function setupPortfolioFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('#worksGridAll .portfolio-card').forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        if (match) {
          card.style.display = 'block';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.85)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}


// ============================================================
// PAGE: CONTACT  (contact.html)
// ============================================================

function loadContactPageData() {
  getAboutData(data => {
    if (!data) return;
    setAttr('contactInfoEmail',      'href', 'mailto:' + data.email);
    setText('contactInfoEmailText',  data.email);
    setAttr('contactInfoPhone',      'href', 'tel:' + (data.phone || '').replace(/\s/g, ''));
    setText('contactInfoPhoneText',  data.phone);
    setAttr('contactInfoWhatsapp',   'href', 'https://wa.me/' + data.whatsapp);
    setText('contactInfoAddress',    data.address);
    setText('contactInfoHours',      data.hours);
  });
}

function setupContactForm() {
  const form = document.getElementById('projectContactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const submitBtn  = form.querySelector('button[type="submit"]');
    const origHTML   = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    const payload = {
      name:        document.getElementById('fullName')?.value       || '',
      email:       document.getElementById('emailAddr')?.value      || '',
      phone:       document.getElementById('phoneNum')?.value       || '',
      projectType: document.getElementById('projectType')?.value    || '',
      budget:      document.getElementById('budgetRange')?.value    || '',
      details:     document.getElementById('projectDetails')?.value || '',
      timestamp:   new Date().toISOString()
    };

    if (window.firebaseEnabled && window.db) {
      window.db.collection('inquiries').add({
        ...payload,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => showFormSuccess(form))
      .catch(err => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHTML;
        alert('Error submitting form. Please try again.\n' + err.message);
      });
    } else {
      // Demo mode — save to localStorage so admin can see it
      const list = JSON.parse(localStorage.getItem('bd_inquiries') || '[]');
      payload.id = 'inq_' + Date.now();
      list.push(payload);
      localStorage.setItem('bd_inquiries', JSON.stringify(list));
      setTimeout(() => showFormSuccess(form), 1000);
    }
  });
}

function showFormSuccess(form) {
  form.innerHTML = `
    <div style="text-align:center;padding:40px 20px;">
      <i class="fas fa-check-circle" style="font-size:5rem;color:#d4af37;margin-bottom:25px;display:inline-block;"></i>
      <h3 style="font-family:'Playfair Display',serif;font-size:2.2rem;color:#0b1a30;margin-bottom:15px;">Inquiry Submitted!</h3>
      <p style="color:#64748b;font-size:1.1rem;max-width:500px;margin:0 auto 25px auto;">
        We have received your project consultation request. A specialist from Blue Dale Construction will reach out within 24 hours.
      </p>
      <button class="btn btn-primary" onclick="window.location.reload()">Send Another Request</button>
    </div>`;
}


// ============================================================
// DOM HELPERS
// ============================================================

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.innerText = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value) el.setAttribute(attr, value);
}

function getInstagramUrl(value) {
  if (!value) return 'https://www.instagram.com/bluedaleconstructions?igsh=bmR3aHUxeHY4am5m';
  if (value.startsWith('http')) return value;
  return 'https://www.instagram.com/' + value.replace(/^@/, '');
}

function getInstagramLabel(value) {
  if (!value) return 'Blue Dale Construction';
  if (value.startsWith('http')) return 'Blue Dale Construction';
  return '@' + value.replace(/^@/, '');
}
