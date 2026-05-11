// script.js - Carousel and WhatsApp scheduling behavior

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('techCarousel');

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
