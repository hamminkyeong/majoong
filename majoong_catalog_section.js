
document.addEventListener('DOMContentLoaded', function(){

  /* =================================
     카탈로그
  ================================= */

  const catalogTotal = 18;
  let catalogCurrent = 1;

  const mobileQuery = window.matchMedia('(max-width: 900px), (pointer: coarse)');

  const isMobile = () => {
    const rightPage = document.getElementById('pageRight');
    const cssUsesSinglePage = rightPage &&
      window.getComputedStyle(rightPage).display === 'none';

    return mobileQuery.matches || Boolean(cssUsesSinglePage);
  };

  const $ = id => document.getElementById(id);

  const left = $('pageLeft');
  const right = $('pageRight');
  const noL = $('pageNoLeft');
  const noR = $('pageNoRight');
  const pageStatus = $('pageStatus');

  const modal = $('zoomModal');
  const zL = $('zoomLeft');
  const zR = $('zoomRight');
  const zStatus = $('zoomStatus');


  // 카탈로그 이미지 경로 후보
  const imageCandidates = n => {
    const two = String(n).padStart(2, '0');
    const one = String(n);

    const names = [
      `page-${two}.jpg`, `page-${one}.jpg`,
      `page-${two}.jpeg`, `page-${one}.jpeg`,
      `page-${two}.png`, `page-${one}.png`,
      `page_${two}.jpg`, `page_${one}.jpg`,
      `page_${two}.png`, `page_${one}.png`
    ];

    const folders = [
      'catalog_pages/',
      './catalog_pages/',
      'images/catalog_pages/'
    ];

    return folders.flatMap(folder =>
      names.map(name => folder + name)
    );
  };


  function setImage(img, n){
    if(!img) return;

    if(!Number.isInteger(n) || n < 1 || n > catalogTotal){
      img.removeAttribute('src');
      img.style.display = 'none';
      img.onerror = null;
      return;
    }

    const candidates = imageCandidates(n);
    let candidateIndex = 0;

    img.onerror = function(){
      candidateIndex++;

      if(candidateIndex < candidates.length){
        img.src = candidates[candidateIndex];
      }else{
        img.onerror = null;
        img.style.display = 'none';

        console.error(
          `카탈로그 ${n}페이지 이미지를 찾지 못했습니다.`,
          candidates
        );
      }
    };

    img.onload = function(){
      img.style.display = 'block';
    };

    img.style.display = 'block';
    img.src = candidates[candidateIndex];
  }


  function drawCatalog(){
    const mobile = isMobile();

    const secondPage = mobile
      ? null
      : catalogCurrent + 1;

    const lastShown = mobile
      ? catalogCurrent
      : Math.min(catalogCurrent + 1, catalogTotal);

    setImage(left, catalogCurrent);
    setImage(right, secondPage);

    if(noL){
      noL.textContent =
        catalogCurrent <= catalogTotal
          ? catalogCurrent
          : '';
    }

    if(noR){
      noR.textContent =
        mobile || catalogCurrent + 1 > catalogTotal
          ? ''
          : catalogCurrent + 1;
    }

    if(pageStatus){
      pageStatus.textContent = mobile
        ? `${catalogCurrent} / ${catalogTotal}`
        : `${catalogCurrent}–${lastShown} / ${catalogTotal}`;
    }

    if(modal && modal.classList.contains('open')){
      setImage(zL, catalogCurrent);
      setImage(zR, secondPage);

      if(zStatus){
        zStatus.textContent = mobile
          ? `${catalogCurrent} / ${catalogTotal}`
          : `${catalogCurrent}–${lastShown} / ${catalogTotal}`;
      }
    }

    const prevButtons = [
      $('prevBtn'),
      $('zoomPrev')
    ].filter(Boolean);

    const nextButtons = [
      $('nextBtn'),
      $('zoomNext')
    ].filter(Boolean);

    prevButtons.forEach(button =>
      button.disabled = catalogCurrent <= 1
    );

    nextButtons.forEach(button => {
      button.disabled = mobile
        ? catalogCurrent >= catalogTotal
        : catalogCurrent + 1 >= catalogTotal;
    });
  }


  function nextCatalog(){
    const mobile = isMobile();
    const step = mobile ? 1 : 2;
    const lastStart = mobile
      ? catalogTotal
      : catalogTotal - 1;

    if(catalogCurrent + step <= lastStart){
      catalogCurrent += step;
      drawCatalog();
    }
  }


  function prevCatalog(){
    const mobile = isMobile();
    const step = mobile ? 1 : 2;

    if(catalogCurrent > 1){
      catalogCurrent = Math.max(1, catalogCurrent - step);
      drawCatalog();
    }
  }


  if($('prevBtn')) $('prevBtn').onclick = prevCatalog;
  if($('nextBtn')) $('nextBtn').onclick = nextCatalog;
  if($('zoomPrev')) $('zoomPrev').onclick = prevCatalog;
  if($('zoomNext')) $('zoomNext').onclick = nextCatalog;


  if($('zoomBtn')){
    $('zoomBtn').onclick = function(){
      if(!modal) return;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      drawCatalog();
    };
  }


  function closeModal(){
    if(!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }


  if($('closeBtn')) $('closeBtn').onclick = closeModal;
  if($('zoomBg')) $('zoomBg').onclick = closeModal;


  document.addEventListener('keydown', function(e){
    if(!modal || !modal.classList.contains('open')) return;

    if(e.key === 'Escape') closeModal();
    if(e.key === 'ArrowLeft') prevCatalog();
    if(e.key === 'ArrowRight') nextCatalog();
  });


  function handleCatalogModeChange(){
    if(!isMobile() && catalogCurrent % 2 === 0){
      catalogCurrent = Math.max(1, catalogCurrent - 1);
    }

    drawCatalog();
  }


  if(typeof mobileQuery.addEventListener === 'function'){
    mobileQuery.addEventListener('change', handleCatalogModeChange);
  }else if(typeof mobileQuery.addListener === 'function'){
    mobileQuery.addListener(handleCatalogModeChange);
  }

  drawCatalog();


  /* =================================
     납품실적
     PC 4개 / 태블릿 2개 / 모바일 1개
  ================================= */

  const recordTrack = $('recordTrack');
  const recordPrev = $('recordPrev');
  const recordNext = $('recordNext');
  const recordStatus = $('recordStatus');
  const recordDotsContainer = $('recordDots');

  if(recordTrack && recordPrev && recordNext){

    const recordItems = Array.from(
      recordTrack.querySelectorAll('.record-item')
    );

    let cardsPerPage = 4;
    let recordPage = 0;
    let totalRecordPages = 0;


    function getCardStep(){
      if(!recordItems.length) return 0;

      const cardWidth =
        recordItems[0].getBoundingClientRect().width;

      const gap =
        parseFloat(getComputedStyle(recordTrack).gap) || 0;

      return cardWidth + gap;
    }


    function drawRecordDots(){
      if(!recordDotsContainer) return;

      recordDotsContainer.innerHTML = '';

      for(let i = 0; i < totalRecordPages; i++){
        const dot = document.createElement('button');

        dot.type = 'button';
        dot.classList.toggle('active', i === recordPage);
        dot.setAttribute('aria-label', `${i + 1}페이지`);

        dot.addEventListener('click', function(){
          recordPage = i;
          drawRecords();
        });

        recordDotsContainer.appendChild(dot);
      }
    }


    function drawRecords(){
      const step = getCardStep();

      const move =
        recordPage * cardsPerPage * step;

      recordTrack.style.transform =
        `translateX(-${move}px)`;


      if(recordStatus){
        const start =
          recordPage * cardsPerPage + 1;

        const end = Math.min(
          start + cardsPerPage - 1,
          recordItems.length
        );

        recordStatus.textContent =
          `${String(start).padStart(2, '0')}–${String(end).padStart(2, '0')} / ${String(recordItems.length).padStart(2, '0')}`;
      }


      if(recordDotsContainer){
        Array.from(recordDotsContainer.children).forEach(
          function(dot, index){
            dot.classList.toggle(
              'active',
              index === recordPage
            );
          }
        );
      }


      recordPrev.disabled = recordPage === 0;

      recordNext.disabled =
        recordPage >= totalRecordPages - 1;

      recordPrev.style.opacity =
        recordPage === 0 ? '.45' : '1';

      recordNext.style.opacity =
        recordPage >= totalRecordPages - 1 ? '.45' : '1';
    }


    function updateRecordLayout(){
      const screenWidth =
        document.documentElement.clientWidth || window.innerWidth;

      if(screenWidth <= 800){
        cardsPerPage = 1;
      }else if(screenWidth <= 1100){
        cardsPerPage = 2;
      }else{
        cardsPerPage = 4;
      }

      totalRecordPages = Math.ceil(
        recordItems.length / cardsPerPage
      );

      recordPage = Math.min(
        recordPage,
        Math.max(0, totalRecordPages - 1)
      );

      drawRecordDots();
      drawRecords();
    }


    recordNext.addEventListener('click', function(e){
      e.preventDefault();

      if(recordPage < totalRecordPages - 1){
        recordPage++;
        drawRecords();
      }
    });


    recordPrev.addEventListener('click', function(e){
      e.preventDefault();

      if(recordPage > 0){
        recordPage--;
        drawRecords();
      }
    });


    window.addEventListener('resize', updateRecordLayout);

    updateRecordLayout();
  }


  /* =================================
     게시판
     7개씩 페이지 이동
  ================================= */

  const items = Array.from(
    document.querySelectorAll('#noticeSlider .notice-item')
  );

  const prev = $('boardPrev');
  const next = $('boardNext');
  const status = $('boardStatus');
  const dotsWrap = $('boardDots');

  if(items.length && prev && next){

    const itemsPerPage = 7;

    const totalPages = Math.ceil(
      items.length / itemsPerPage
    );

    let currentPage = 0;


    function createDots(){
      if(!dotsWrap) return;

      dotsWrap.innerHTML = '';

      for(let i = 0; i < totalPages; i++){
        const dot = document.createElement('button');

        dot.type = 'button';
        dot.setAttribute('aria-label', `${i + 1}페이지`);

        dot.addEventListener('click', function(){
          showBoard(i);
        });

        dotsWrap.appendChild(dot);
      }
    }


    function showBoard(page){
      currentPage = Math.max(
        0,
        Math.min(page, totalPages - 1)
      );

      const start = currentPage * itemsPerPage;

      const end = Math.min(
        start + itemsPerPage,
        items.length
      );

      items.forEach((item, index) => {
        item.style.display =
          index >= start && index < end
            ? 'grid'
            : 'none';
      });

      if(status){
        status.textContent =
          `${String(start + 1).padStart(2, '0')}–${String(end).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      }

      prev.disabled = currentPage === 0;
      next.disabled = currentPage === totalPages - 1;

      if(dotsWrap){
        Array.from(dotsWrap.querySelectorAll('button')).forEach(
          (dot, index) => {
            dot.classList.toggle('active', index === currentPage);
          }
        );
      }
    }


    prev.addEventListener('click', function(e){
      e.preventDefault();

      if(currentPage > 0){
        showBoard(currentPage - 1);
      }
    });


    next.addEventListener('click', function(e){
      e.preventDefault();

      if(currentPage < totalPages - 1){
        showBoard(currentPage + 1);
      }
    });


    createDots();
    showBoard(0);
  }


  /* =========================================
     메인 마중이 이미지 슬라이드
  ========================================= */

  const mascotSlides = Array.from(
    document.querySelectorAll('.mascot-slide')
  );

  if(mascotSlides.length > 1){
    let mascotCurrent = 0;

    setInterval(() => {
      mascotSlides[mascotCurrent].classList.remove('active');

      mascotCurrent++;

      if(mascotCurrent >= mascotSlides.length){
        mascotCurrent = 0;
      }

      mascotSlides[mascotCurrent].classList.add('active');
    }, 3000);
  }

});
