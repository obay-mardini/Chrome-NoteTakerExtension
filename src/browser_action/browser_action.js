var user;
var userID;
var allNotes;
var SELECT_VALUE = 'select';
var ALL_VALUE = 'all';
//Load event listener for dropdown
function optionChange (val) {
  $('#dropdown').change(function() {
   var value = $(this).val();
   selectLabel(value);
 });
}

function selectLabel(value) {
  var changes = {
    textToHighlight: [],
    textToUnhighlight: []
  };

  //unHighlight all notes
  $('#dropdown').find('option').each(function(index,element){
    if (element.text) {
      changes.textToUnhighlight.push(element.text);
    }
  });

  //If selecting --all-- in dropdown
  if (value === ALL_VALUE) {
    arrayOfText = [];
    $('#dropdown').find('option').each(function(index,element){
      if (element.text) {
        changes.textToHighlight.push(element.text);
      }
    });
  } //If selecting anything, but --select--
  else if (value !== SELECT_VALUE) {
    var $currentOption = $('#dropdown option[value=' + value + ']');
    var text = $currentOption.text();
    changes.textToHighlight.push(text);
  }

  //Send object of text to highlight
  commitChanges(changes);

  //Set currentTextIndex back to 0
  chrome.storage.local.set({
    currentTextIndex: 0
  });
}
//Set a change object on chrome local storage
function commitChanges (changes) {
  chrome.storage.local.set({
    changes: changes
  }, function() {
    chrome.tabs.executeScript({
        file: "highlight.js"
    });
  })
}

//Load event listener for Scroll Button
function scroll() {
  $('#next').on('click', function(){
    chrome.tabs.executeScript({
        file: "scroll.js"
    });
  });
}

//Make call to server to get User
function getUsers () {
  return $.ajax({
    url: 'http://localhost:3003/api/users/' + userID,
    type: 'GET',
    success: (data) => {
      allNotes = data;
      renderOption(data);
    },
    error: (data) => {
      console.log('Did not receive:' + data);
    }
  });
};

//Load event listener for "Noted" button
function button() {
  $("#button").on("click",highlightSelectedText);
}

//Checks if user is login for Auth0
function isLoggedIn(token) {
  // The user is logged in if their token isn't expired
  return jwt_decode(token).exp > Date.now() / 1000;
}

//Log out user by clearing the local storage
function logout() {
  // Remove the idToken from storage
  localStorage.clear();
  main();
}

//Render drop downlist
function renderOption(data) {
  var $dropdown = $('#dropdown');
  $dropdown.find('option').remove().end();

  return chrome.tabs.getSelected(null, (tab) => {
    $dropdown.append($("<option/>", {
      label: "--Select--",
      value: SELECT_VALUE
    }));

    $dropdown.append($("<option/>", {
      label: "--All--",
      value: ALL_VALUE
    }));

    if(data.length !== 0) {
      data[0].urls.forEach(function(url) {
        if(url.name === tab.url) {
          url.pins.forEach(function(note, index) {
            $dropdown.append($("<option/>", {
              label: `Pin ${index + 1}: ${note.slice(0, 15)}...`,
              value: index,
              text: note
            }));
          });
        }
      });
    }
  })
}

//Render the Main App
function renderProfileView(authResult) {
  $('.mainPopup').removeClass('hidden');
  $('.default').addClass('hidden');
  $('.loading').removeClass('hidden');
  
  return fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${authResult.access_token}`
    }
  }).then(resp => {
    return resp.json();
  }).then((profile) => {
    user = profile.email;
    userID = profile.user_id;
    getUsers().then(() => {
      selectLabel(ALL_VALUE);
    });
    try {
      $('.loading').addClass('hidden');
      $('.note').removeClass('hidden');
      $('.logout-button').get(0).addEventListener('click', logout);
    } catch(e) {
      console.log(e);
    }
    return;
  }).catch(e => {
    alert('ERROR',e)
  })
}

//Render the login page
function renderDefaultView() {
  $('.default').removeClass('hidden');
  $('.note').addClass('hidden');
  $('.loading').addClass('hidden');

  $('.login-button').get(0).addEventListener('click', () => {
  $('.default').addClass('hidden');
  $('.loading').removeClass('hidden');

  chrome.runtime.sendMessage({
      type: "authenticate"
    });
  });
}

//Check if user logged in
function main () {
  const authResult = JSON.parse(localStorage.authResult || '{}');
  const token = authResult.id_token;

  if (token && isLoggedIn(token)) {
    renderProfileView(authResult);
  } else {
    renderDefaultView();
  }
}

function highlightSelectedText(info, tab) {
  var authResult = JSON.parse(localStorage.authResult || '{}')
  var currentUri;
  renderProfileView(authResult).then(() => {
  //Get current tab url
  chrome.tabs.getSelected(null, (tab) => {
    currentUri = tab.url;
  });

  //Get selected highlight color
  var highlightColor = $("input[name=color]:checked").val();
  
  //Get hightlighted text from browser
  chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
  }, (selection) => {

    var text = selection[0];
    var note = {user_id: userID, uri: currentUri, note: text};
    
    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      url: 'http://localhost:3003/api/users/notes',
      data: JSON.stringify(note),
      success: (data) => {
        console.log('SUCCESS!');
      },
      error: (data) => {
        console.log('Did not receive:' + data);
      }
    });
  });
  });
}
//Injects Jquery, Jquery.highlight, and CSS into current tab
document.addEventListener("DOMContentLoaded", () => {
  var result = chrome.tabs.executeScript(null, {file: "jquery-3.2.1.min.js"});
  var result2 = chrome.tabs.executeScript(null, {file: "jquery.highlight.js"});
  chrome.tabs.insertCSS(null, {file:"noteTakerHighlight.css"});
  //Run event listeners
  Promise.all([result, result2]).then(() => {
    main();
    button();
    optionChange();
    scroll();
  });
});

chrome.contextMenus.onClicked.addListener(highlightSelectedText)

chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  chrome.contextMenus.create({
      "id": "11112",
      "title": "Note",
      "contexts": [context]
   }, function() {
    alert(chrome.extension.lastError.message)
     });
});
