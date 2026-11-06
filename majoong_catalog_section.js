document.addEventListener('DOMContentLoaded', function(){

  /* =================================
     카탈로그
  ================================= */

  const catalogTotal = 18;
  let catalogCurrent = 1;

  const imgPath = n =>
    `catalog_pages/page-${String(n).padStart(2,'0')}.jpg`;

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

  // CSS와 동일한 기준으로 모바일에서는 한 장씩, PC에서는 두 장씩 표시
  const mobileQuery = window.matchMedia('(max-width: 600px)');
  const isMobile = () => mobileQuery.matches;

  function setImage(img, n){
    if(!img) return;

    if(Number.isInteger(n) && n >= 1 && n <= catalogTotal){
      img.src = imgPath(n);
      img.style.display = 'block';
    }else{
      img.removeAttribute('src');
      img.style.display = 'none';
    }
  }

  function drawCatalog(){
    const mobile = isMobile();
    const secondPage = mobile ? null : catalogCurrent + 1;
    const lastShown = mobile
      ? catalogCurrent
      : Math.min(catalogCurrent + 1, catalogTotal);

    // 본문 카탈로그
    setImage(left, catalogCurrent);
    setImage(right, secondPage);

    if(noL){
      noL.textContent = catalogCurrent <= catalogTotal ? catalogCurrent : '';
    }
    if(noR){
      noR.textContent = mobile || catalogCurrent + 1 > catalogTotal
        ? ''
        : catalogCurrent + 1;
    }

    if(pageStatus){
      pageStatus.textContent = mobile
        ? `${catalogCurrent} / ${catalogTotal}`
        : `${catalogCurrent}–${lastShown} / ${catalogTotal}`;
    }

    // 확대 보기 역시 모바일은 한 장, PC는 두 장
    if(modal && modal.classList.contains('open')){
      setImage(zL, catalogCurrent);
      setImage(zR, secondPage);

      if(zStatus){
        zStatus.textContent = mobile
          ? `${catalogCurrent} / ${catalogTotal}`
          : `${catalogCurrent}–${lastShown} / ${catalogTotal}`;
      }
    }

    const prevButtons = [$('prevBtn'), $('zoomPrev')].filter(Boolean);
    const nextButtons = [$('nextBtn'), $('zoomNext')].filter(Boolean);
    prevButtons.forEach(button => button.disabled = catalogCurrent <= 1);
    nextButtons.forEach(button => {
      button.disabled = mobile
        ? catalogCurrent >= catalogTotal
        : catalogCurrent + 1 >= catalogTotal;
    });
  }

  function nextCatalog(){
    const step = isMobile() ? 1 : 2;
    const lastStart = isMobile() ? catalogTotal : catalogTotal - 1;

    if(catalogCurrent + step <= lastStart){
      catalogCurrent += step;
      drawCatalog();
    }
  }

  function prevCatalog(){
    const step = isMobile() ? 1 : 2;

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

  // 화면 방향이나 창 크기가 바뀌면 표시 모드만 전환
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
     4개씩 넘기기
  ================================= */

  const recordTrack =
    document.getElementById('recordTrack');

  const recordPrev =
    document.getElementById('recordPrev');

  const recordNext =
    document.getElementById('recordNext');

  const recordStatus =
    document.getElementById('recordStatus');

  const recordDots =
    document.querySelectorAll('.record-dots button');


  if(
    !recordTrack ||
    !recordPrev ||
    !recordNext
  ){
    return;
  }


  const recordItems =
    Array.from(
      recordTrack.querySelectorAll('.record-item')
    );


  const cardsPerPage = 4;

  let recordPage = 0;


  const totalRecordPages =
    Math.ceil(
      recordItems.length / cardsPerPage
    );


  recordPrev.style.zIndex = '30';
  recordNext.style.zIndex = '30';


  function getCardStep(){

    if(!recordItems.length){
      return 0;
    }


    const cardWidth =
      recordItems[0]
        .getBoundingClientRect()
        .width;


    const gap =
      parseFloat(
        getComputedStyle(recordTrack).gap
      ) || 0;


    return cardWidth + gap;

  }


  function drawRecords(){

    const step =
      getCardStep();


    const move =
      recordPage *
      cardsPerPage *
      step;


    recordTrack.style.transform =
      `translateX(-${move}px)`;


    if(recordStatus){

      const start =
        recordPage *
        cardsPerPage + 1;

      const end =
        Math.min(
          start + cardsPerPage - 1,
          recordItems.length
        );


      recordStatus.textContent =
        `${String(start).padStart(2,'0')}–${String(end).padStart(2,'0')} / ${String(recordItems.length).padStart(2,'0')}`;

    }


    recordDots.forEach(function(dot,index){

      dot.classList.toggle(
        'active',
        index === recordPage
      );

    });

recordPrev.disabled = false;

recordNext.disabled =
  recordPage >= totalRecordPages - 1;


    recordPrev.style.opacity =
      recordPage === 0
        ? '.45'
        : '1';

    recordNext.style.opacity =
      recordPage >= totalRecordPages - 1
        ? '.45'
        : '1';


    recordNext.style.display = 'flex';
    recordNext.style.visibility = 'visible';
    recordNext.style.pointerEvents = 'auto';

    recordPrev.style.display = 'flex';
    recordPrev.style.visibility = 'visible';
    recordPrev.style.pointerEvents = 'auto';

  }


  recordNext.addEventListener(
    'click',
    function(e){

      e.preventDefault();

      if(
        recordPage <
        totalRecordPages - 1
      ){

        recordPage++;

        drawRecords();

      }

    }
  );


  recordPrev.addEventListener(
    'click',
    function(e){

      e.preventDefault();

      if(recordPage > 0){

        recordPage--;

        drawRecords();

      }

    }
  );


  recordDots.forEach(
    function(dot,index){

      dot.addEventListener(
        'click',
        function(){

          if(
            index <
            totalRecordPages
          ){

            recordPage = index;

            drawRecords();

          }

        }
      );

    }
  );


  window.addEventListener(
    'resize',
    function(){

      drawRecords();

    }
  );


  drawRecords();

});


/* =================================
   게시판
   7개씩 페이지 이동
================================= */

document.addEventListener("DOMContentLoaded", () => {

  const items =
    Array.from(
      document.querySelectorAll("#noticeSlider .notice-item")
    );

  const prev =
    document.getElementById("boardPrev");

  const next =
    document.getElementById("boardNext");

  const status =
    document.getElementById("boardStatus");

  const dotsWrap =
    document.getElementById("boardDots");


  if(
    !items.length ||
    !prev ||
    !next
  ){
    return;
  }


  /* 한 페이지에 7개 */

  const itemsPerPage = 7;

  const totalPages =
    Math.ceil(
      items.length / itemsPerPage
    );

  let currentPage = 0;


  /* =================================
     페이지 점 만들기
  ================================= */

  function createDots(){

    if(!dotsWrap){
      return;
    }

    dotsWrap.innerHTML = "";


    for(
      let i = 0;
      i < totalPages;
      i++
    ){

      const dot =
        document.createElement("button");

      dot.type = "button";

      dot.setAttribute(
        "aria-label",
        `${i + 1}페이지`
      );


      dot.addEventListener(
        "click",
        () => {

          showBoard(i);

        }
      );


      dotsWrap.appendChild(dot);

    }

  }


  /* =================================
     게시판 페이지 표시
  ================================= */

  function showBoard(page){

    currentPage =
      Math.max(
        0,
        Math.min(
          page,
          totalPages - 1
        )
      );


    const start =
      currentPage *
      itemsPerPage;


    const end =
      Math.min(
        start + itemsPerPage,
        items.length
      );


    /* 7개씩 표시 */

    items.forEach(
      (item, index) => {

        if(
          index >= start &&
          index < end
        ){

          item.style.display = "grid";

        }else{

          item.style.display = "none";

        }

      }
    );


    /* 숫자 */

    if(status){

      status.textContent =
        `${String(start + 1).padStart(2,"0")}–` +
        `${String(end).padStart(2,"0")} / ` +
        `${String(items.length).padStart(2,"0")}`;

    }


    /* 왼쪽 버튼 */

prev.disabled = false;


    /* 오른쪽 버튼 */

    next.disabled =
      currentPage === totalPages - 1;


    /* 점 */

    if(dotsWrap){

      Array.from(
        dotsWrap.querySelectorAll("button")
      ).forEach(
        (dot, index) => {

          dot.classList.toggle(
            "active",
            index === currentPage
          );

        }
      );

    }

  }


  /* =================================
     왼쪽 버튼
  ================================= */

prev.onclick = function(e){

  e.preventDefault();

  if(currentPage > 0){

    currentPage--;

    showBoard(currentPage);

  }

};


  /* =================================
     오른쪽 버튼
  ================================= */

  next.addEventListener(
    "click",
    () => {

      if(
        currentPage <
        totalPages - 1
      ){

        showBoard(
          currentPage + 1
        );

      }

    }
  );


  /* 처음 실행 */

  createDots();

  showBoard(0);

});

/* =========================================
   메인 마중이 이미지 슬라이드
========================================= */

const mascotSlides = Array.from(
  document.querySelectorAll(".mascot-slide")
);

if (mascotSlides.length > 1) {

  let mascotCurrent = 0;

  setInterval(() => {

    mascotSlides[mascotCurrent].classList.remove("active");

    mascotCurrent++;

    if (mascotCurrent >= mascotSlides.length) {
      mascotCurrent = 0;
    }

    mascotSlides[mascotCurrent].classList.add("active");

  }, 3000);

}