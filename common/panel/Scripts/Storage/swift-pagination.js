/**
 * Performs pagination block for current storage path
 * @param {number} count - total count of object in current container path 
 * @param {number} limit - limit of visible objects
 * @param {function?} updateHandler - function to be performed when clicking on pagination button
 */
let StoragePagination = function (count, limit, updateHandler, page) {
  var pagination = this;

  this.config = {
    paginationParent: document.getElementById('swift-dashboard'),
    navClass: 'swift-pagination',
    ulClass: 'pagination',
    curPage: 1,
    curCount: count,
    pages: 1,
    btnLimit: 6
  };
  this.create = function () {
    let p = this;
    let c = p.config;
    let nav = document.createElement('nav');
    let ul = document.createElement('ul');
    let pagesCount = c.pages;

    nav.classList.add(c.navClass);
    ul.classList.add(c.ulClass);

    ul.appendChild((pagesCount <= c.btnLimit * 2) ? getSimpleUlElements() : getComplexUlElements());
    nav.appendChild(ul);

    return nav;

    function getSimpleUlElements() {
      let elements = document.createDocumentFragment();

      for (let i = 1; i <= pagesCount; i++) {
        elements.appendChild(getExactElement(i));
      }

      return elements;
    }

    function getComplexUlElements() {
      let elements = document.createDocumentFragment();
      let gap = 2; // number of elements to display left and right from active page;


      elements.appendChild(getExactElement(0, 'prev'));

      if (c.curPage < c.btnLimit) {
        for (let i = 1; i <= c.btnLimit; i++) {
          elements.appendChild(getExactElement(i));
        }
        elements.appendChild(getExactElement(c.curPage, 'skip'));
        for (let i = pagesCount - gap; i <= pagesCount; i++) {
          elements.appendChild(getExactElement(i));
        }
      }

      if (c.curPage >= pagesCount - c.btnLimit + gap) {
        for (let i = 1; i <= 1 + gap; i++) {
          elements.appendChild(getExactElement(i));
        }
        elements.appendChild(getExactElement(c.curPage, 'skip'));
        for (let i = pagesCount - c.btnLimit + 1; i <= pagesCount; i++) {
          elements.appendChild(getExactElement(i));
        }
      }

      if (c.curPage >= c.btnLimit && c.curPage < pagesCount - c.btnLimit + gap) {
        for (let i = 1; i <= 1 + gap; i++) {
          elements.appendChild(getExactElement(i));
        }
        elements.appendChild(getExactElement(c.curPage, 'skip'));
        for (let i = c.curPage - gap; i <= c.curPage + gap; i++) {
          elements.appendChild(getExactElement(i));
        }
        elements.appendChild(getExactElement(c.curPage, 'skip'));
        for (let i = pagesCount - gap; i <= pagesCount; i++) {
          elements.appendChild(getExactElement(i));
        }
      }
      
      elements.appendChild(getExactElement(pagesCount, 'next'));

      return elements;
    }

    /**
     * Returns node for pagination button
     * @param {number} page - index of page
     * @param {string?} type - (optional) 'prev', 'next', 'skip'
     */
    function getExactElement(page, type) {
      let elem = document.createElement('li');
      let elemLink = document.createElement('a');
      let info = getLinkInfo();
      let isDisabled = (c.curPage === 1 && type === 'prev') || (c.curPage === pagesCount && type === 'next') || type === 'skip';

      elemLink.innerHTML = info.text;
      elemLink.dataset.page = info.index;
      elemLink.href = '#' + info.index;

      if (page === c.curPage) {
        elem.classList.add('active');
      }
      if (isDisabled) {
        elem.classList.add('disabled');
      }

      elemLink.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (page !== c.curPage && !isDisabled) {
          p.switchToPage(info.index);
        }
      });

      elem.appendChild(elemLink);
      return elem;

      function getLinkInfo() {
        if (typeof type !== 'undefined') {
          switch (type) {
            case 'prev':
              return { index: c.curPage - 1, text: '&laquo;' };
            case 'next':
              return { index: c.curPage + 1, text: '&raquo;' };
            case 'skip':
              return { index: c.curPage, text: '...' };
            default:
              return { index: page, text: page };
          };
        }
        return {
          index: page,
          text: page
        };
      }
    }
  };
  this.remove = function () {
    let c = this.config;
    let dashboard = c.paginationParent;
    let pagination = dashboard.querySelector('.' + c.navClass);

    if (pagination !== null) {
      dashboard.removeChild(pagination);
    }
  };

  this.switchToPage = function (pageIndex) {
    let c = this.config;
    c.curPage = pageIndex;
    updateHandler(pageIndex);

    this.remove();
    c.paginationParent.appendChild(this.create());
  };

  this.refresh = function (newCount, curPage) {
    let p = this;
    let c = p.config;

    p.remove();
    c.curCount = newCount;
    c.pages = Math.ceil(newCount / limit);
    c.curPage = (typeof curPage !== 'undefined' && curPage <= c.pages) ? curPage : 1;

    if (newCount > limit) {
      c.paginationParent.appendChild(p.create());
    }
  };

  this.refresh(count, page);
};
