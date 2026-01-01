/**
 * Masume's Birthday Card - 3D Book Page Turning
 * Mobile-first with realistic page flip animation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const pages = document.querySelectorAll('.card-page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageSpan = document.querySelector('.current-page');
    const totalPagesSpan = document.querySelector('.total-pages');
    const instruction = document.getElementById('instruction');
    const book = document.getElementById('book');

    // State
    let currentPage = 0;
    const totalPages = pages.length;
    let isAnimating = false;
    const flipDuration = 600; // Match CSS --page-flip-duration

    // Initialize
    totalPagesSpan.textContent = totalPages;
    createParticles();
    initializePages();
    updateDisplay();
    setupSwipeHint();

    // Initialize page states
    function initializePages() {
        pages.forEach((page, index) => {
            if (index === 0) {
                page.classList.add('active');
            } else {
                page.classList.remove('active', 'prev');
            }
            // Stack pages with slight z-index variation
            page.style.zIndex = totalPages - index;
        });
    }

    // Go to specific page with 3D flip animation
    function goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= totalPages || isAnimating) return;
        if (pageIndex === currentPage) return;

        isAnimating = true;

        const isForward = pageIndex > currentPage;
        const currentPageEl = pages[currentPage];
        const targetPageEl = pages[pageIndex];

        if (isForward) {
            // Flip forward - current page flips to left
            currentPageEl.classList.remove('active');
            currentPageEl.classList.add('turning-forward');

            // Show target page
            setTimeout(() => {
                currentPageEl.classList.remove('turning-forward');
                currentPageEl.classList.add('prev');
                targetPageEl.classList.add('active');
            }, flipDuration);

        } else {
            // Flip backward - previous page flips back to right
            const prevPage = pages[currentPage - 1];
            if (prevPage) {
                prevPage.classList.remove('prev');
                prevPage.classList.add('turning-backward');

                currentPageEl.classList.remove('active');

                setTimeout(() => {
                    prevPage.classList.remove('turning-backward');
                    prevPage.classList.add('active');
                }, flipDuration);
            }
        }

        // Update state after animation completes
        setTimeout(() => {
            currentPage = pageIndex;

            // Ensure correct states
            pages.forEach((page, idx) => {
                page.classList.remove('turning-forward', 'turning-backward');
                if (idx < currentPage) {
                    page.classList.remove('active');
                    page.classList.add('prev');
                } else if (idx === currentPage) {
                    page.classList.remove('prev');
                    page.classList.add('active');
                } else {
                    page.classList.remove('active', 'prev');
                }
            });

            updateDisplay();
            isAnimating = false;

            // Hide instruction after first navigation
            if (currentPage > 0 && instruction) {
                instruction.style.opacity = '0';
                setTimeout(() => {
                    instruction.style.display = 'none';
                }, 500);
            }
        }, flipDuration + 50);

        // Haptic feedback on mobile if available
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }

        playPageSound();
    }

    function nextPage() {
        if (currentPage < totalPages - 1 && !isAnimating) {
            goToPage(currentPage + 1);
        }
    }

    function prevPage() {
        if (currentPage > 0 && !isAnimating) {
            goToPage(currentPage - 1);
        }
    }

    function updateDisplay() {
        // Update page indicator
        currentPageSpan.textContent = currentPage + 1;

        // Update button states
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages - 1;

        // Update aria labels
        prevBtn.setAttribute('aria-label', `Go to page ${currentPage}`);
        nextBtn.setAttribute('aria-label', `Go to page ${currentPage + 2}`);
    }

    // Event listeners - Buttons
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevPage();
    });

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextPage();
    });

    // Event listeners - Keyboard
    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;

        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextPage();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevPage();
        }
    });

    // Touch/swipe support - Enhanced for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    book.addEventListener('touchstart', (e) => {
        if (isAnimating) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isSwiping = true;
    }, { passive: true });

    book.addEventListener('touchmove', (e) => {
        // Prevent default only if horizontal swipe
        if (!isSwiping) return;

        const touchX = e.changedTouches[0].screenX;
        const touchY = e.changedTouches[0].screenY;
        const diffX = Math.abs(touchStartX - touchX);
        const diffY = Math.abs(touchStartY - touchY);

        // If horizontal movement is dominant, prevent scroll
        if (diffX > diffY && diffX > 10) {
            e.preventDefault();
        }
    }, { passive: false });

    book.addEventListener('touchend', (e) => {
        if (!isSwiping || isAnimating) return;
        isSwiping = false;

        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        const swipeThreshold = 40;

        // Only register horizontal swipes
        if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
            if (diffX > 0) {
                nextPage(); // Swipe left = next page
            } else {
                prevPage(); // Swipe right = previous page
            }
        }
    }, { passive: true });

    // Click/Tap on page to navigate
    book.addEventListener('click', (e) => {
        if (isAnimating) return;

        // Ignore if clicking on interactive elements
        if (e.target.closest('button, a, input')) return;

        const rect = book.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const thirdWidth = rect.width / 3;

        // Tap on right third = next, left third = previous
        if (clickX > thirdWidth * 2) {
            nextPage();
        } else if (clickX < thirdWidth) {
            prevPage();
        }
    });

    // Setup swipe hint for mobile
    function setupSwipeHint() {
        // Create swipe hint element
        const hint = document.createElement('div');
        hint.className = 'swipe-hint';
        hint.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 4l-4 4 4 4"/>
                <path d="M20 12h-14"/>
            </svg>
            <span>Swipe to turn pages</span>
        `;
        document.body.appendChild(hint);

        // Show hint briefly on mobile
        if ('ontouchstart' in window) {
            setTimeout(() => {
                hint.classList.add('visible');
                setTimeout(() => {
                    hint.classList.remove('visible');
                }, 3000);
            }, 2000);
        }
    }

    // Create floating particles - Reduced count for mobile performance
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const colors = ['#9c7cb5', '#e8b4bc', '#f4d9a0', '#c9b8d9', '#d4e8f0'];
        const isMobile = window.innerWidth < 600;
        const particleCount = isMobile ? 12 : 18;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 8 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const duration = Math.random() * 18 + 12;
            const delay = Math.random() * 12;

            particle.style.cssText = `
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                animation-duration: ${duration}s;
                animation-delay: -${delay}s;
            `;

            particlesContainer.appendChild(particle);
        }
    }

    // Page turn sound effect - Softer, paper-like
    function playPageSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create noise for paper sound
            const bufferSize = 2 * audioContext.sampleRate;
            const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = audioContext.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            // Filter to make it sound like paper
            const filter = audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(800, audioContext.currentTime);

            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0.015, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

            whiteNoise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            whiteNoise.start(audioContext.currentTime);
            whiteNoise.stop(audioContext.currentTime + 0.15);
        } catch (e) {
            // Audio not supported - silently fail
        }
    }

    // Entrance animation
    book.style.opacity = '0';
    book.style.transform = 'rotateY(-15deg) translateY(20px) scale(0.95)';

    setTimeout(() => {
        book.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        book.style.opacity = '1';
        book.style.transform = 'rotateY(-5deg) translateY(0) scale(1)';
    }, 200);

    // Preload next pages for smoother experience
    function preloadImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src) {
                const preload = new Image();
                preload.src = img.src;
            }
        });
    }
    preloadImages();

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when tab is hidden
            document.body.classList.add('paused');
        } else {
            document.body.classList.remove('paused');
        }
    });

    // Console easter egg
    console.log('%c📖 Happy Birthday Masume! 🎂',
        'font-size: 24px; font-weight: bold; color: #9c7cb5;');
    console.log('%cA digital book made with 💜',
        'font-size: 14px; color: #e8b4bc;');
});
