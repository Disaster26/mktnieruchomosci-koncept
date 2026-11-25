(function(){
  'use strict';
  var rok=document.getElementById('rok'); if(rok) rok.textContent=new Date().getFullYear();

  /* menu mobilne */
  var b=document.getElementById('burger'), nav=document.getElementById('nav');
  function zamknij(){nav.classList.remove('otw');b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Otwórz menu');document.body.style.overflow='';}
  if(b){
    b.addEventListener('click',function(){
      var o=!nav.classList.contains('otw');
      nav.classList.toggle('otw',o);b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');
      document.body.style.overflow=o?'hidden':'';
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape')zamknij();});
  }

  var qs=new URLSearchParams(location.search);

  /* przeciąganie myszą dla przewijanych pasów */
  function drag(el){
    var down=false,sx=0,sl=0,moved=false;
    el.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='mouse'||e.button!==0) return;
      down=true;moved=false;sx=e.clientX;sl=el.scrollLeft;
    });
    window.addEventListener('pointermove',function(e){
      if(!down) return;
      var dx=e.clientX-sx;
      if(!moved&&Math.abs(dx)>5){moved=true;el.classList.add('ciag');}
      if(moved){el.scrollLeft=sl-dx;e.preventDefault();}
    },{passive:false});
    window.addEventListener('pointerup',function(){
      if(!down) return; down=false;
      if(moved){
        el.classList.remove('ciag');
        var w=el.firstElementChild?el.firstElementChild.getBoundingClientRect().width:el.clientWidth;
        var gap=parseFloat(getComputedStyle(el).columnGap)||0;
        var step=w+gap, i=Math.round(el.scrollLeft/step);
        el.scrollTo({left:i*step,behavior:'smooth'});
        setTimeout(function(){moved=false;},0);
      }
    });
    el.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();}},true);
    el.addEventListener('dragstart',function(e){e.preventDefault();});
  }

  /* zdjęcia mniejsze niż miejsce w galerii nie są rozciągane */
  function male(){[].forEach.call(document.querySelectorAll('.car-sl img[data-nw]'),function(im){
    var s=im.parentElement; s.classList.remove('mala');
    var r=s.getBoundingClientRect(), nw=+im.dataset.nw, nh=nw*(+im.getAttribute('height'))/(+im.getAttribute('width'));
    if(r.width&&Math.max(r.width/nw,r.height/nh)>1.1) s.classList.add('mala');
  });}
  male(); window.addEventListener('resize',function(){window.requestAnimationFrame(male);});

  /* karuzele zdjęć w kartach i w galerii oferty */
  [].forEach.call(document.querySelectorAll('.car'),function(c){
    var tr=c.querySelector('.car-tr'), n=tr.children.length, cnt=c.querySelector('.car-c b');
    var p=c.querySelector('.car-p'), nx=c.querySelector('.car-n');
    var minis=c.parentElement.querySelectorAll('.mini');
    function idx(){return Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));}
    function go(i){i=Math.max(0,Math.min(n-1,i));tr.scrollTo({left:i*tr.clientWidth,behavior:'smooth'});}
    function upd(){
      var i=idx(); if(cnt) cnt.textContent=i+1;
      if(p) p.disabled=i<=0; if(nx) nx.disabled=i>=n-1;
      [].forEach.call(minis,function(m,k){m.setAttribute('aria-current',k===i?'true':'false');if(k===i&&m.scrollIntoView&&m.parentElement.scrollWidth>m.parentElement.clientWidth){var pr=m.parentElement;pr.scrollTo({left:m.offsetLeft-pr.clientWidth/2+m.clientWidth/2,behavior:'smooth'});}});
    }
    if(n<2){ if(p)p.hidden=true; if(nx)nx.hidden=true; }
    if(p) p.addEventListener('click',function(e){e.preventDefault();go(idx()-1);});
    if(nx) nx.addEventListener('click',function(e){e.preventDefault();go(idx()+1);});
    tr.addEventListener('scroll',function(){window.requestAnimationFrame(upd);},{passive:true});
    tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(idx()+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(idx()-1);}});
    [].forEach.call(minis,function(m){m.addEventListener('click',function(){go(+m.dataset.i);});});
    drag(tr); upd();
  });

  /* rzędy kart */
  [].forEach.call(document.querySelectorAll('[data-rzad]'),function(r){
    var tr=r.querySelector('.rzad-tr'), p=r.querySelector('.rz-p'), nx=r.querySelector('.rz-n');
    function step(){var k=tr.querySelector('.karta');return k?k.getBoundingClientRect().width+16:300;}
    function upd(){if(p)p.disabled=tr.scrollLeft<4; if(nx)nx.disabled=tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-4;}
    if(p)p.addEventListener('click',function(){tr.scrollBy({left:-step(),behavior:'smooth'});});
    if(nx)nx.addEventListener('click',function(){tr.scrollBy({left:step(),behavior:'smooth'});});
    tr.addEventListener('scroll',function(){window.requestAnimationFrame(upd);},{passive:true});
    upd();
  });

  /* pokaz zdjęć w pierwszym ekranie */
  var hs=document.getElementById('hs');
  if(hs){
    var dots=[].slice.call(document.querySelectorAll('#hsd button')), hn=hs.children.length, stop=false, tm;
    function hi(){return Math.round(hs.scrollLeft/Math.max(1,hs.clientWidth));}
    function hgo(i){hs.scrollTo({left:((i+hn)%hn)*hs.clientWidth,behavior:'smooth'});}
    hs.addEventListener('scroll',function(){var i=hi();dots.forEach(function(d,k){d.setAttribute('aria-current',k===i?'true':'false');});},{passive:true});
    dots.forEach(function(d,k){d.addEventListener('click',function(){stop=true;hgo(k);});});
    ['pointerdown','touchstart','wheel','keydown'].forEach(function(ev){hs.addEventListener(ev,function(){stop=true;},{passive:true});});
    var red=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!red){tm=setInterval(function(){if(stop||document.hidden){return;}hgo(hi()+1);},6000);}
    drag(hs);
  }

  /* dolny pasek po przewinięciu za przyciski pierwszego ekranu */
  var mob=document.getElementById('mob');
  if(mob&&'IntersectionObserver' in window){
    var cel=document.getElementById('heroCta')||document.querySelector('.of-bok .btn')||document.querySelector('.ph')||document.getElementById('top');
    var stopka=document.querySelector('.stopka'), za=false, przy=false;
    function pokaz(){var v=za&&!przy;mob.classList.toggle('widac',v);mob.setAttribute('aria-hidden',v?'false':'true');[].forEach.call(mob.querySelectorAll('a'),function(a){a.tabIndex=v?0:-1;});}
    new IntersectionObserver(function(e){za=!e[0].isIntersecting&&e[0].boundingClientRect.top<0;pokaz();}).observe(cel);
    if(stopka) new IntersectionObserver(function(e){przy=e[0].isIntersecting;pokaz();}).observe(stopka);
  }

  /* wyszukiwarka ofert */
  var szw=document.getElementById('szukW');
  if(szw){var mq=window.matchMedia('(min-width:700px)');function szo(){if(mq.matches)szw.open=true;}szo();if(mq.addEventListener)mq.addEventListener('change',szo);
    var q0=new URLSearchParams(location.search);if(['m','c1','c2','a1','a2'].some(function(x){return q0.get(x);}))szw.open=true;}
  var siatka=document.getElementById('siatka');
  if(siatka){
    var pola={m:document.getElementById('fM'),c1:document.getElementById('fC1'),c2:document.getElementById('fC2'),a1:document.getElementById('fA1'),a2:document.getElementById('fA2')};
    var st={k:qs.get('k')||''};
    Object.keys(pola).forEach(function(x){st[x]=qs.get(x)||'';if(pola[x])pola[x].value=st[x];});
    if(pola.m&&st.m&&pola.m.value!==st.m){var op=document.createElement('option');op.textContent=st.m;pola.m.appendChild(op);pola.m.value=st.m;}
    var karty=[].slice.call(siatka.querySelectorAll('.karta'));
    var N=document.getElementById('listaN'), pusto=document.getElementById('pusto'), X=document.getElementById('fX');
    function odm(n){if(n===1)return'oferta';var d=n%10,s=n%100;return(d>=2&&d<=4&&(s<10||s>=20))?'oferty':'ofert';}
    function liczba(v){v=String(v||'').replace(/\s/g,'').replace(',','.');var n=parseFloat(v);return isNaN(n)?null:n;}
    function apply(push){
      var c=0,c1=liczba(st.c1),c2=liczba(st.c2),a1=liczba(st.a1),a2=liczba(st.a2);
      karty.forEach(function(k){
        var cena=+k.dataset.c, pow=+k.dataset.a;
        var ok=(!st.k||k.dataset.k===st.k)&&(!st.m||k.dataset.m===st.m)&&(c1===null||cena>=c1)&&(c2===null||cena<=c2)&&(a1===null||pow>=a1)&&(a2===null||pow<=a2);
        k.hidden=!ok;if(ok)c++;
      });
      N.textContent=c+' '+odm(c); pusto.hidden=c>0;
      [].forEach.call(document.querySelectorAll('.filtry button.chip'),function(ch){ch.setAttribute('aria-pressed',st[ch.dataset.f]===ch.dataset.v?'true':'false');});
      var akt=['k','m','c1','c2','a1','a2'].some(function(x){return st[x];}); if(X)X.hidden=!akt;
      if(push){var u=new URLSearchParams();['k','m','c1','c2','a1','a2'].forEach(function(x){if(st[x])u.set(x,st[x]);});history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''));}
    }
    [].forEach.call(document.querySelectorAll('.filtry button.chip'),function(ch){ch.addEventListener('click',function(){st[ch.dataset.f]=ch.dataset.v;apply(true);});});
    Object.keys(pola).forEach(function(x){if(!pola[x])return;pola[x].addEventListener(x==='m'?'change':'input',function(){st[x]=pola[x].value.trim();apply(true);});});
    if(X)X.addEventListener('click',function(){Object.keys(st).forEach(function(x){st[x]='';if(pola[x])pola[x].value='';});apply(true);});
    apply(false);
  }

  /* powiększanie zdjęć oferty */
  var duza=document.querySelector('.car-duza');
  if(duza){
    var imgs=[].slice.call(duza.querySelectorAll('.car-sl img')), lb=null, ltr, lcnt;
    function zbuduj(){
      lb=document.createElement('div');lb.className='lb';lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Zdjęcia oferty');
      lb.innerHTML='<div class="lb-pas"><span class="lb-c"></span><div class="lb-nav"><button type="button" class="lb-p" aria-label="Poprzednie zdjęcie"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button><button type="button" class="lb-n" aria-label="Następne zdjęcie"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button><button type="button" class="lb-x" aria-label="Zamknij"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button></div></div><div class="lb-tr"></div>';
      ltr=lb.querySelector('.lb-tr'); lcnt=lb.querySelector('.lb-c');
      imgs.forEach(function(im){var s=document.createElement('div');s.className='lb-sl';var i=document.createElement('img');i.alt=im.alt;i.dataset.src=im.dataset.l||im.currentSrc||im.src;s.appendChild(i);ltr.appendChild(s);
        i.addEventListener('click',function(e){var z=!s.classList.contains('zoom');s.classList.toggle('zoom',z);if(z){var r=i.getBoundingClientRect();s.scrollLeft=(e.clientX-r.left)*(i.naturalWidth/r.width)-s.clientWidth/2;s.scrollTop=(e.clientY-r.top)*(i.naturalHeight/r.height)-s.clientHeight/2;}});});
      document.body.appendChild(lb);
      function li(){return Math.round(ltr.scrollLeft/Math.max(1,ltr.clientWidth));}
      function laduj(i){[i-1,i,i+1].forEach(function(k){var e=ltr.children[k];if(e){var im=e.firstChild;if(!im.src)im.src=im.dataset.src;}});}
      function lgo(i){i=Math.max(0,Math.min(imgs.length-1,i));laduj(i);ltr.scrollTo({left:i*ltr.clientWidth});}
      ltr.addEventListener('scroll',function(){var i=li();lcnt.textContent=(i+1)+' / '+imgs.length;laduj(i);},{passive:true});
      lb.querySelector('.lb-p').addEventListener('click',function(){lgo(li()-1);});
      lb.querySelector('.lb-n').addEventListener('click',function(){lgo(li()+1);});
      lb.querySelector('.lb-x').addEventListener('click',zamk);
      document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')zamk();if(e.key==='ArrowRight')lgo(li()+1);if(e.key==='ArrowLeft')lgo(li()-1);});
      lb.lgo=lgo;
    }
    var powrot=null;
    function otworz(i){if(!lb)zbuduj();powrot=document.activeElement;lb.hidden=false;document.body.style.overflow='hidden';[].forEach.call(ltr.children,function(s){s.classList.remove('zoom');});lb.lgo(i);lcnt.textContent=(i+1)+' / '+imgs.length;lb.querySelector('.lb-x').focus();}
    function zamk(){lb.hidden=true;document.body.style.overflow='';if(powrot)powrot.focus();}
    var dtr=duza.querySelector('.car-tr'), ruch=false, px=0;
    dtr.addEventListener('pointerdown',function(e){px=e.clientX;ruch=false;});
    dtr.addEventListener('pointerup',function(e){ruch=Math.abs(e.clientX-px)>6;});
    imgs.forEach(function(im,i){im.addEventListener('click',function(){if(!ruch)otworz(i);});});
    var zb=duza.querySelector('.car-zoom'); if(zb)zb.addEventListener('click',function(){otworz(Math.round(dtr.scrollLeft/Math.max(1,dtr.clientWidth)));});
  }

  /* formularze pokazowe */
  [].forEach.call(document.querySelectorAll('form[data-demo]'),function(f){
    f.addEventListener('submit',function(e){e.preventDefault();f.classList.add('wyslano');var i=f.querySelector('.form-info');if(i)i.textContent='Podgląd strony: w gotowej wersji wiadomość trafi na biuro@mktnieruchomosci.pl.';});
  });

  /* baner cookies (strony z mapą) */
  var ck=document.getElementById('cookies');
  if(ck){
    var z=null; try{z=localStorage.getItem('mkt-cookies');}catch(e){}
    if(!z) ck.hidden=false;
    [].forEach.call(ck.querySelectorAll('button'),function(bt){bt.addEventListener('click',function(){try{localStorage.setItem('mkt-cookies',bt.dataset.c);}catch(e){}ck.hidden=true;});});
  }
})();
