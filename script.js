// Language Switcher
function setLanguage(lang) {
    document.body.className = lang === 'fr' ? 'lang-fr' : '';
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Save preference
    localStorage.setItem('preferredLanguage', lang);
}

// Load saved language preference
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    if (savedLang === 'fr') {
        document.body.className = 'lang-fr';
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === 'FR') btn.classList.add('active');
        });
    }
});

// ===== SMOOTH PROGRESSIVE SCROLL ANIMATION SYSTEM =====

// Get all elements that should animate
let animatedElements = [];

// Calculate element's visibility progress (0 to 1)
function getScrollProgress(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Start animating when element enters bottom of viewport
    const startPoint = windowHeight * 0.85; // Start at 85% of viewport height
    const endPoint = windowHeight * 0.3;    // Fully visible at 30% of viewport height
    
    // Calculate how far the element has traveled through the animation zone
    const elementTop = rect.top;
    
    if (elementTop > startPoint) {
        // Element hasn't entered animation zone yet
        return 0;
    } else if (elementTop < endPoint) {
        // Element has fully passed through animation zone
        return 1;
    } else {
        // Element is currently in animation zone - calculate progress
        const progress = (startPoint - elementTop) / (startPoint - endPoint);
        return progress;
    }
}

// Easing function for smooth acceleration/deceleration
function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

// Apply smooth animations based on scroll progress
function updateElementAnimation(element, progress) {
    // Apply easing
    const easedProgress = easeOutCubic(progress);
    
    // Different animation types based on element class
    if (element.classList.contains('image-container')) {
        const translateY = 80 * (1 - easedProgress);
        const scale = 0.95 + (0.05 * easedProgress);
        const opacity = easedProgress;
        
        element.style.transform = `translateY(${translateY}px) scale(${scale})`;
        element.style.opacity = opacity;
        
    } else if (element.classList.contains('quote-block')) {
        const translateX = -80 * (1 - easedProgress);
        const opacity = easedProgress;
        
        element.style.transform = `translateX(${translateX}px)`;
        element.style.opacity = opacity;
        
    } else if (element.classList.contains('text-block') || 
               element.classList.contains('audio-player') || 
               element.classList.contains('closing-text')) {
        const translateY = 60 * (1 - easedProgress);
        const opacity = easedProgress;
        
        element.style.transform = `translateY(${translateY}px)`;
        element.style.opacity = opacity;
    }

    // Mark as visible when fully animated
    if (progress >= 0.95) {
        element.classList.add('visible');
    }
}

// Main scroll animation loop - runs on every scroll
function handleScrollAnimations() {
    animatedElements.forEach(element => {
        const progress = getScrollProgress(element);
        updateElementAnimation(element, progress);
    });
}

// Optimized scroll handler with requestAnimationFrame
let ticking = false;

function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScrollAnimations();
            ticking = false;
        });
        ticking = true;
    }
}

// Initialize everything when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Collect all elements to animate
    animatedElements = Array.from(document.querySelectorAll(
        '.image-container, .text-block, .audio-player, .quote-block, .closing-text'
    ));

    // Add CSS transition for smooth animation
    const style = document.createElement('style');
    style.textContent = `
        .image-container,
        .text-block,
        .audio-player,
        .quote-block,
        .closing-text {
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                        opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, opacity;
        }
    `;
    document.head.appendChild(style);

    // Run initial animation check
    handleScrollAnimations();

    // Attach scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // Hide scroll indicator after first scroll
    let hasScrolled = false;
    window.addEventListener('scroll', () => {
        if (!hasScrolled && window.scrollY > 100) {
            document.querySelector('.scroll-indicator').style.opacity = '0';
            hasScrolled = true;
        }
    });

    // Mute ambient sound by default (better UX)
    const ambientSound = document.getElementById('ambient-sound');
    if (ambientSound) {
        ambientSound.volume = 0.3;
        ambientSound.muted = true; // User must click to play due to browser policies
    }
});

// Enhanced Parallax Effect with smoother calculations
let parallaxTicking = false;

function updateParallax() {
    const parallaxImages = document.querySelectorAll('.parallax-image');
    const scrolled = window.pageYOffset;
    
    parallaxImages.forEach(image => {
        const rect = image.getBoundingClientRect();
        const offset = rect.top + scrolled;
        const speed = 0.4; // Slightly slower for smoother effect
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const yPos = -(scrolled - offset) * speed;
            image.style.transform = `translateY(${yPos}px)`;
        }
    });
    
    parallaxTicking = false;
}

window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
    }
}, { passive: true });

// Smooth scroll for anchor links (if you add navigation)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});