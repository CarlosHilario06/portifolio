const translations = {
  pt: {
    navAbout: 'Sobre',
    navSkills: 'Stack',
    navProjects: 'Projetos',
    navServices: 'Serviços',
    navContact: 'Contato',

    heroEyebrow: 'Avaré-SP · Brasil',
    heroHello: 'Olá',
    heroFixed: 'Eu sou ',
    heroWords: ['Carlos', 'Dev Full Stack'],

    heroText: 'Sou Carlos Hilário, desenvolvedor full stack focado em SaaS, automação com JavaScript e soluções web com estrutura, clareza e boa experiência para o usuário.',
    heroPrimary: 'Ver projetos',
    heroSecondary: 'Falar no WhatsApp',

    panelStatus: 'disponível para novos projetos',
    profileText: '20 anos · SaaS · Automação',

    aboutEyebrow: 'Sobre mim',
    aboutTitle: 'Transformo ideias em produto navegável, organizado e pronto para evoluir.',
    aboutText1: 'Moro em Avaré-SP e trabalho com desenvolvimento web full stack. Tenho uma base versátil em front-end, back-end, banco de dados, WordPress, APIs e integrações.',
    aboutText2: 'Meu estilo é direto: entender o objetivo, montar uma estrutura limpa e desenvolver algo que faça sentido no uso real. Não fico preso a uma única área; consigo atuar em diferentes partes do projeto quando necessário.',

    factOne: 'Visão prática de produto',
    factTwo: 'Mobile como prioridade',
    factThree: 'Automação e integração',

    skillsEyebrow: 'Stack técnica',
    skillsTitle: 'Tecnologias organizadas por função, sem exagero visual e sem porcentagem aleatória.',
    databaseTitle: 'Banco de dados',
    toolsTitle: 'Ferramentas',

    projectsEyebrow: 'Projetos',
    projectsTitle: 'Projetos com foco em solução, não apenas em tela bonita.',

    projectOneTitle: 'Sistema de arbitragem para Ad Manager',
    projectOneText: 'Projeto full stack voltado para análise de arbitragem no Google Ad Manager, com organização de dados, leitura de indicadores e apoio para decisões mais rápidas.',

    projectTwoTitle: 'Site institucional responsivo',
    projectTwoText: 'Site com estrutura clara, visual profissional, boa leitura no mobile e seções pensadas para apresentar serviços, diferenciais e canais de contato.',

    servicesEyebrow: 'Serviços',
    servicesTitle: 'Atuo onde o projeto precisar sair do papel e ganhar forma.',

    serviceOneTitle: 'Landing pages',
    serviceOneText: 'Páginas responsivas com estrutura clara, boa hierarquia visual e foco na ação principal.',

    serviceTwoTitle: 'Sites institucionais',
    serviceTwoText: 'Sites para negócios, profissionais e projetos que precisam transmitir confiança desde o primeiro acesso.',

    serviceThreeTitle: 'Automações com JavaScript',
    serviceThreeText: 'Scripts, fluxos e pequenas ferramentas para reduzir trabalho manual e acelerar processos.',

    serviceFourTitle: 'APIs e integrações',
    serviceFourText: 'Conexões entre sistemas, dados, formulários e funcionalidades personalizadas.',

    contactEyebrow: 'Contato',
    contactTitle: 'Tem uma ideia para tirar do papel?',
    contactText: 'Me chame para conversar sobre sites, sistemas, automações, interfaces ou um produto SaaS em fase inicial.',

    footerText: 'Todos os direitos reservados.'
  },

  en: {
    navAbout: 'About',
    navSkills: 'Stack',
    navProjects: 'Projects',
    navServices: 'Services',
    navContact: 'Contact',

    heroEyebrow: 'Avaré-SP · Brazil',
    heroHello: 'Hello',
    heroFixed: 'I am ',
    heroWords: ['Carlos', 'a Full Stack Dev'],

    heroText: 'I am Carlos Hilário, a full stack developer focused on SaaS, JavaScript automation and web solutions with structure, clarity and a strong user experience.',
    heroPrimary: 'View projects',
    heroSecondary: 'Message on WhatsApp',

    panelStatus: 'available for new projects',
    profileText: '20 years old · SaaS · Automation',

    aboutEyebrow: 'About me',
    aboutTitle: 'aboutTitle: 'I turn ideas into navigable, organized products ready to evolve.',
    aboutText1: 'I live in Avaré-SP, Brazil, and work with full stack web development. I have a versatile foundation in front-end, back-end, databases, WordPress, APIs and integrations.',
    aboutText2: 'My style is direct: understand the goal, build a clean structure and develop something that makes sense in real use. I am not locked into one area; I can work across different parts of a project when needed.',

    factOne: 'Practical product vision',
    factTwo: 'Mobile as priority',
    factThree: 'Automation and integration',

    skillsEyebrow: 'Technical stack',
    skillsTitle: 'Technologies organized by function, without visual exaggeration or random percentages.',
    databaseTitle: 'Database',
    toolsTitle: 'Tools',

    projectsEyebrow: 'Projects',
    projectsTitle: 'Projects focused on solutions, not just good-looking screens.',

    projectOneTitle: 'Ad Manager arbitrage system',
    projectOneText: 'A full stack project focused on Google Ad Manager arbitrage analysis, with data organization, indicator reading and support for faster decisions.',

    projectTwoTitle: 'Responsive institutional website',
    projectTwoText: 'A website with clear structure, professional visuals, strong mobile readability and sections designed to present services, strengths and contact channels.',

    servicesEyebrow: 'Services',
    servicesTitle: 'I work where the project needs to leave the idea stage and take shape.',

    serviceOneTitle: 'Landing pages',
    serviceOneText: 'Responsive pages with clear structure, strong visual hierarchy and focus on the main action.',

    serviceTwoTitle: 'Institutional websites',
    serviceTwoText: 'Websites for businesses, professionals and projects that need to build trust from the first visit.',

    serviceThreeTitle: 'JavaScript automations',
    serviceThreeText: 'Scripts, flows and small tools to reduce manual work and speed up processes.',

    serviceFourTitle: 'APIs and integrations',
    serviceFourText: 'Connections between systems, data, forms and custom features.',

    contactEyebrow: 'Contact',
    contactTitle: 'Do you have an idea to build?',
    contactText: 'Reach out to talk about websites, systems, automations, interfaces or an early-stage SaaS product.',

    footerText: 'All rights reserved.'
  }
};

