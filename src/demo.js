(function () {
  gumshoe.init({
    selector: '.toc a',
    offset: 0,
    activeClass: 'active',
    callback: function (nav) { // copy from https://swift.org
      if (nav) {
        var title = document.title + " - " + nav.target.textContent
        var hash = "#" + nav.target.id;
        if (window.location.hash !== hash) {
          history.replaceState(null, title, window.location.pathname + hash);
        }
      }
    }
  });
})()