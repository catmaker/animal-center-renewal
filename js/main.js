(() => {
  'use strict';
  const data = window.AnimalCenterData;
  if (!data) return;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const header = $('.site-header');
  const menuButton = $('.menu-toggle');
  const navigation = $('#main-nav');
  const dialog = $('#info-dialog');
  const dialogBody = $('#dialog-body');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let previousFocus;
  const hero = $('.hero');
  const story = $('.story-section');
  const careSteps = $$('[data-care-step]');
  const careFrames = $$('[data-care-frame]');
  const careButtons = $$('[data-care-select]');
  const careLayout = $('.care-layout');
  const desktopCare = window.matchMedia('(min-width: 768px)');
  let careIndex = 0;

  function selectCare(index, moveToStep = false) {
    if (index !== careIndex) {
      careSteps.forEach((step, position) => step.classList.toggle('is-active', position === index));
      careFrames.forEach((frame, position) => {
        frame.classList.toggle('is-active', position === index);
        frame.setAttribute('aria-hidden', String(position !== index));
      });
      careButtons.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
      const active = careSteps[index];
      $('#care-frame-number').textContent = `0${index + 1}`;
      $('#care-frame-title').textContent = $('strong', active).textContent;
      $('#care-mobile-description').textContent = [...$('.care-step-description', active).childNodes].map(node => node.nodeName === 'BR' ? ' ' : node.textContent).join('');
      careLayout.style.setProperty('--care-progress', String((index + 1) / careSteps.length));
      careIndex = index;
    }
    if (moveToStep && desktopCare.matches) {
      careSteps[index].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    }
  }
  careButtons.forEach((button, index) => button.addEventListener('click', () => selectCare(index, true)));

  function updateCareFromScroll() {
    if (!desktopCare.matches) return;
    const bounds = careLayout.getBoundingClientRect();
    if (bounds.top > innerHeight * .8 || bounds.bottom < 100) return;
    const readingLine = innerHeight * .52;
    let nearest = 0;
    let distance = Infinity;
    careSteps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const nextDistance = Math.abs(rect.top + Math.min(rect.height * .35, 120) - readingLine);
      if (nextDistance < distance) { nearest = index; distance = nextDistance; }
    });
    selectCare(nearest);
  }

  function setMenu(open, restoreFocus = false) {
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', () => setMenu(false));

  // Native anchors retain file:// compatibility and URL history; focus follows intentional navigation.
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      setMenu(false);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  const topLink = $('.back-to-top');
  let scrollQueued = false;
  function updateScrollState() {
    header.classList.toggle('scrolled', window.scrollY > 24);
    topLink.hidden = window.scrollY < 640;
    const pageRange = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--reading-progress', String(pageRange > 0 ? window.scrollY / pageRange : 0));
    if (!reducedMotion.matches) {
      const heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom > 0) {
        hero.style.setProperty('--hero-drift', `${Math.min(window.scrollY * .12, 96)}px`);
        hero.style.setProperty('--hero-copy-drift', `${-Math.min(window.scrollY * .055, 40)}px`);
      }
      const storyRect = story.getBoundingClientRect();
      if (storyRect.top < innerHeight && storyRect.bottom > 0) {
        story.style.setProperty('--story-drift', `${Math.max(-65, Math.min(0, (storyRect.top - innerHeight) * .045))}px`);
      }
    }
    updateCareFromScroll();
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  updateScrollState();
  window.addEventListener('resize', updateScrollState, { passive: true });

  // Track the last reached section; the highlight persists between primary sections.
  const navLinks = $$('a', navigation);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    navLinks.forEach(link => navObserver.observe(document.querySelector(link.hash)));
    const heroObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) navLinks.forEach(link => link.removeAttribute('aria-current'));
    }, { threshold: .4 });
    heroObserver.observe($('.hero'));
  }

  const animalCards = $$('.animal-card');
  const filterButtons = $$('[data-filter]');
  const count = $('#animal-count');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.filter;
      filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      $('.animal-grid').dataset.activeFilter = type;
      let visibleCount = 0;
      animalCards.forEach(card => {
        const visible = type === 'all' || card.dataset.type === type;
        card.hidden = !visible;
        card.classList.remove('filter-enter');
        if (visible) {
          card.style.setProperty('--item-delay', `${visibleCount * 55}ms`);
          visibleCount += 1;
          if (!reducedMotion.matches) {
            // Restart a short entrance only when a filter changes the results.
            void card.offsetWidth;
            card.classList.add('filter-enter');
          }
        }
      });
      count.textContent = `${visibleCount}마리의 친구들`;
    });
  });

  const regionTabs = $$('[data-region]');
  const panel = $('#facility-panel');
  function selectRegion(tab, moveFocus = false) {
    regionTabs.forEach(item => {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    const facilities = data.facilities[tab.dataset.region];
    panel.setAttribute('aria-labelledby', tab.id);
    // All strings below are authored local data, never external or user supplied HTML.
    panel.innerHTML = `<div class="facility-summary"><h3>${tab.dataset.region}의 보호시설</h3><span>${facilities.length}곳 안내</span></div><ul class="facility-list">${facilities.map(([name, location]) => `<li><div><strong>${name}</strong><span>${location}</span></div><button class="facility-link" data-consult="facility" data-facility="${name}" aria-label="${name} 상담 안내">상담 안내 <span aria-hidden="true">↗</span></button></li>`).join('')}</ul>`;
    if (!reducedMotion.matches) panel.animate([
      { opacity: .25, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 380, easing: 'cubic-bezier(.22,.68,.2,1)' });
    if (moveFocus) tab.focus();
  }
  regionTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectRegion(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % regionTabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + regionTabs.length) % regionTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = regionTabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectRegion(regionTabs[next], true);
    });
  });

  const faqAnimations = new WeakMap();
  $$('.faq-item h3 button').forEach(button => {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      faqAnimations.get(answer)?.cancel();
      button.setAttribute('aria-expanded', String(!isOpen));
      if (reducedMotion.matches) { answer.hidden = isOpen; return; }
      answer.hidden = false;
      const height = answer.scrollHeight;
      const animation = answer.animate(isOpen ? [
        { height: `${height}px`, opacity: 1 }, { height: '0px', opacity: 0 }
      ] : [
        { height: '0px', opacity: 0 }, { height: `${height}px`, opacity: 1 }
      ], { duration: isOpen ? 240 : 360, easing: 'cubic-bezier(.22,.68,.2,1)' });
      faqAnimations.set(answer, animation);
      animation.onfinish = () => {
        if (button.getAttribute('aria-expanded') === 'false') answer.hidden = true;
        faqAnimations.delete(answer);
      };
    });
  });

  function openDialog(title, content, eyebrow = 'GET IN TOUCH') {
    if (!dialog.open) previousFocus = document.activeElement;
    $('#dialog-title').textContent = title;
    $('#dialog-eyebrow').textContent = eyebrow;
    dialogBody.innerHTML = content;
    document.body.classList.add('dialog-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    $('.dialog-close').focus();
  }
  function closeDialog() { dialog.close(); }
  $('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = $$('a[href], button:not([disabled]), [tabindex="0"]', dialog)
      .filter(element => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  });

  const consultInfo = {
    general: { title: '어떤 도움이 필요하신가요?', intro: '입소와 입양, 구조 상담은 공식 고객센터에서 안내받을 수 있습니다. 현재 상황을 먼저 이야기해 주세요.', items: ['입양: 관심 있는 동물과 거주 지역', '입소: 동물의 종류와 현재 건강 상태', '구조: 발견 위치와 현장 상황'] },
    admission: { title: '입소 상담, 이렇게 준비해 주세요.', intro: '동물이 안전하게 머무를 방법을 함께 찾을 수 있도록 현재 상황을 정리해 주세요. 입소 가능 여부와 조건은 담당 지부 상담 후 확인됩니다.', items: ['동물의 종류, 나이, 건강 상태', '현재 상황과 입소를 고려하는 이유', '거주 지역과 상담 가능한 시간'] },
    rescue: { title: '구조가 필요한 순간이라면.', intro: '안전한 거리에서 동물의 상태를 확인하고 공식 채널로 문의해 주세요. 지역과 현장 상황에 따라 구조 가능 여부가 달라질 수 있습니다.', items: ['발견한 정확한 위치와 시간', '동물의 종류, 마릿수와 상태', '안전한 거리에서 촬영한 현장 사진'] },
    adoption: { title: '가족이 될 준비, 함께 이야기해요.', intro: '입양은 새로운 가족의 생활을 오래 책임지는 결정입니다. 관심 있는 동물의 실제 공고를 확인한 뒤 담당 시설로 상담을 요청해 주세요.', items: ['가족 구성원 모두의 입양 동의', '생활환경과 매일의 돌봄 계획', '방문 가능한 지역과 일정'] },
    facility: { title: '방문 전, 시설에 먼저 문의해 주세요.', intro: '정확한 위치와 운영 일정은 해당 지부에서 안내합니다. 공식 상담 채널에 지부명을 전달해 주세요.', items: ['문의할 지부명', '방문 또는 상담 목적', '방문 가능한 날짜와 인원'] },
    volunteer: { title: '시간을 나누고 싶으신가요?', intro: '봉사 모집 여부와 가능한 활동은 지부마다 다릅니다. 참여할 지역과 시간을 정리해 공식 채널로 문의해 주세요.', items: ['참여하고 싶은 지역', '가능한 날짜와 시간', '개인 또는 단체 참여 여부'] },
    support: { title: '필요한 돌봄을 함께 보태 주세요.', intro: '물품과 협력 제안은 공식 채널로 문의해 주세요. 지부별 수요가 다르므로, 물품은 필요 여부를 확인한 후 전달해 주세요.', items: ['물품 종류 또는 협력 내용', '희망 지역과 전달 방법', '가능한 일정과 수량'] }
  };
  function showConsult(type, facility) {
    const info = consultInfo[type] || consultInfo.general;
    const context = facility ? `<p class="profile-note">문의할 시설: <strong>${facility}</strong></p>` : '';
    openDialog(info.title, `<p class="dialog-intro">${info.intro}</p>${context}<ul class="consult-checklist">${info.items.map(item => `<li>${item}</li>`).join('')}</ul><div class="consult-contact"><a href="tel:07042210091" aria-label="공식 고객센터 070 4221 0091로 전화">070-4221-0091</a><p>공식 고객센터 · 10:00–22:00</p><a class="button" href="https://pf.kakao.com/_VWxixoxj/chat" target="_blank" rel="noopener noreferrer">공식 카카오톡 상담 <span aria-hidden="true">↗</span><span class="sr-only"> (새 창, 인터넷 필요)</span></a></div><p class="dialog-note">이 페이지에서는 신청을 접수하지 않습니다. 전화는 통화 가능한 기기에서, 카카오톡 상담은 인터넷 연결 후 이용할 수 있습니다. 실제 조건은 공식 채널에서 확인해 주세요.</p>`);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-consult]');
    if (button) showConsult(button.dataset.consult, button.dataset.facility);
    const animalButton = event.target.closest('[data-animal]');
    if (!animalButton) return;
    const animal = data.animals.find(item => item.id === animalButton.dataset.animal);
    if (!animal) return;
    openDialog(`${animal.name}를 소개해요.`, `<img class="dialog-photo" src="assets/images/animals/${animal.id}.jpg" alt="${animal.alt}" width="700" height="700"><div class="profile-meta"><span>${animal.species} · ${animal.age} · ${animal.sex}</span><span>${animal.region}</span></div><p class="dialog-intro">${animal.description}</p><p class="profile-note">이 친구는 UI 시연용 가상 프로필입니다. 실제 입양 가능 여부는 공식 입양 공고에서 확인해 주세요.</p><a class="button full-button" href="https://kanimal.org/board/무료입양-포유류/8/" target="_blank" rel="noopener noreferrer">실제 입양 공고 확인 <span aria-hidden="true">↗</span><span class="sr-only"> (공식 사이트, 새 창, 인터넷 필요)</span></a>`, 'MEET YOUR COMPANION · DEMO');
  });
  $('#story-open').addEventListener('click', () => {
    openDialog('보리의 속도로, 한 걸음씩.', '<p class="profile-note">보호와 회복 과정을 설명하기 위한 가상 이야기입니다. 실제 구조 기록이 아닙니다.</p><ol class="story-timeline"><li><strong>낯선 공간에 도착한 날</strong><p>서둘러 다가가기보다 편히 쉴 수 있는 자리를 준비했습니다. 익숙해질 때까지 거리를 두고 기다렸습니다.</p></li><li><strong>몸과 마음을 살피는 시간</strong><p>먹고 쉬는 패턴을 살피고, 필요한 돌봄을 확인합니다. 작은 변화도 놓치지 않는 일상이 시작됩니다.</p></li><li><strong>산책길이 길어진 날</strong><p>짧게 시작한 산책이 조금씩 길어집니다. 새로운 냄새를 맡고, 사람 곁에서 편히 쉬는 시간이 늘어납니다.</p></li><li><strong>이제는, 함께할 가족에게</strong><p>좋아하는 것과 어려워하는 것을 함께 나누고, 보리의 속도를 존중할 가족을 기다립니다.</p></li></ol><button class="button full-button" data-consult="adoption">입양 과정 상담하기 <span aria-hidden="true">↗</span></button>', 'A LIFE AFTER RESCUE · DEMO');
  });

  if ('IntersectionObserver' in window) {
    const beliefObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        $('#about').classList.add('is-read');
        beliefObserver.disconnect();
      }
    }, { threshold: .35 });
    beliefObserver.observe($('#about'));
    if (!reducedMotion.matches) {
      const portraitObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        animalCards.forEach((card, index) => {
          card.style.setProperty('--item-delay', `${index * 65}ms`);
          card.classList.add('filter-enter');
        });
        portraitObserver.disconnect();
      }, { threshold: .08 });
      portraitObserver.observe($('.animal-grid'));
    }
  }

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    $$('.reveal').forEach(element => {
      element.classList.add('is-pending');
      observer.observe(element);
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        $$('.is-pending').forEach(element => element.classList.remove('is-pending'));
        observer.disconnect();
      }
    });
    // Keyboard focus must never land inside a visually concealed reveal block.
    document.addEventListener('focusin', event => {
      const element = event.target.closest('.is-pending');
      if (element) { element.classList.remove('is-pending'); observer.unobserve(element); }
    });
  }
})();
