(function () {
  var myMap;
  if (document.querySelector('#contacts-map') !== null) {
    ymaps.ready(initMap);
  }

  function initMap() {
    myMap = new ymaps.Map('contacts-map', {
      center: [59.94191206418109, 30.348997999999977], // Литейный пр., д. 26, Лит.А
      controls: ['zoomControl'],
      zoom: 17
    });
    myMap.geoObjects.add(new ymaps.Placemark(myMap.getCenter(), {
      balloonContentHeader: '<strong>ООО «ИТ-ГРАД 1 Клауд»</strong>',
      balloonContentBody: 'Адрес: 191028, Санкт-Петербург, Литейный пр., д. 26, Лит.А, БЦ «Преображенский двор», офис 513',
      balloonContentFooter: 'Телефон: 8 (812) 313-88-33, 8 (499) 705-15-30, 8 (800) 777-18-23'
    }, {
        preset: 'islands#blueIcon'
      }));

    myMap.behaviors.disable('scrollZoom');
  }
})();

