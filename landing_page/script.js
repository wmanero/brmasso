// Landing page — navegação, carrosséis e WhatsApp

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initHeader();
  initMobileNav();
  initCarousels();
  initWhatsAppForm();
  initReveal();
});

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    document.body.style.overflow = '';
  };

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    nav.classList.add('open');
    document.body.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initCarousels() {
  initServicesCatalog();
  setupTestimonialsCarousel();
}

function initServicesCatalog() {
  const data = window.BR_SERVICES;
  if (!data?.categories?.length || !data?.items?.length) return;

  const tabsEl = document.getElementById('servicesTabs');
  const cardsEl = document.getElementById('servicesCards');
  const categoryTitle = document.getElementById('servicesCategoryTitle');
  const categoryDesc = document.getElementById('servicesCategoryDesc');
  const drawer = document.getElementById('serviceDrawer');
  const drawerPanel = drawer?.querySelector('.service-drawer__panel');

  if (!tabsEl || !cardsEl || !drawer) return;

  let activeCategory = data.categories[0].id;
  let activeService = null;
  const tecnicaSelect = document.getElementById('tecnica');

  const countByCategory = (id) => data.items.filter((item) => item.category === id).length;

  tabsEl.setAttribute('role', 'tablist');

  data.categories.forEach((cat, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `services-tab${index === 0 ? ' is-active' : ''}`;
    btn.dataset.category = cat.id;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    btn.textContent = `${cat.label} (${countByCategory(cat.id)})`;
    btn.addEventListener('click', () => setCategory(cat.id));
    tabsEl.appendChild(btn);
  });

  function setCategory(id) {
    activeCategory = id;
    tabsEl.querySelectorAll('.services-tab').forEach((tab) => {
      const isActive = tab.dataset.category === id;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const cat = data.categories.find((c) => c.id === id);
    if (cat) {
      categoryTitle.textContent = cat.label;
      categoryDesc.textContent = cat.description;
    }

    renderCards(id);
  }

  function renderCards(categoryId) {
    const items = data.items.filter((item) => item.category === categoryId);
    cardsEl.innerHTML = '';

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'service-tile';
      btn.setAttribute('role', 'listitem');
      btn.dataset.serviceId = item.id;
      btn.innerHTML = `
        <img class="service-tile__thumb" src="${item.img}" alt="${item.title}" loading="lazy" width="110" height="110" />
        <span class="service-tile__body">
          <span class="service-tile__name">${item.title}</span>
          <span class="service-tile__tagline">${item.tagline}</span>
        </span>
        <span class="service-tile__arrow" aria-hidden="true">→</span>
      `;
      btn.addEventListener('click', () => openDrawer(item));
      cardsEl.appendChild(btn);
    });
  }

  function prefillTecnica(title) {
    if (!tecnicaSelect || !title) return false;

    const hasOption = Array.from(tecnicaSelect.options).some((opt) => opt.value === title);
    if (!hasOption) return false;

    tecnicaSelect.value = title;
    const group = tecnicaSelect.closest('.form-group');
    group?.classList.add('is-prefilled');
    setTimeout(() => group?.classList.remove('is-prefilled'), 2500);
    return true;
  }

  function openDrawer(item) {
    activeService = item;
    const img = document.getElementById('serviceDrawerImg');
    const tagline = document.getElementById('serviceDrawerTagline');
    const title = document.getElementById('serviceDrawerTitle');
    const desc = document.getElementById('serviceDrawerDesc');
    const duration = document.getElementById('serviceDrawerDuration');
    const priceWrap = document.getElementById('serviceDrawerPriceWrap');
    const price = document.getElementById('serviceDrawerPrice');
    const benefits = document.getElementById('serviceDrawerBenefits');

    img.src = item.img;
    img.alt = item.title;
    tagline.textContent = item.tagline;
    title.textContent = item.title;
    desc.textContent = item.description;
    duration.textContent = item.duration;

    if (item.price) {
      priceWrap.hidden = false;
      price.textContent = item.price;
    } else {
      priceWrap.hidden = true;
    }

    benefits.innerHTML = item.benefits.map((b) => `<li>${b}</li>`).join('');

    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      drawer.classList.add('is-open');
      document.body.classList.add('service-drawer-open');
      drawerPanel?.focus();
    });
  }

  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;

    drawer.classList.remove('is-open');
    document.body.classList.remove('service-drawer-open');
    drawer.setAttribute('aria-hidden', 'true');

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      drawer.hidden = true;
    };

    drawerPanel?.addEventListener(
      'transitionend',
      (e) => {
        if (e.target === drawerPanel && e.propertyName === 'transform') finish();
      },
      { once: true }
    );
    setTimeout(finish, 450);
  }

  drawer.querySelectorAll('[data-drawer-close]').forEach((el) => {
    el.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  document.getElementById('serviceDrawerCta')?.addEventListener('click', () => {
    if (activeService) prefillTecnica(activeService.title);
    closeDrawer();
  });

  setCategory(activeCategory);
}

function setupCarousel(id, options = {}) {
  const carousel = document.getElementById(id);
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dotsContainer = options.dotsId ? document.getElementById(options.dotsId) : null;

  let index = 0;
  let autoTimer = null;

  if (dotsContainer && slides.length > 1) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? Array.from(dotsContainer.children) : [];

  function goTo(i) {
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
    dots.forEach((d, j) => d.classList.toggle('active', j === index));
  }

  function next() {
    goTo((index + 1) % slides.length);
  }

  function startAuto() {
    if (!options.autoPlay || slides.length <= 1) return;
    stopAuto();
    autoTimer = setInterval(next, options.delay || 4000);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  prevBtn?.addEventListener('click', () => {
    if (index > 0) goTo(index - 1);
  });
  nextBtn?.addEventListener('click', () => {
    if (index < slides.length - 1) goTo(index + 1);
  });

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  goTo(0);
  startAuto();
}

function setupTestimonialsCarousel() {
  const carousel = document.getElementById('testimonialsCarousel');
  const track = document.getElementById('testimonialsTrack');
  if (!carousel || !track) return;

  const viewport = carousel.querySelector('.carousel-testimonials__viewport');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  let index = 0;
  let autoTimer = null;
  let controlsReady = false;

  const getSlideWidth = () => {
    const el = viewport || carousel;
    return el.getBoundingClientRect().width;
  };

  function syncSlideWidths() {
    const width = getSlideWidth();
    Array.from(track.children).forEach((slide) => {
      slide.style.flex = `0 0 ${width}px`;
      slide.style.width = `${width}px`;
      slide.style.maxWidth = `${width}px`;
    });
  }

  function parseReviewsText(data) {
    return data
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|');
        const author = parts[0]?.trim() || 'Cliente';
        const stars = parseInt(parts[1], 10) || 0;
        const text = parts.slice(2).join('|').trim();
        return { author, stars, text };
      })
      .filter((review) => review.stars === 5 && review.text);
  }

  async function loadReviews() {
    let reviews = Array.isArray(window.BR_REVIEWS)
      ? window.BR_REVIEWS.filter((r) => r.stars === 5)
      : [];

    if (!reviews.length && window.location.protocol !== 'file:') {
      try {
        const url = new URL('reviews.txt', window.location.href).href;
        const response = await fetch(url);
        if (response.ok) {
          reviews = parseReviewsText(await response.text());
        }
      } catch (error) {
        console.warn('Não foi possível carregar reviews.txt:', error);
      }
    }

    if (!reviews.length) {
      track.innerHTML =
        '<div class="carousel-item"><p class="testimonial-loading">Não foi possível carregar as avaliações.</p></div>';
      return;
    }

    renderReviews(reviews);
  }

  function renderReviews(reviews) {
    track.innerHTML = '';
    if (!reviews.length) {
      track.innerHTML =
        '<div class="carousel-item"><p class="testimonial-loading">Nenhuma avaliação 5 estrelas encontrada.</p></div>';
      return;
    }

    reviews.forEach((review) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      item.innerHTML = `
        <div class="testimonial-card">
          <div class="testimonial-stars" aria-label="${review.stars} estrelas">${'★'.repeat(review.stars)}</div>
          <p class="testimonial-text">"${review.text}"</p>
          <p class="testimonial-author">— ${review.author}</p>
        </div>
      `;
      track.appendChild(item);
    });

    initControls();
  }

  function goTo(i) {
    const slides = track.children;
    if (!slides.length) return;
    syncSlideWidths();
    index = i;
    const offset = getSlideWidth() * index;
    track.style.transform = `translateX(-${offset}px)`;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
  }

  function initControls() {
    const slides = track.children;
    if (slides.length <= 1) {
      prevBtn?.style.setProperty('display', 'none');
      nextBtn?.style.setProperty('display', 'none');
      return;
    }

    prevBtn?.style.removeProperty('display');
    nextBtn?.style.removeProperty('display');

    requestAnimationFrame(() => goTo(index));

    if (!controlsReady) {
      prevBtn?.addEventListener('click', () => {
        if (index > 0) goTo(index - 1);
      });
      nextBtn?.addEventListener('click', () => {
        const slidesCount = track.children.length;
        if (index < slidesCount - 1) goTo(index + 1);
      });

      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', () => {
        stopAuto();
        startAuto();
      });

      window.addEventListener('resize', () => goTo(index));

      const touchTarget = viewport || carousel;
      let touchStartX = 0;
      touchTarget.addEventListener(
        'touchstart',
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );
      touchTarget.addEventListener(
        'touchend',
        (e) => {
          const diff = e.changedTouches[0].screenX - touchStartX;
          if (Math.abs(diff) < 50) return;
          const slidesCount = track.children.length;
          if (diff < 0 && index < slidesCount - 1) goTo(index + 1);
          if (diff > 0 && index > 0) goTo(index - 1);
        },
        { passive: true }
      );

      controlsReady = true;
    }

    startAuto();
  }

  function startAuto() {
    stopAuto();
    const slides = track.children;
    if (slides.length <= 1) return;
    autoTimer = setInterval(() => {
      const next = (index + 1) % slides.length;
      goTo(next);
    }, 6000);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  loadReviews();
}

function initWhatsAppForm() {
  const form = document.getElementById('whatsappForm');
  if (!form) return;

  const whatsappNumber = '5511996033110';

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome')?.value.trim() || '';
    const telefone = document.getElementById('telefone')?.value.trim() || '';
    const tecnica = document.getElementById('tecnica')?.value.trim() || 'Não informada';
    const mensagem = document.getElementById('mensagem')?.value.trim() || '';

    const text = [
      'Olá! Gostaria de agendar uma sessão no Espaço Bárbara Rodrigues.',
      '',
      `Nome: ${nome}`,
      `WhatsApp: ${telefone}`,
      `Técnica de interesse: ${tecnica}`,
      `Mensagem: ${mensagem}`,
    ].join('\n');

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

function initReveal() {
  const targets = document.querySelectorAll(
    '.pillar-card, .section-head, .about-grid, .cta-banner-inner, .contact-grid, .testimonial-card'
  );

  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}
