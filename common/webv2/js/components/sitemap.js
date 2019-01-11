(function initSitemap() {
    var sitemap = document.querySelector('.sitemap');
        sitemapElems = sitemap.querySelectorAll('li'),
        sitemapControlClass = 'sitemap__trigger',
        sitemapControlActiveClass = 'sitemap__trigger--active',
        sitemapControl = $('<span/>', {
            'class': sitemapControlClass
        });

    [].forEach.call(sitemapElems, function (el) {
        if (el.querySelector('ul') !== null) {
            el.classList.add('dropdown');
            prependSitemapControl(el)
        }
    });

    function prependSitemapControl(elem) {
        var control = document.createElement('span'),
            link = elem.querySelector('a');

        control.classList.add(sitemapControlClass, sitemapControlActiveClass);
        control.addEventListener('click', toggleLevelVisibility);
        elem.insertBefore(control, link);
    }

    function toggleLevelVisibility(e) {
        var control = e.target;
        e.preventDefault();
        control.classList.toggle(sitemapControlActiveClass);
        control.parentNode.querySelector('ul').classList.toggle('hidden');
    }
})();