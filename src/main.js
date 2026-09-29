const cfg = window.ROXY_CONFIG;

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// const projectsGrid = document.getElementById('projectsGrid');
// projectsGrid.innerHTML = cfg.projects.map((p) => `
//   <article class="project-card">
//     <div class="project-visual"><div class="project-symbol">${p.mark || p.name}</div></div>
//     <div class="project-info"><small>${p.category.toUpperCase()} / ${p.year}</small><h3>${p.name}</h3><p>${p.description}</p><a href="${p.link}" target="_blank" rel="noopener">Visualizar projeto ↗</a></div>
//   </article>`).join('');

const teamGrid = document.getElementById('teamGrid');
teamGrid.innerHTML = cfg.team.map((m) => `
  <article class="team-panel" data-member="${m.id || m.name}" tabindex="0" role="button" aria-expanded="false" aria-label="Conhecer ${m.name}">
    <img class="team-panel-photo" src="${m.image}" alt="${m.name}" loading="lazy" />
    <div class="team-panel-shade"></div>
    <div class="team-panel-idle">
      <span class="team-index">${String(cfg.team.indexOf(m) + 1).padStart(2, '0')}</span>
      <h3>${m.displayName || m.name}</h3>
      <p>${m.role}</p>
      <span class="team-hint">Passe o mouse / clique para conhecer ↗</span>
    </div>
    <div class="team-panel-info">
      <span class="team-overline">ROXY CREATE TEAM / ${m.displayName || m.name}</span>
      <h3>${m.headline || m.name}</h3>
      <p class="team-description">${m.description}</p>
      <p class="team-details">${m.details || ''}</p>
      <div class="team-skills">${(m.skills || []).map((skill) => `<span>${skill}</span>`).join('')}</div>
      <a class="team-portfolio" href="${m.portfolio}" target="_blank" rel="noopener">Ver portfólio ↗</a>
    </div>
  </article>`).join('');

let pinnedTeamMember = null;
const teamPanels = [...teamGrid.querySelectorAll('.team-panel')];

function setActiveTeam(panel, pinned = false) {
    if (!panel) {
        teamGrid.classList.remove('has-active');
        teamPanels.forEach((item) => {
            item.classList.remove('active', 'inactive');
            item.setAttribute('aria-expanded', 'false');
        });
        return;
    }
    teamGrid.classList.add('has-active');
    teamPanels.forEach((item) => {
        const isActive = item === panel;
        item.classList.toggle('active', isActive);
        item.classList.toggle('inactive', !isActive);
        item.setAttribute('aria-expanded', String(isActive));
    });
    if (pinned) pinnedTeamMember = panel;
}

teamPanels.forEach((panel) => {
    panel.addEventListener('mouseenter', () => {
        if (!pinnedTeamMember) setActiveTeam(panel);
    });
    panel.addEventListener('focus', () => {
        if (!pinnedTeamMember) setActiveTeam(panel);
    });
    panel.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        if (pinnedTeamMember === panel) {
            pinnedTeamMember = null;
            setActiveTeam(null);
        } else {
            pinnedTeamMember = panel;
            setActiveTeam(panel, true);
        }
    });
    panel.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            panel.click();
        }
    });
});

teamGrid.addEventListener('mouseleave', () => {
    if (!pinnedTeamMember) setActiveTeam(null);
});

document.addEventListener('click', (event) => {
    if (pinnedTeamMember && !teamGrid.contains(event.target)) {
        pinnedTeamMember = null;
        setActiveTeam(null);
    }
});

document.getElementById('cnpjDisplay').textContent = `CNPJ ${cfg.brand.cnpj}`;
document.getElementById('tavixLink').href = cfg.social.tavix;
document.getElementById('lujsLink').href = cfg.social.lujs;

const wpp = document.getElementById('whatsappFloat');
if (cfg.brand.whatsapp) {
    const digits = cfg.brand.whatsapp.replace(/\D/g, '');
    wpp.href = `https://wa.me/${digits}?text=${encodeURIComponent(cfg.brand.whatsappMessage)}`;
    wpp.target = '_blank';
    wpp.rel = 'noopener';
}

const baRange = document.getElementById('baRange');
const afterPanel = document.querySelector('.ba-panel.after');
const baDivider = document.getElementById('baDivider');
function setBA(value) { afterPanel.style.clipPath = `inset(0 0 0 ${value}%)`; baDivider.style.left = `${value}%`; }
baRange.addEventListener('input', e => setBA(e.target.value));

const form = document.getElementById('leadForm');
const formStatus = document.getElementById('formStatus');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const message = `Olá! Conheci a Roxy Create Team pelo site.\n\nNome: ${data.get('name')}\nEmpresa: ${data.get('company') || '-'}\nWhatsApp: ${data.get('phone')}\nE-mail: ${data.get('email')}\nServiço: ${data.get('service')}\n\nProjeto: ${data.get('message')}`;
    if (cfg.brand.whatsapp) {
        const digits = cfg.brand.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
        formStatus.textContent = 'Abrimos o WhatsApp com a sua solicitação pronta para envio.';
    } else {
        formStatus.textContent = 'Solicitação validada. Adicione o número de WhatsApp em config.js para ativar o envio direto.';
    }
});

