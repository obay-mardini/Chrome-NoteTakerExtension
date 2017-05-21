var app = {
  userID: null,
  allNotes: [],
  tabURL: null,
  _lastNoteClicked: null,
};

app.init = function() {
  app.$notes = $('#notes');
  app.$closeMenuBtn = $('.toggle-menu');

  app.$notes.on('click', '.panel-title', app.handleNoteClick);
  app.$closeMenuBtn.on('click', app.handleCloseMenu);

  app.setUserInfo();
  app.getTabURL(function() {
    app.fetchUserNotes(app.renderNotes);

    setInterval(function() {
      app.fetchUserNotes(app.renderNewNotes);
    }, 1500);
  });
};

app.setUserInfo = function() {
  var idToken = JSON.parse(localStorage.getItem('authResult')).id_token;
  var decoded = jwt_decode(idToken);
  app.userID = decoded.sub;
};

app.getTabURL = function(callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    var tab = tabs[0];
    app.tabURL = tab.url;
    callback();
  });
};

app.fetchUserNotes = function(callback) {
  fetch(`http://localhost:3003/api/users/${app.userID}`)
    .then(res => res.json())
    .then(allNotes => app.allNotes = allNotes[0])
    .then(() => callback(app.allNotes.urls));
};

app.clearNotes = function() {
  app.$notes.html('');
};

app.renderNotes = function(urls) {
  if (urls.length !== 0) {
    app.clearNotes();

    urls.forEach(function(url) {
      if(url.name === app.tabURL) {
        url.pins.forEach(app.renderNote);
      }
    });
  }
};

app.renderNewNotes = function(urls) {
  urls.forEach(function(url, i) {
    if (url.name === app.tabURL) {
      if (url.pins.length > $('.note').length) {
        var newPins = url.pins.slice($('.note').length);
        newPins.forEach(app.renderNote);
      }
    }
  });
};

app.renderNote = function(note) {
  var Note = function(noteText, annotation, color) {
    if (!annotation) {
      annotation = 'No annotation found';
    }
    if (!color) {
      color = 'yellow';
    }

    if (noteText.length > 35) {
      var partialNoteText = `${noteText.slice(0, 35)}...`;
    }

    return (
      `<div class="panel panel-default note">
        <div class="panel-heading">
          <span class="pull-right">
            <div style="display: inline-block; width: 15px; height: 15px; background-color: ${color}"></div>
          </span>
          <h3 class="panel-title" data-text=${JSON.stringify(noteText)} data-color=${JSON.stringify(color)}>${partialNoteText || noteText}</h3>
        </div>
        <div class="panel-body">
          ${annotation}
        </div>
      </div>`
    );
  };

  app.$notes.append($.parseHTML(Note(note.text, note.annotation, note.color)));
};

app.handleNoteClick = function(event) {
  var changes = {
    textToHighlight: [],
    textToUnhighlight: []
  };

  // Text to highlight
  var note = $(event.target).data('text');
  var color = $(event.target).data('color');
  changes.textToHighlight.push({note: note, color: color});

  // Unhighlight all texts
  $('.note .panel-title').each(function(index, title) {
    var note = $(title).data('text');
    var color = $(title).data('color');
    changes.textToUnhighlight.push({note: note, color: color});
  });

  // Set the changes to storage so that highlight.js will know what to highlight/unhighlight.
  chrome.storage.local.set({changes: changes}, function() {
    // currentTextIndex is used to find the highlighted DOM element to scroll to.
    // Set to 0 because currentTextIndex gets incremented in file scroll.js. We
    // want user to be able to repeatedly click on note to scroll to it.
    if (note !== app._lastNoteClicked) {
      var currentTextIndex = {currentTextIndex: 0};
      app._lastNoteClicked = note;
    } else {
      var currentTextIndex = {};
    }
    chrome.storage.local.set(currentTextIndex, function() {
      // Highlight the text using the information found in chrome.storage.local
      chrome.tabs.executeScript({file: "highlight.js"}, function() {
        // Scroll to highlighted text. Only scrolls to the first instance of the highlight.
        chrome.tabs.executeScript({file: "scroll.js"});
      });
    });
  });
};

app.handleCloseMenu = function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "toggle");
  });
};

$(document).ready(function() {
  app.init();
});
