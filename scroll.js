chrome.storage.local.get('currentTextIndex', function(results) {
  var element = $('span[class^="highlight"]');
  results = results.currentTextIndex ? results.currentTextIndex : 0;

  if (element.length !== 0) {
    $('body').animate({
      scrollTop: element.eq(results).offset().top
    }, 500);
  }

  if (results === element.length - 1) {
    chrome.storage.local.set({
      currentTextIndex: 0
    });
  } else if (element.length > 1) {
    chrome.storage.local.set({
      currentTextIndex: results + 1
    });
  }
});
