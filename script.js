document.addEventListener("DOMContentLoaded", () => {
  // =============== SLIDER (an toàn khi trang không có slider) ===============
  const slider = document.querySelector(".slider");
  const track  = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slider-track .slide");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");

  let currentIndex = 0;
  let isDragging = false, startX = 0, currentX = 0, deltaX = 0;

  function goTo(index, animate = true) {
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    currentIndex = clamped;
    if (animate) track.style.transition = 'transform 0.35s ease';
    else track.style.transition = 'none';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function bindClicks() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.addEventListener("click", () => goTo(currentIndex - 1, true));
    nextBtn.addEventListener("click", () => goTo(currentIndex + 1, true));
  }

  function bindTouch() {
    if (!slider || !track) return;
    slider.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      isDragging = true;
      startX = e.touches[0].clientX;
      currentX = startX;
      track.style.transition = 'none';
    }, { passive: true });

    slider.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      deltaX = currentX - startX;
      const width = slider.clientWidth || 1;
      const basePercent = -currentIndex * 100;
      const movePercent = (deltaX / width) * 100; // dịch theo %
      track.style.transform = `translateX(calc(${basePercent}% + ${movePercent}%))`;
    }, { passive: true });

    slider.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;
      const width = slider.clientWidth || 1;
      const threshold = width * 0.20; // vuốt >20% chiều rộng để chuyển trang
      if (deltaX > threshold)      goTo(currentIndex - 1, true);
      else if (deltaX < -threshold) goTo(currentIndex + 1, true);
      else                         goTo(currentIndex, true);
      deltaX = 0;
    }, { passive: true });

    window.addEventListener('resize', () => {
      // Khi đổi xoay màn hình/kích thước, giữ đúng vị trí hiện tại
      goTo(currentIndex, false);
    });
  }

  function bindZoomModal() {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const closeModal = document.querySelector(".modal .close");
    const zoomBtns = document.querySelectorAll(".zoom-btn");

    if (!modal || !modalImg || !zoomBtns.length) return;

    zoomBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const img = e.target.closest(".slide")?.querySelector("img");
        if (!img) return;
        modal.style.display = "block";
        modalImg.src = img.currentSrc || img.src;
        // Khoá scroll nền trên mobile
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      });
    });

    function close() {
      modal.style.display = "none";
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    closeModal?.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  // Khởi tạo slider nếu tồn tại trong trang
  if (track && slides.length) {
    goTo(0, false);
    bindClicks();
    bindTouch();
    bindZoomModal();
  }

  // =============== THEME TOGGLE (giữ nguyên, bổ sung an toàn) ===============
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    const icon = btn.querySelector('.icon');

    function applyTheme(theme) {
      document.body.classList.toggle('dark', theme === 'dark');
      try { localStorage.setItem('theme', theme); } catch(e) {}
      if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', theme === 'dark'
        ? 'Đang Dark mode. Bấm để chuyển Light mode'
        : 'Đang Light mode. Bấm để chuyển Dark mode');

      // Đồng bộ ảnh dark/light trong slider (nếu có)
      document.querySelectorAll('.slider .slide img').forEach(img => {
        const newSrc = theme === 'dark' ? img.dataset.dark : img.dataset.light;
        if (newSrc) img.src = newSrc;
      });
    }

    (function initTheme() {
      let saved = null;
      try { saved = localStorage.getItem('theme'); } catch(e) {}
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
      applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    })();

    btn.addEventListener('click', () => {
      const currentDark = document.body.classList.contains('dark');
      const next = currentDark ? 'light' : 'dark';
      btn.classList.add('spin');
      applyTheme(next);
      setTimeout(() => btn.classList.remove('spin'), 520);
    });
  }
});
