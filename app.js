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

  /* aktywna pozycja menu na liście ofert */
  var qs=new URLSearchParams(location.search);
  if(document.body.classList.contains('str-oferty')){
    var t=qs.get('t');
    [].forEach.call(nav.querySelectorAll('a[data-k]'),function(a){
      if((t==='sprzedaz'&&a.dataset.k==='sprzedaz')||(t==='wynajem'&&a.dataset.k==='wynajem')) a.setAttribute('aria-current','page');
    });
  }

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

  /* filtry listy ofert */
  var siatka=document.getElementById('siatka');
  if(siatka){
    var st={t:qs.get('t')||'',k:qs.get('k')||'',m:qs.get('m')||''};
    var karty=[].slice.call(siatka.querySelectorAll('.karta'));
    var N=document.getElementById('listaN'), H=document.getElementById('listaH'), pusto=document.getElementById('pusto');
    var fm=document.getElementById('filtrM');
    var nazwyT={'':'Oferty nieruchomości',sprzedaz:'Oferty sprzedaży',wynajem:'Oferty wynajmu'};
    function odm(n){if(n===1)return'oferta';var d=n%10,s=n%100;return(d>=2&&d<=4&&(s<10||s>=20))?'oferty':'ofert';}
    function apply(push){
      var c=0;
      karty.forEach(function(k){var ok=(!st.t||k.dataset.t===st.t)&&(!st.k||k.dataset.k===st.k)&&(!st.m||k.dataset.m===st.m);k.hidden=!ok;if(ok)c++;});
      N.textContent=c+' '+odm(c); H.textContent=nazwyT[st.t]||nazwyT[''];
      pusto.hidden=c>0;
      [].forEach.call(document.querySelectorAll('.filtry .chip'),function(ch){ch.setAttribute('aria-pressed',st[ch.dataset.f]===ch.dataset.v?'true':'false');});
      fm.hidden=!st.m; if(st.m) fm.querySelector('b').textContent=st.m;
      [].forEach.call(nav.querySelectorAll('a[data-k]'),function(a){if(a.dataset.k==='sprzedaz'||a.dataset.k==='wynajem'){if(a.dataset.k===st.t)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}});
      if(push){var u=new URLSearchParams();['t','k','m'].forEach(function(x){if(st[x])u.set(x,st[x]);});history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''));}
    }
    [].forEach.call(document.querySelectorAll('.filtry .chip'),function(ch){ch.addEventListener('click',function(){st[ch.dataset.f]=ch.dataset.v;apply(true);});});
    document.getElementById('filtrMx').addEventListener('click',function(){st.m='';apply(true);});
    apply(false);
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
