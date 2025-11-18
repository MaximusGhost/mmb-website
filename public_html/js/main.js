$( document ).ready(function() {
    /*FULL PAGE CONTENT*/
    const pageName = $('body').attr('id');
    const pages = [
        {
            name:'aboutme',
            sections:['Welcome', 'Computer Science', 'Mathematics', 'Piano', 'Martial Arts', 'Theater', 'Volunteer Work']
        },
        {
            name:'schools',
            sections:['schools','high school','middle school','elementary school']
        },
        {
            name:'math',
            sections:['mathematics','early age','camps','competitions','courses and programs', 'berkeley']
        },
        {
            name:'science',
            sections:['physics','early age','camps','high school','extracurricular', 'berkeley']
        },
        {
            name:'music',
            sections:['music','early age','videos','competitions']
        },
        {
            name:'theatre',
            sections:['theatre','riverdale rising stars','gallery', 'other experience']
        },
        {
            name:'cs',
            sections:['cs','general interest','game gallery','cs at school','outside school','additional projects', 'latex']
        },
        {
            name:'camps',
            sections:['camps','science camps','math camps','miscellaneous']
        },
        {
            name:'sports',
            sections:['karate','starting out','getting to black belt','demonstrations']
        },
        {
            name:'fundraising',
            sections:['fundraising','why fundraising?','stuy physics team','nyc physics team','riverdale rising stars','stuyzon/rrszon','mask initiative']
        }
    ];
    const page = pages.find(page => page.name === pageName);
    const navigationTooltips = page ? page.sections : [];

    $('#fullpage').fullpage({
		licenseKey:'900926BB-41E94FFC-80595BF7-1ACB11E3',
		touchSensitivity:true,
		keyboardScrolling:true,
		navigation:true,
		navigationTooltips: navigationTooltips,
	    showActiveTooltip: true,
	    slidesNavigation: true,
	});
    
    /*NAVIGATION*/
    let mybodyid = $('body').attr('id');
    let mynavid = '#nav' + mybodyid;
    $(mynavid).attr('id','active');

    /*DYNAMIC IFRAMES*/
    let ww = $(window).width();
    let iframeWidthSokoban = ww < 725 ? 300 : 375;
    let iframeWidth15 = ww < 725 ? 270 : 437;
    let iframeHeightSokoban = ww < 725 ? 300 : 375;
    let iframeHeight15 = ww < 725 ? 200 : 350;
    
    $('#game15').css('width', iframeWidth15+'px');
    $('#game15').css('height', iframeHeight15+'px');
    $('#sokoban').css('width', iframeWidthSokoban+'px');
    $('#sokoban').css('height', iframeHeightSokoban+'px');
    
    /*TRANSITION CODE -- ADD CLASSES*/
    $('.header, .footer').addClass('visible');
    $('.nav-list li:nth-child(even)').addClass('visible-even');
    $('.nav-list li:nth-child(odd)').addClass('visible-odd');
    $('.section, .subsection, .banner').addClass('show-on-scroll');
    $('h1, h2, h3, h4').addClass('show-on-scroll');
    
    /*DARK MODE SESSION INFO*/
    let isDarkView = localStorage.getItem('dark-view');
    let className = isDarkView ? 'dark-view' : '';
    $('body, html, .dark-mode').addClass(className);
    
    /*DARK MODE*/
    $('.dark-mode').on('click', function() {
        if(isDarkView) {
            isDarkView = false;
            localStorage.removeItem('dark-view');
            $(this).removeClass('dark-view');
            $('html').removeClass('dark-view');
            $('body').removeClass('dark-view');
        } else {
            isDarkView = true;
            localStorage.setItem('dark-view', true);
            $(this).addClass('dark-view');
            $('html').addClass('dark-view');
            $('body').addClass('dark-view');
        }
    });
    
    /*RESPONSIVE NAVBAR CODE*/
    $('.navbar').on('click', function(event) {
        event.preventDefault();
        let x = document.getElementById('nav');
        if (x.className === 'navigation') {
            x.className += ' responsive';
        } else {
            x.className = 'navigation';
        }
        $('.burger').toggleClass('active');
    })
    
    /*GALLERY CODE*/
    $('.gallery').slick({
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 5,
        slidesToScroll: 3,
        variableWidth: true,
        responsive: [
        {
            breakpoint: 1440,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 3,
                infinite: false,
                dots: true
            }
        },
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: false,
                dots: true
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
        ]
    });

    /*SHOWING ON SCROLL*/
    let scroll = window.requestAnimationFrame ||
        function(callback){ window.setTimeout(callback, 1000/60)};
    let elementsToShow = document.querySelectorAll('.show-on-scroll'); 
    
    function loop() {
        Array.prototype.forEach.call(elementsToShow, function(element){
          if (isElementInViewport(element)) {
            element.classList.add('is-visible');
          } else {
            element.classList.remove('is-visible');
          }
        });
        
        scroll(loop);
    }
    
    loop();
    
    /*GALLERY MAGNIFYING POPUPS*/
    $('.gallery').magnificPopup({
        delegate: '.gallery-item',
        type: 'image',
        gallery:{enabled:true},
        zoom: {
            enabled: true,
            duration: 300
        },
        titleSrc: 'title',
    });
    
    $('.single-image').magnificPopup({
      delegate: 'a',
      type: 'image',
      zoom: {
		enabled: true,
		duration: 300
	}
    });
    
    
    /*CHECK IF ELEMENT IN VIEWPORT*/
    function isElementInViewport(el) {
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }
        let rect = el.getBoundingClientRect();
        return (
        (rect.top <= 0
          && rect.bottom >= 0)
        ||
        (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.top <= (window.innerHeight || document.documentElement.clientHeight))
        ||
        (rect.top >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
        );
    }
    
    $('.btn')
    .on('mouseenter', function(e) {
			let parentOffset = $(this).offset(),
      		relX = e.pageX - parentOffset.left,
      		relY = e.pageY - parentOffset.top;
			$(this).find('span').css({top:relY, left:relX})
    })
    .on('mouseout', function(e) {
			let parentOffset = $(this).offset(),
      		relX = e.pageX - parentOffset.left,
      		relY = e.pageY - parentOffset.top;
    	$(this).find('span').css({top:relY, left:relX})
    });
});
