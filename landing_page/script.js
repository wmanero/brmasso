// script.js - Carousel and WhatsApp scheduling behavior

document.addEventListener('DOMContentLoaded', () => {
  // Testimonials carousel
  const testimonialCarousel = document.getElementById('testimonialsCarousel');
  if (testimonialCarousel) {
    const tTrack = testimonialCarousel.querySelector('.carousel-track');
    const tPrevBtn = testimonialCarousel.querySelector('.carousel-btn.prev');
    const tNextBtn = testimonialCarousel.querySelector('.carousel-btn.next');
    let tIndex = 0;
    let autoInterval;

    async function loadReviews() {
      try {
        const response = await fetch('reviews.txt');
        const data = await response.text();
        const lines = data.split('\n').filter(line => line.trim() !== '');

        const parsedReviews = lines.map(line => {
          const parts = line.split('|');
          const [author, stars, text] = parts;
          return { author, stars: parseInt(stars), text };
        });

        renderReviews(parsedReviews);
      } catch (error) {
        console.error("Erro ao carregar depoimentos:", error);
        tTrack.innerHTML = '<p class="testimonial-text">Erro ao carregar avaliações.</p>';
      }
    }

    function renderReviews(reviews) {
      tTrack.innerHTML = '';
      if (!reviews || reviews.length === 0) return;

      reviews.forEach(review => {
        const item = document.createElement('div');
        item.className = 'carousel-item testimonial-item';
        item.innerHTML = `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(review.stars)}</div>
            <p class="testimonial-text">"${review.text}"</p>
            <p class="testimonial-author">— ${review.author}</p>
          </div>
        `;
        tTrack.appendChild(item);
      });
      initTestimonialCarousel();
    }

    function moveTestimonial(idx) {
      tTrack.style.transform = `translateX(-${idx * 100}%)`;
      tIndex = idx;
      tPrevBtn.disabled = idx === 0;
      tNextBtn.disabled = idx === tTrack.children.length - 1;
    }

    function initTestimonialCarousel() {
      const slides = Array.from(tTrack.children);
      moveTestimonial(0);
      tPrevBtn.addEventListener('click', () => { if (tIndex > 0) moveTestimonial(tIndex - 1); });
      tNextBtn.addEventListener('click', () => { if (tIndex < slides.length - 1) moveTestimonial(tIndex + 1); });
      const autoDelay = 5000;
      let auto = setInterval(() => {
        const next = (tIndex + 1) % slides.length;
        moveTestimonial(next);
      }, autoDelay);
      testimonialCarousel.addEventListener('mouseenter', () => clearInterval(auto));
      testimonialCarousel.addEventListener('mouseleave', () => {
        auto = setInterval(() => {
          const next = (tIndex + 1) % slides.length;
          moveTestimonial(next);
        }, autoDelay);
      });
    }

    renderReviews();
  }


  const techCarousel = document.getElementById('techCarousel');
  if (techCarousel) {
    const track = techCarousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const prevBtn = techCarousel.querySelector('.carousel-btn.prev');
    const nextBtn = techCarousel.querySelector('.carousel-btn.next');
    let currentIndex = 0;
    const moveToSlide = (index) => {
      track.style.transform = `translateX(-${index * 100}%)`;
      currentIndex = index;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === slides.length - 1;
    };
    prevBtn.addEventListener('click', () => { if (currentIndex > 0) moveToSlide(currentIndex - 1); });
    nextBtn.addEventListener('click', () => { if (currentIndex < slides.length - 1) moveToSlide(currentIndex + 1); });
    const autoPlayDelay = 3000;
    let autoPlay = null;
    const startAutoPlay = () => { if (autoPlay) return; autoPlay = setInterval(() => { const next = (currentIndex + 1) % slides.length; moveToSlide(next); }, autoPlayDelay); };
    const stopAutoPlay = () => { if (!autoPlay) return; clearInterval(autoPlay); autoPlay = null; };
    techCarousel.addEventListener('mouseenter', stopAutoPlay);
    techCarousel.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  const whatsappForm = document.getElementById('whatsappForm');
  if (!whatsappForm) return;

  // Use country code + number only (Brazil example below). Replace with the clinic's real number.
  const whatsappNumber = '5511996033110';

  whatsappForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome')?.value.trim() || '';
    const telefone = document.getElementById('telefone')?.value.trim() || '';
    const tecnica = document.getElementById('tecnica')?.value.trim() || 'Não informada';
    const mensagem = document.getElementById('mensagem')?.value.trim() || '';

    const text = [
      'Olá! Quero agendar uma sessão.',
      '',
      `Nome: ${nome}`,
      `WhatsApp: ${telefone}`,
      `Técnica de interesse: ${tecnica}`,
      `Mensagem: ${mensagem}`
    ].join('\n');

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});
