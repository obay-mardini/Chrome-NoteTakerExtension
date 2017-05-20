chrome.runtime.onMessage.addListener(function(msg, sender) {
  if (msg === 'toggle') {
    toggle();
  }
});

var iframe = document.createElement('iframe');
iframe.style.height = '100%';
iframe.style.width = '400px';
iframe.style.position = 'fixed';
iframe.style.top = '0px';
iframe.style.right = '-400px';
iframe.style.zIndex = '1000';
iframe.style.transition = 'right .3s ease-in-out';
iframe.style.boxShadow = '-5px 0px 5px -3px #c3c3c3';
iframe.frameBorder = 'none';

document.body.appendChild(iframe);

function toggle() {
  if (iframe.style.right === '-400px') {
    if (iframe.src === '') {
      iframe.src = chrome.extension.getURL('src/browser_action/annotations.html');
    }
    iframe.style.right = '0px';
  }
  else{
    iframe.style.right = '-400px';
  }
}
