import translations from './lang.js';
document.getElementById("year").textContent = new Date().getFullYear();

let currentLang = 'pt'; // Idioma padrão

// Detecta idioma baseado na URL (/pt, /en, #pt, ?lang=pt) ou no navegador
function detectLanguage() {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    // Verifica se a URL contém indicações de idioma
    if (path.includes('/pt') || hash.includes('#pt') || search.includes('lang=pt')) return 'pt';
    if (path.includes('/en') || hash.includes('#en') || search.includes('lang=en')) return 'en';

    // Fallback para o idioma do navegador
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === 'en' ? 'en' : 'pt';
}

function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Atualiza tag <html>
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
    if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
    }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    currentLang = detectLanguage();
    applyTranslations(currentLang);
});

// Ouve mudanças de hash na URL (ex: usuário clica voltar no navegador)
window.addEventListener('hashchange', () => {
    const newLang = detectLanguage();
    if (newLang !== currentLang) {
        currentLang = newLang;
        applyTranslations(currentLang);
    }
});