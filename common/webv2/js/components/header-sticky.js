$(function() {
    var maincontainer = document.getElementById('maincontainer'),
        headerClass = 'main-header',
        headerStickyClass = headerClass + '--sticky',

        header = document.querySelector('.' + headerClass),
        headerTop = header.querySelector('.header__top'),
        headerBottom = header.querySelector('.header__bottom'),

        headerHeight,
        headerTopHeight,
        headerBottomHeight,
        currentWindowOffset,
        mobileMenuTrigger = document.getElementById('menu-mobile__btn');

    var brPts = window.breakpoints;
    
    function initStickyHeader() {
        headerTopHeight = headerTop.clientHeight;
        headerBottomHeight = (headerBottom !== null) ? headerBottom.clientHeight : 0;
        headerHeight = headerTopHeight + headerBottomHeight;
        currentWindowOffset = window.pageYOffset;
        mobileMenuTrigger.removeAttribute('style');

        if (window.innerWidth >= brPts.sm) {
            setHeaderSticky();
        } else {
            removeHeaderSticky();
        }
    }

    function setHeaderSticky() {
        header.classList.add(headerStickyClass);
        maincontainer.style.paddingTop = headerHeight + 'px';
        window.addEventListener('scroll', checkOffset);
    }
    function removeHeaderSticky() {
        header.classList.remove(headerStickyClass);
        maincontainer.style.paddingTop = 0;
        window.removeEventListener('scroll', checkOffset);
    }

    function checkOffset() {
        var topOffset = window.pageYOffset;
        
        if (topOffset > currentWindowOffset) {
            if (headerBottom !== null) {
                headerTop.style.marginTop = -headerTopHeight + 'px';
                mobileMenuTrigger.style.top = '14px';
            } else {
                headerTop.classList.add('header__top--small');
            }
        } else {
            if (window.innerWidth >= brPts.md || topOffset <= headerHeight) {
                if (headerBottom !== null) {
                    headerTop.style.marginTop = 0;
                    mobileMenuTrigger.removeAttribute('style');
                } else {
                    headerTop.classList.remove('header__top--small');
                }
            }
        }
        currentWindowOffset = topOffset;
    }

    initStickyHeader();
    window.addEventListener('resize', function () {
        setTimeout(initStickyHeader, 200);
    });
});