const langSwitch = document.getElementById('langSwitch');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const year = document.getElementById('year');
const typedText = document.getElementById('typedText');

let currentLang = 'pt';
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimer = null;

if (year) {
  year.textContent = new Date().getFullYear();
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getTypedWords() {
  return translations[currentLang].heroWords;
}

function resetTyping() {
  clearTimeout(typingTimer);

  wordIndex = 0;
  charIndex = 0;
  isDeleting = false;

  if (typedText) {
    typedText.textContent = '';
  }

  typeEffect();
}

function typeEffect() {
  if (!typedText) return;

  const words = getTypedWords();
  const currentWord = words[wordIndex];

  const typingDelay = 105;
  const deletingDelay = 58;
  const pauseDelay = 1250;

  if (!isDeleting) {
    typedText.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentWord.length) {
      isDeleting = true;
      typingTimer = setTimeout(typeEffect, pauseDelay);
      return;
    }

    typingTimer = setTimeout(typeEffect, typingDelay);
    return;
  }

  typedText.textContent = currentWord.substring(0, charIndex - 1);
  charIndex--;

  if (charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    typingTimer = setTimeout(typeEffect, 240);
    return;
  }

  typingTimer = setTimeout(typeEffect, deletingDelay);
}

function applyLanguage(lang) {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;

    if (translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  if (langSwitch) {
    langSwitch.textContent = lang === 'pt' ? 'EN' : 'PT';
  }

  resetTyping();
  refreshIcons();
}

if (langSwitch) {
  langSwitch.addEventListener('click', () => {
    currentLang = currentLang === 'pt' ? 'en' : 'pt';
    applyLanguage(currentLang);
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');

    menuToggle.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

document.querySelectorAll('.reveal').forEach((element) => {
  observer.observe(element);
});

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang);
  refreshIcons();
});
