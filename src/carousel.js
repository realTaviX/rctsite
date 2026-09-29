const carousel = document.getElementById('carousel');

carousel.innerHTML = cfg.projects.map((p) => `<div class="carousel-item" data-index="0">
            <div class="browser-bar">
                <div class="browser-dot" style="background: #ff5f56;"></div>
                <div class="browser-dot" style="background: #ffbd2e;"></div>
                <div class="browser-dot" style="background: #27c93f;"></div>
                <div class="ml-4 text-xs font-mono text-white/40">${p.category}</div>
            </div>
            <img src="${p.image}" alt="Project 1" class="item-image">
            <div class="item-overlay">
                <h2 class="text-4xl font-bold mb-2">${p.name}</h2>
                <p class="text-xl text-white/70 max-w-2xl">${p.description}</p>
            </div>
        </div>`);

const items = document.querySelectorAll('.carousel-item');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const scaler = document.getElementById('scaler');

const numItems = items.length;
const theta = 360 / numItems; 

// Target item dimensions as requested
const itemWidth = 1024;
const itemHeight = 576;

// Calculate dynamic radius to prevent overlapping
// We add a 100px gap to ensure they don't clip into each other
const gap = 20;
const radius = Math.round((itemWidth / 2) / Math.tan(Math.PI / numItems)) + gap;

let currAngle = 0; 
let activeIndex = 0;

function initialize3D() {
    // Position each item in a circle
    items[0].classList.add("active");
    items.forEach((item, index) => {
        const itemAngle = index * theta;
        // Place items outward radially
        item.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
    });
    
    // Apply initial rotation and crucial push-back translation
    updateCarouselTransform();
}

function updateCarouselTransform() {
    // The magic trick: translateZ(-radius) pushes the entire carousel back
    // so the active (front) item sits exactly at Z=0, making it precisely 1280x720 
    // visually, rather than being blown up by the perspective camera.
    carousel.style.transform = `translateZ(${-radius}px) rotateY(${currAngle}deg)`;
    items.forEach((e) => {
        e.style.width = `${itemWidth}px`;
        e.style.height = `${itemHeight}px`
    })
}

function updateActiveItem() {
    // Calculate which index is currently facing front
    activeIndex = Math.round(currAngle / -theta) % numItems;
    if (activeIndex < 0) {
        activeIndex += numItems;
    }

    // Update classes
    items.forEach((item, index) => {
        if (index === activeIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function rotateCarousel(direction) {
    currAngle -= direction * theta;
    updateCarouselTransform();
    updateActiveItem();
}

// --- Responsive Scaling Logic ---
// Since 1280x720 is huge, we scale the container down on smaller screens
function handleResize() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Leave some padding (10% horizontally, 25% vertically for buttons/header)
    const availableWidth = viewportWidth * 0.90;
    const availableHeight = viewportHeight * 0.70;

    const scaleX = availableWidth / itemWidth;
    const scaleY = availableHeight / itemHeight;
    
    // Scale to fit whichever dimension is most constrained, max scale 1 (don't upscale)
    const scale = Math.min(scaleX, scaleY, 1);
    
    scaler.style.transform = `scale(${scale})`;
}

// Event Listeners
prevBtn.addEventListener('click', () => rotateCarousel(-1));
nextBtn.addEventListener('click', () => rotateCarousel(1));

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') rotateCarousel(-1);
    else if (e.key === 'ArrowRight') rotateCarousel(1);
});

window.addEventListener('resize', handleResize);

// Initialization
initialize3D();
handleResize(); // Initial scale fit