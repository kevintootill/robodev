(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key,value) => { try { localStorage.setItem(key,value); } catch { /* Preferences remain active for this visit. */ } };
  let paused = read('robodev-motion') === 'paused' || reduced.matches;
  function updateMotion() {
    root.dataset.paused = String(paused || reduced.matches);
    document.querySelectorAll('[data-motion-toggle]').forEach(button => {
      const off = paused || reduced.matches;
      button.setAttribute('aria-pressed', String(off));
      const label = button.querySelector('span') || button;
      label.textContent = off ? (reduced.matches ? 'Reduced motion' : 'Resume motion') : 'Pause motion';
      button.disabled = reduced.matches;
      button.title = reduced.matches ? 'Your device prefers reduced motion' : 'Pause or resume decorative animation';
    });
  }
  updateMotion();
  document.querySelectorAll('[data-motion-toggle]').forEach(button => button.addEventListener('click', () => {
    paused = !paused;
    save('robodev-motion',paused ? 'paused' : 'running');
    updateMotion();
  }));
  reduced.addEventListener('change',updateMotion);
  const accents = { ice:'#b0d9ef', amber:'#e4bd8a', steel:'#d0d5da' };
  function setPalette(value) {
    if (!accents[value]) value = 'ice';
    root.style.setProperty('--accent',accents[value]);
    document.querySelectorAll('[data-palette]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.palette===value)));
  }
  setPalette(read('robodev-palette'));
  document.querySelectorAll('[data-palette]').forEach(button=>button.addEventListener('click',()=>{
    setPalette(button.dataset.palette);save('robodev-palette',button.dataset.palette);
  }));
  if ('IntersectionObserver' in window && !reduced.matches && !paused) {
    root.classList.add('js-motion');
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(panel=>observer.observe(panel));
  }
  document.querySelectorAll('.machine').forEach(machine=>{
    let frame;
    machine.addEventListener('pointermove',event=>{
      if(paused || reduced.matches || event.pointerType==='touch') return;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const rect=machine.getBoundingClientRect();
        machine.style.setProperty('--px',((event.clientX-rect.left)/rect.width-.5)*18+'px');
        machine.style.setProperty('--py',((event.clientY-rect.top)/rect.height-.5)*12+'px');
      });
    });
    machine.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);machine.style.setProperty('--px','0px');machine.style.setProperty('--py','0px');});
  });
  const tabs = [...document.querySelectorAll('[data-tab]')];
  function selectTab(tab,focus=false){
    tabs.forEach(button=>{const selected=button===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;document.getElementById(button.getAttribute('aria-controls')).hidden=!selected;});
    if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectTab(tab));
    tab.addEventListener('keydown',event=>{
      const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index-1+tabs.length)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;
      if(next!==null){event.preventDefault();selectTab(tabs[next],true);}
    });
  });
  const studies=['structure','orbit','signal'];
  document.querySelectorAll('[data-study]').forEach(button=>button.addEventListener('click',()=>{
    const value=button.dataset.study;
    document.querySelector('.study-art').dataset.study=value;
    document.querySelectorAll('[data-study]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    document.getElementById('study-number').textContent=String(studies.indexOf(value)+1).padStart(2,'0');
    document.getElementById('study-name').textContent=value.toUpperCase();
  }));
  document.getElementById('motion-speed')?.addEventListener('input',event=>{
    const speed=Number(event.target.value);
    document.querySelector('.study-art').style.setProperty('--motion-duration',32/speed+'s');
    document.getElementById('speed-value').textContent=speed.toFixed(1)+'×';
  });
  const notes=document.getElementById('field-notes');
  document.querySelectorAll('[data-open-notes]').forEach(button=>button.addEventListener('click',()=>notes.showModal()));
  document.querySelector('[data-close-notes]')?.addEventListener('click',()=>notes.close());
  notes?.addEventListener('click',event=>{if(event.target===notes){const rect=notes.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)notes.close();}});
  document.getElementById('year').textContent=new Date().getFullYear();
  const clock=document.querySelector('.live-clock');
  const clockFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const updateClock=()=>{clock.textContent='LONDON / '+clockFormat.format(new Date());};
  updateClock();setInterval(updateClock,1000);
})();
