/* ==========================================================================
   KANDÉ MOUSSA - CV Web Digital & Vitrine Professionnelle
   Logic Script ground in exact PDF CV data
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Switcher (Dark / Light Mode)
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('cv_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('cv_theme', newTheme);
      showToast(`Mode ${newTheme === 'dark' ? 'Sombre' : 'Clair'} activé`, 'info');
    });
  }

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'fa-solid fa-moon';
      } else {
        themeIcon.className = 'fa-solid fa-sun';
      }
    }
  }

  // 2. Header Scroll & Mobile Nav Menu
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
      const icon = mobileToggle ? mobileToggle.querySelector('i') : null;
      if (icon) icon.className = 'fa-solid fa-bars';
    });
  });

  // Active Link Highlight on Scroll
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // 3. Skills Filter & Progress Bar Animation
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      skillCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Animate skill bars when in view
  const skillsSection = document.getElementById('skills');
  let animatedSkills = false;

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedSkills) {
        skillBars.forEach(bar => {
          const progress = bar.getAttribute('data-progress');
          bar.style.width = progress;
        });
        animatedSkills = true;
      }
    });
  }, { threshold: 0.15 });

  if (skillsSection) skillsObserver.observe(skillsSection);

  // 4. Live CV Text Editor (Local Storage Persistence)
  const openEditorBtn = document.getElementById('open-editor-btn');
  const closeEditorBtn = document.getElementById('close-editor-btn');
  const editorDrawer = document.getElementById('editor-drawer');
  const saveEditorBtn = document.getElementById('save-editor-btn');
  const resetEditorBtn = document.getElementById('reset-editor-btn');

  // Input Fields
  const editName = document.getElementById('edit-name');
  const editTitle = document.getElementById('edit-title');
  const editAvailability = document.getElementById('edit-availability');
  const editSummary = document.getElementById('edit-summary');
  const editEmail = document.getElementById('edit-email');
  const editPhone = document.getElementById('edit-phone');
  const editLocation = document.getElementById('edit-location');

  // DOM Elements to Update
  const cvName = document.getElementById('cv-name');
  const cvTitle = document.getElementById('cv-title');
  const cvAvailability = document.getElementById('cv-availability');
  const cvSummary = document.getElementById('cv-summary');
  const cvContactEmail = document.getElementById('cv-contact-email');
  const cvContactPhone = document.getElementById('cv-contact-phone');
  const cvContactLocation = document.getElementById('cv-contact-location');
  const cvLogoName = document.getElementById('cv-logo-name');
  const footerName = document.getElementById('footer-name');

  loadSavedCVData();

  if (openEditorBtn && editorDrawer) {
    openEditorBtn.addEventListener('click', () => {
      editorDrawer.classList.add('open');
    });
  }

  if (closeEditorBtn && editorDrawer) {
    closeEditorBtn.addEventListener('click', () => {
      editorDrawer.classList.remove('open');
    });
  }

  if (saveEditorBtn) {
    saveEditorBtn.addEventListener('click', () => {
      const cvData = {
        name: editName ? editName.value : '',
        title: editTitle ? editTitle.value : '',
        availability: editAvailability ? editAvailability.value : '',
        summary: editSummary ? editSummary.value : '',
        email: editEmail ? editEmail.value : '',
        phone: editPhone ? editPhone.value : '',
        location: editLocation ? editLocation.value : ''
      };

      localStorage.setItem('kande_moussa_cv_data', JSON.stringify(cvData));
      updateDOMWithCVData(cvData);
      if (editorDrawer) editorDrawer.classList.remove('open');
      showToast('Informations du CV enregistrées avec succès !', 'success');
    });
  }

  if (resetEditorBtn) {
    resetEditorBtn.addEventListener('click', () => {
      localStorage.removeItem('kande_moussa_cv_data');
      const defaultData = {
        name: 'KANDÉ MOUSSA',
        title: 'QSE / HSE Officer – Systèmes de Management Intégrés',
        availability: 'Dakar, Sénégal | Disponible pour opportunités QSE/HSE',
        summary: "QHSE officer avec une expérience terrain confirmée en environnement industriel (industrie métallurgique) et bancaire. Spécialisé dans le déploiement et le maintien de Systèmes de Management Intégrés (SMI), la réalisation de DUER et plans de prévention, la conduite d'audits internes, la veille réglementaire et la gestion des indicateurs SST (taux de fréquence, taux de gravité). Certifié ISO 9001 Lead Auditor et Lean Six Sigma Green Belt, avec une culture de la sécurité durable et une approche orientée amélioration continue.",
        email: 'dekan.moussa2@gmail.com',
        phone: '+221 78 146 66 26',
        location: 'Dakar, Sénégal'
      };

      if (editName) editName.value = defaultData.name;
      if (editTitle) editTitle.value = defaultData.title;
      if (editAvailability) editAvailability.value = defaultData.availability;
      if (editSummary) editSummary.value = defaultData.summary;
      if (editEmail) editEmail.value = defaultData.email;
      if (editPhone) editPhone.value = defaultData.phone;
      if (editLocation) editLocation.value = defaultData.location;

      updateDOMWithCVData(defaultData);
      showToast('Informations réinitialisées aux valeurs du CV officiel', 'info');
    });
  }

  function loadSavedCVData() {
    const saved = localStorage.getItem('kande_moussa_cv_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (editName) editName.value = data.name || editName.value;
        if (editTitle) editTitle.value = data.title || editTitle.value;
        if (editAvailability) editAvailability.value = data.availability || editAvailability.value;
        if (editSummary) editSummary.value = data.summary || editSummary.value;
        if (editEmail) editEmail.value = data.email || editEmail.value;
        if (editPhone) editPhone.value = data.phone || editPhone.value;
        if (editLocation) editLocation.value = data.location || editLocation.value;

        updateDOMWithCVData(data);
      } catch (e) {
        console.error('Erreur chargement données sauvegardées:', e);
      }
    }
  }

  function updateDOMWithCVData(data) {
    if (data.name) {
      if (cvName) cvName.textContent = data.name;
      if (cvLogoName) cvLogoName.textContent = data.name.toUpperCase();
      if (footerName) footerName.textContent = data.name;
    }
    if (data.title && cvTitle) cvTitle.innerHTML = `<i class="fa-solid fa-award"></i> ${data.title}`;
    if (data.availability && cvAvailability) cvAvailability.textContent = data.availability;
    if (data.summary && cvSummary) cvSummary.textContent = data.summary;
    if (data.email && cvContactEmail) cvContactEmail.textContent = data.email;
    if (data.phone && cvContactPhone) cvContactPhone.textContent = data.phone;
    if (data.location && cvContactLocation) cvContactLocation.textContent = data.location;
  }

  // 5. Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Merci ! Votre message a été transmis avec succès.', 'success');
      contactForm.reset();
    });
  }

  // 6. Export PDF / Print Trigger
  const btnExportPdf = document.getElementById('btn-export-pdf');
  if (btnExportPdf) {
    btnExportPdf.addEventListener('click', () => {
      showToast('Préparation de l\'exportation PDF du CV...', 'info');
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }

  // 7. Toast Utility
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'info') iconClass = 'fa-solid fa-circle-info';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `<i class="${iconClass}" style="color: var(--accent-primary);"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-30px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }
});