// === Plan configurator + ready-to-send WhatsApp / Instagram message ===
const pricing = cfg.pricing;
const planSelect = document.getElementById('builderPlan');
const monthsSelect = document.getElementById('builderMonths');
const extraSectionsSelect = document.getElementById('builderExtraSections');
const revisionCheck = document.getElementById('builderRevision');
const builderContactButton = document.getElementById('builderContactButton');
const contactChoice = document.getElementById('contactChoice');
const contactMessagePreview = document.getElementById('contactMessagePreview');
const contactChoiceStatus = document.getElementById('contactChoiceStatus');
const sendWhatsapp = document.getElementById('sendWhatsapp');
const sendInstagram = document.getElementById('sendInstagram');

const brl = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

if (monthsSelect && extraSectionsSelect) {
    monthsSelect.innerHTML = Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        return `<option value="${n}" ${n === 12 ? 'selected' : ''}>${n} ${n === 1 ? 'mês' : 'meses'}</option>`;
    }).join('');
    extraSectionsSelect.innerHTML = Array.from({ length: 11 }, (_, i) =>
        `<option value="${i}">${i === 0 ? 'Nenhuma seção extra' : `${i} ${i === 1 ? 'seção extra' : 'seções extras'}`}</option>`
    ).join('');
}

function currentPlan() {
    return pricing.plans.find((plan) => plan.id === planSelect.value) || pricing.plans[0];
}

function calculatePlan() {
    const plan = currentPlan();
    const months = Number(monthsSelect.value || 1);
    const extraSections = Number(extraSectionsSelect.value || 0);
    const hasRevision = revisionCheck.checked;
    const uniqueAddons = (extraSections * pricing.extraSection);
    const monthly = plan.monthly + (hasRevision ? pricing.extraRevisionMonthly : 0);
    const administration = monthly * months;
    const total = plan.creation + uniqueAddons + administration;

    document.getElementById('summaryCreation').textContent = brl(plan.creation);
    document.getElementById('summaryAddons').textContent = brl(uniqueAddons);
    document.getElementById('summaryAdminLabel').textContent = `Administração · ${months} ${months === 1 ? 'mês' : 'meses'}`;
    document.getElementById('summaryAdmin').textContent = brl(administration);
    document.getElementById('summaryMonthly').textContent = brl(monthly);
    document.getElementById('summaryTotal').textContent = brl(total);

    return { plan, months, extraSections, hasRevision, uniqueAddons, monthly, administration, total };
}

function buildPlanMessage() {
    const data = calculatePlan();
    const extras = [];
    if (data.extraSections > 0) extras.push(`${data.extraSections} ${data.extraSections === 1 ? 'seção extra' : 'seções extras'} (${brl(data.extraSections * pricing.extraSection)})`);
    if (data.hasRevision) extras.push(`1 rodada extra de ajustes/mês (+ ${brl(pricing.extraRevisionMonthly)}/mês)`);

    return `Olá! Conheci a Roxy Create Team pelo site e montei este plano:\n\n` +
        `PLANO: ${data.plan.name}\n` +
        `Criação do site: ${brl(data.plan.creation)}\n` +
        `Administração: ${data.months} ${data.months === 1 ? 'mês' : 'meses'}\n` +
        `Mensalidade: ${brl(data.monthly)}/mês\n` +
        `Adicionais: ${extras.length ? extras.join('; ') : 'Nenhum'}\n` +
        `Total estimado do período: ${brl(data.total)}\n\n` +
        `Gostaria de conversar sobre este plano e receber a proposta completa.`;
}

function openContactChoice() {
    contactMessagePreview.value = buildPlanMessage();
    contactChoiceStatus.textContent = 'Você será redirecionado para o WhatsApp.';
    contactChoiceStatus.classList.remove('success');
    contactChoice.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeContactChoice() {
    contactChoice.classList.remove('open');
    document.body.style.overflow = '';
}

async function copyPlanMessage() {
    const message = contactMessagePreview.value || buildPlanMessage();
    try {
        await navigator.clipboard.writeText(message);
        return true;
    } catch (_) {
        contactMessagePreview.focus();
        contactMessagePreview.select();
        return document.execCommand('copy');
    }
}

[planSelect, monthsSelect, extraSectionsSelect, revisionCheck].forEach((el) => {
    if (el) el.addEventListener('change', calculatePlan);
});

document.querySelectorAll('.choose-plan').forEach((button) => {
    button.addEventListener('click', () => {
        planSelect.value = button.dataset.plan;
        calculatePlan();
        document.getElementById('planBuilder').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

if (builderContactButton) builderContactButton.addEventListener('click', openContactChoice);
document.querySelectorAll('[data-close-contact]').forEach((el) => el.addEventListener('click', closeContactChoice));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && contactChoice.classList.contains('open')) closeContactChoice(); });

if (sendWhatsapp) sendWhatsapp.addEventListener('click', async () => {
    const message = contactMessagePreview.value || buildPlanMessage();
    if (cfg.brand.whatsapp) {
        const digits = cfg.brand.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    } else {
        await copyPlanMessage();
        contactChoiceStatus.textContent = 'Mensagem copiada. Adicione o WhatsApp da Roxy em config.js para o envio abrir automaticamente.';
        contactChoiceStatus.classList.add('success');
    }
});

if (sendInstagram) sendInstagram.addEventListener('click', async () => {
    const copied = await copyPlanMessage();
    contactChoiceStatus.textContent = copied
        ? 'Mensagem copiada! Abrindo o Instagram — é só colar no Direct.'
        : 'Abrindo o Instagram. Copie a mensagem acima e cole no Direct.';
    contactChoiceStatus.classList.add('success');
    const instagramUrl = cfg.brand.instagram || 'https://www.instagram.com/';
    window.open(instagramUrl, '_blank', 'noopener');
});

calculatePlan();
