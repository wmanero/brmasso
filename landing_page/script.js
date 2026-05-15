// script.js - Carousel and WhatsApp scheduling behavior

document.addEventListener('DOMContentLoaded', () => {
  // Testimonials carousel
  const testimonialCarousel = document.getElementById('testimonialsCarousel');
  if (testimonialCarousel) {
    const tTrack = testimonialCarousel.querySelector('.carousel-track');
    const tPrevBtn = testimonialCarousel.querySelector('.carousel-btn.prev');
    const tNextBtn = testimonialCarousel.querySelector('.carousel-btn.next');
    let tIndex = 0;

    // Fetch reviews from your API endpoint (replace URL and PLACE_ID)
    fetch('https://your-api.example.com/google-reviews?placeId=YOUR_PLACE_ID')
      .then(res => res.json())
      .then(data => {
        // Expected: data.reviews = [{text, author_name, rating}, ...]
        tTrack.innerHTML = '';
        data.reviews.forEach(review => {
          const item = document.createElement('div');
          item.className = 'carousel-item testimonial-item';
          item.innerHTML = `
            <p class="testimonial-text">"${review.text}"</p>
            <p class="testimonial-author">— ${review.author_name}</p>
          `;
          tTrack.appendChild(item);
        });
        initTestimonialCarousel();
      })
      .catch(() => {
        // If fetch fails, keep the loading placeholder and still init carousel
        initTestimonialCarousel();
      });

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
  }


  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    let currentIndex = 0;

    const moveToSlide = (index) => {
      track.style.transform = `translateX(-${index * 100}%)`;
      currentIndex = index;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === slides.length - 1;
    };

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) moveToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < slides.length - 1) moveToSlide(currentIndex + 1);
    });

    const autoPlayDelay = 3000;
    let autoPlay = null;

    const startAutoPlay = () => {
      if (autoPlay) return;
      autoPlay = setInterval(() => {
        const next = (currentIndex + 1) % slides.length;
        moveToSlide(next);
      }, autoPlayDelay);
    };

    const stopAutoPlay = () => {
      if (!autoPlay) return;
      clearInterval(autoPlay);
      autoPlay = null;
    };

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
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
