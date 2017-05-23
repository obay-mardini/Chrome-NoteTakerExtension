var app = {
  server: env.SERVER,
  userID: null,
  notes: [],
  tabURL: null,
  _lastNoteClicked: null,
  _oldNotes: '',
};

app.init = function() {
  app.$notes = $('#notes');
  app.$closeMenuBtn = $('.toggle-menu');
  app.$annotationModal = $('#annotation-modal');
  app.$annotationModalNoteText = $('#note-text');
  app.$annotationModalAnntText = $('#annotation-text');
  app.$saveAnnotationBtn = $('#save-annotation-btn');

  // Add tooltips to dynamically generated notes
  $('body').tooltip({
    selector: '[data-toggle="tooltip"]'
  });

  app.$notes.on('click', '.panel-title', app.handleNoteClick);
  app.$closeMenuBtn.on('click', app.handleCloseMenu);
  app.$annotationModal.on('show.bs.modal', app.handleAnnotationModal);
  app.$annotationModal.on('shown.bs.modal', function() {
    app.$annotationModalAnntText.focus();
  });
  app.$saveAnnotationBtn.on('click', app.handleSaveAnnotation);
  app.$notes.on('click', '.delete-annotation', app.handleDeleteAnnotation);

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
  fetch(`${app.server}/api/users/${app.userID}`)
    .then(res => res.json())
    .then(allNotes => {
      var urls = allNotes[0].urls;
      // Find the notes for the current url
      for (var i = 0; i < urls.length; i++) {
        if (urls[i].name === app.tabURL) {
          // Store a copy of old notes to check for note changes
          app._oldNotes = JSON.stringify(app.notes);
          app.notes = urls[i].pins;
          return;
        }
      }
    })
    .then(() => callback(app.notes));
};

app.clearNotes = function() {
  app.$notes.html('');
};

app.renderNotes = function(notes) {
  if (notes.length !== 0) {
    app.clearNotes();
    notes.forEach(app.renderNote);
  }
};

app.renderNewNotes = function(notes) {
  if (app._oldNotes !== JSON.stringify(app.notes)) {
    app.clearNotes();
    notes.forEach(app.renderNote);
  }
};

app.renderNote = function(note) {
  var Note = function(noteText, annotation, color) {
    if (!color) {
      color = 'yellow';
    }

    if (noteText.length > 30) {
      var partialNoteText = `${noteText.slice(0, 30)}...`;
    }

    var addAnnotationBtn = '<button class="add-annotation btn btn-default btn-xs" data-toggle="modal" data-target="#annotation-modal" data-action="add">Add</button>';

    var annotationBody = `<p>${annotation}</p>`;
    annotationBody += '<button class="delete-annotation pull-right btn btn-danger btn-xs" data-loading-text="Deleting...">Delete</button>';
    annotationBody += '<button class="edit-annotation pull-right btn btn-primary btn-xs" data-toggle="modal" data-target="#annotation-modal" data-action="edit">Edit</button>';

    // <div style="display: inline-block; width: 15px; height: 15px; background-color: ${color}"></div>
    return (
      `<div class="panel panel-default note">
        <div class="panel-heading">
          <span class="pull-right">
            <input type="text" class="colorPicker">
          </span>
          <h3 class="panel-title" data-text=${JSON.stringify(noteText)} data-color=${JSON.stringify(color)} data-toggle="tooltip" data-placement="top" title=${JSON.stringify(noteText)}>${partialNoteText || noteText}</h3>
        </div>
        <div class="panel-body">
          ${annotation ? annotationBody : addAnnotationBtn}
        </div>
      </div>`
    );
  };

  var $note = $(Note(note.text, note.annotation, note.color));
  app.$notes.append($note);
  // Color change function
  var changeColor = function(tinycolor) {
    var data = {
      user_id: app.userID,
      uri: app.tabURL,
      note: note.text,
      color: tinycolor.toName()
    }

    fetch(`${app.server}/api/users/notes/color`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(() => app.fetchUserNotes(app.renderNotes))
      .then(() => {
        var changes = {
          textToHighlight: [],
          textToUnhighlight: []
        };
        changes.textToHighlight.push({note: data.note, color: data.color});
        // Unhighlight all texts
        $('.note .panel-title').each(function(index, title) {
          var note = $(title).data('text');
          var color = $(title).data('color');
          changes.textToUnhighlight.push({note: note, color: color});
        });

        chrome.storage.local.set({changes: changes}, function() {
          chrome.tabs.executeScript({file: "highlight.js"});
        });
      });
  };
  // Color palette settings
  $note.find('.colorPicker').spectrum({
    showPaletteOnly: true,
    showPalette: true,
    color: note.color,
    palette: [
      ['yellow', 'green', 'red', 'blue']
    ],
    change: changeColor
  });
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

app.handleAnnotationModal = function(event) {
  var $btn = $(event.relatedTarget);
  // Traverse the DOM to get the note text associated with the button clicked
  var noteText = $btn.parents().eq(1).find('.panel-title').data('text');
  var modal = $(this);

  if ($btn.data('action') === 'edit') {
    var annotationText = $btn.parent().find('p').text();
    app.$annotationModalAnntText.val(annotationText);
    modal.find('.modal-title').text('Edit annotation');
  } else {
    modal.find('.modal-title').text('Add annotation');
    // Clear the text area
    app.$annotationModalAnntText.val('');
  }
  // Add the note text inside modal
  app.$annotationModalNoteText.text(noteText);
};

app.handleSaveAnnotation = function() {
  var data = {
    user_id: app.userID,
    uri: app.tabURL,
    note: app.$annotationModalNoteText.text(),
    annotation: app.$annotationModalAnntText.val()
  };

  if (data.annotation.trim().length === 0) {
    return;
  }

  // Change button to show "Saving..."
  var $btn = $(this).button('loading');

  fetch(`${app.server}/api/users/notes/annotations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(() => app.fetchUserNotes(app.renderNotes))
    .then(() => $btn.button('reset'))
    .then(() => app.$annotationModal.modal('hide'));
};

app.handleDeleteAnnotation = function() {
  var $btn = $(this);
  // Traverse the DOM to get the note text associated with the button clicked
  var noteText = $btn.parents().eq(1).find('.panel-title').data('text');
  var data = {
    user_id: app.userID,
    uri: app.tabURL,
    note: noteText
  };

  // Change button to show "Deleting..."
  $btn.button('loading');

  fetch(`${app.server}/api/users/notes/annotations`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(() => app.fetchUserNotes(app.renderNotes))
    .then(() => $btn.button('reset'));
};

$(document).ready(function() {
  app.init();
});
