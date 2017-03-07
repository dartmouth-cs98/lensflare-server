var startText = "";
var currCellRow = -1;
var currCellCol = -1;
var active = false;
var renderer;
var scenes = [];
var canvas;
var readyForAnimation = false;

//init user doc
var userDoc = {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email")
};

//checks if there is auth token - if not, go to login page
if (!localStorage.getItem("token")) {
    window.location.href = "/";
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        PAGE LOADING
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function displayWelcome(user) {
    //parse the userdoc
    userDoc = JSON.parse(user).local;
    displaySpaces();
    // document.getElementById("db-name").innerHTML = "Welcome to Lensflare, " + userDoc.name + "!";
}

function displaySpaces(addingBlock) {
    document.getElementById("db-name").innerHTML = "Spaces";
    document.getElementById("db-table").innerHTML = "";
    if (userDoc.spaces.length == 0) {
      document.getElementById("db-table").style.border = "none";
      document.getElementById("db-table").innerHTML = "<div style='text-align: center'>You haven't set up a space yet - click on the plus sign below or visit the <a href='/help'>help page</a> to get started!";
      document.getElementById("db-table").innerHTML += "<div id='new-space-block' class='space-blocks'><img onclick='addSpace()' width='100%' style='padding-bottom: 21px' src='assets/addholder.png'></div></div>"
    }

    else {
        document.getElementById("db-table").style.border = "none";
        for (var space in userDoc.spaces) {
          if (typeof(userDoc.spaces[space].items[0]) != 'undefined') {
            document.getElementById("db-table").innerHTML += "<div class='space-blocks'><img onclick='loadDatabaseInfo(\"" + userDoc.spaces[space].name + "\"," + space + ")' width='100%' src='" + userDoc.spaces[space].items[0].url + "'><br /><a onclick='loadDatabaseInfo(\"" + userDoc.spaces[space].name + "\"," + space + ")' class='space-link'>" + userDoc.spaces[space].name + "</a><button class='delete-space-button' onclick='clearSpace(\"" + userDoc.spaces[space].name + "\")'><img src='assets/close.png'></button></div>"
          }
          else {
            document.getElementById("db-table").innerHTML += "<div class='space-blocks'><img onclick='loadDatabaseInfo(\"" + userDoc.spaces[space].name + "\"," + space + ")' width='100%' src='assets/pano.png'><br /><a onclick='loadDatabaseInfo(\"" + userDoc.spaces[space].name + "\"," + space + ")' class='space-link'>" + userDoc.spaces[space].name + "</a><button class='delete-space-button' onclick='clearSpace(\"" + userDoc.spaces[space].name + "\")'><img src='assets/close.png'></button></div>"
          }
        }
        document.getElementById("db-table").innerHTML += "<div id='new-space-block' class='space-blocks'><img onclick='addSpace()' width='100%' style='padding-bottom: 21px' src='assets/addholder.png'></div>"
    }
}

//displays the userdoc
function displayData(user) {

    //if the URL has space in it already, load that space (or manage devuces)
    if (window.location.href.includes("/database?=")) {
      var spaceName = window.location.href.split("/database?=")[1].replace("%20", " ")
      if (spaceName == "manageDevices") {
        manageDevicesLoad()
        return;
      }
      for (var space in userDoc.spaces) {
        if (userDoc.spaces[space].name == spaceName) {
          var start = {};
          start.text = userDoc.spaces[space].name
          loadDatabaseInfo(start, space)
          return;
        }
      }

      //if not found, load default space
      window.location.href = window.location.href.split("/database?=")[0] + "/database?=" + userDoc.spaces[0].name;

    }

    //otherwise load default space
    else {
      var start = {};
      start.text = userDoc.spaces[0].name;
      document.getElementById("db-name").innerHTML = userDoc.spaces[0].name;
      loadDatabaseInfo(start, 0);
    }
}

//set up URL for loading database
function loadDatabase(space, spaceRow) {
    if (!window.location.href.includes("database?=")) window.location.href += "?=" + space.text;
    else if (!(window.location.href.split("?")[1] == ("=" + space.text))){
      window.location.href = window.location.href.split("/database?=")[0] + "/database?=" + space.text;
    }
}

//actual database loading done here
function loadDatabaseInfo(space, spaceRow) {

    //make mesh reappear
    canvas = document.getElementById("c");
    canvas.style.display = 'block';

    //set db name and clear table
    document.getElementById("db-name").innerHTML = space;
    document.getElementById("db-table").innerHTML = "";

    //if no items present, tell user what to do
    if (userDoc.spaces[spaceRow].items.length == 0) {
        document.getElementById("db-table").style.border = "none";
        document.getElementById("db-table").innerHTML = "There appears to be no photos taken - visit the <a href='/help'>help page</a> to get started!";
        scenes = [];
        return;
    }

    //set up table with styling
    var table = document.getElementById("db-table");

    for (var row = 0; row < userDoc.spaces[spaceRow].items.length; row++) {

      if (userDoc.spaces[spaceRow].items[row].media == null || typeof(userDoc.spaces[spaceRow].items[row].media.media_url) == 'undefined' || userDoc.spaces[spaceRow].items[row].media.selected == false) {

        var uploadButton = "<div style='font-size: 14px'>(accepts .ogv, .png, .jpg, .txt)</div><label class='upload-button'><input accept='image/png, " +
        "image/jpeg, video/ogg, text/plain' onchange='uploadMedia(" + spaceRow + "," + row + ")' style='border: none' class='upload-button' id='upload-" +
        spaceRow + "-" + row + "' type='file'>switch to media<br /></label>"

        if (userDoc.spaces[spaceRow].items[row].media != null && typeof(userDoc.spaces[spaceRow].items[row].media.media_url) != 'undefined') {
          uploadButton = "<div style='font-size: 14px'>(accepts .ogv, .png, .jpg)</div><button class='upload-button' onclick='setMediaSelected(" + spaceRow + ", " + row + ", true)'>switch to media<br /></label>"
        }

        table.innerHTML += "<div class='item-blocks'><div style='width: 533px; height: 300px; float: left' id='space-" + spaceRow + "-item-" + row + "-image'></div>" +
                          "<div style='width: 200px; height: 300px; padding-left: 25px; display: inline-block; position: relative'>" +
                            "<div class='title-text-label'>Title</div>" +
                            "<div id='space-" + spaceRow + "-item-" + row + "-titleActions'>" +
                              "<button class='edit-button' type='button' onclick='editTitle(" + spaceRow + "," + row + ")'>edit</button>" +
                            "</div>" +
                            "<br /><div style='height: 30px;' id='space-" + spaceRow + "-item-" + row + "-title'>" + userDoc.spaces[spaceRow].items[row].title + "</div>" +
                          "<br /><div class='title-text-label'>Text</div>" +
                          "<div style='float: right' id='space-" + spaceRow + "-item-" + row + "-textActions'>" +
                            "<button class='edit-button' type='button' onclick='editText(" + spaceRow + "," + row + ")'>edit</button>" +
                          "</div>" +
                          "<br /><div style='overflow-y: auto; height: 155px' id='space-" + spaceRow + "-item-" + row + "-text'>"
                            + userDoc.spaces[spaceRow].items[row].text +
                          "</div><br /><br /><div style='position: absolute; bottom: 0'>" + uploadButton + "</div>" +
                          "</div></div>"
        }
        else {
          var split = userDoc.spaces[spaceRow].items[row].media.media_url.split('/');
          var url = split[split.length - 1]

          if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png")) {
            mediaUrl = "<img width='100%' src=\"" + userDoc.spaces[spaceRow].items[row].media.media_url + "\">"
          }
          else if (url.includes(".txt")) {
            mediaUrl = "<img height='100px' src='assets/mesh.png'>"
          }
          else {
            mediaUrl = "<img height='100px' src='assets/video.png'>"
          }

          var uploadButton = "<div style='font-size: 14px'>(accepts .ogv, .png, .jpg, .txt)</div><label class='upload-button'><input accept='image/png, " +
          "image/jpeg, video/ogg, text/plain' onchange='uploadMedia(" + spaceRow + "," + row + ")' style='border: none' class='upload-button' id='upload-" +
          spaceRow + "-" + row + "' type='file'>change media<br /></label>"

          table.innerHTML += "<div class='item-blocks'><div style='display: inline-block; width: 533px; height: 300px; float: left' id='space-" + spaceRow + "-item-" + row + "-image'></div>" +
          "<div style='width: 200px; height: 300px; padding-left: 25px; display: inline-block; position: relative'>" +
            "<div class='title-text-label'>Media</div>" +
            "<div id='space-" + spaceRow + "-item-" + row + "-titleActions'>" +
            "</div>" +
            "<br /><div style='height: 30px;' id='space-" + spaceRow + "-item-" + row + "-title'>" + mediaUrl + "</div>" +
          "<br /><div class='title-text-label'></div>" +
          "<div style='float: right' id='space-" + spaceRow + "-item-" + row + "-textActions'>" +
          "</div>" +
          "<br /><div style='overflow-y: auto; height: 155px' id='space-" + spaceRow + "-item-" + row + "-text'>" +
          "</div><br /><br /><div style='position: absolute; bottom: 0'>" + uploadButton + "<br /><button class='upload-button' type='button' onclick='setMediaSelected(" + spaceRow + "," + row + ", false)'>switch to text</button></div>" +
          "</div></div>"
        }

      var image = document.getElementById("space-" + spaceRow + "-item-" + row + "-image");
      image.style.backgroundImage = "url('" + userDoc.spaces[spaceRow].items[row].url + "')";
      image.style.backgroundSize = "cover";
      image.style.backgroundPosition = "center";

    }

}


function manageDevices() {
  if (!window.location.href.includes("database?=")) window.location.href += "?=manageDevices";
  else if (!(window.location.href.split("?")[1] == "=manageDevices")){
    window.location.href = window.location.href.split("/database?=")[0] + "/database?=manageDevices";
  }
}

function manageDevicesLoad() {
      document.getElementById("db-name").innerHTML = "My Devices"
      document.getElementById("db-table").style.border = "none";
      loadDevices()
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        SPACE MANAGEMENT
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function addSpace() {
    document.getElementById("new-space-block").innerHTML = "<img onclick='addSpace()' width='100%' src='assets/addholder.png'><input class='db-name-entry' id='db-name-entry' type='text' value=''><button class='delete-space-button' onclick='displaySpaces()'><img src='assets/close.png'></button><button class='delete-space-button' onclick='saveNewSpace()'><img src='assets/check.png'></button></div>"
    document.getElementById("db-name-entry").focus();
}


function saveNewSpace() {
    var dbName = document.getElementById("db-name-entry").value;

    if (dbName == "") {
      loadMessage(false, "please enter a name and try again")
      return;
    }

    if (dbName.includes("?=")) {
      loadMessage(false, "space name cannot contain \"?=\"")
      return;
    }

    if (dbName.includes("manageDevices")) {
      loadMessage(false, "space name cannot be \"manageDevices\"")
      return;
    }
    userDoc.spaces.push({
        name: dbName,
        items: [],
        anchors: ""
    })
    document.getElementById("new-space-block").innerHTML = "";
    saveSpaces(userDoc);
    displaySpaces();
}

function editTitle(spaceRow, row) {
  var item = document.getElementById("space-" + spaceRow + "-item-" + row + "-title");
  var actions = document.getElementById("space-" + spaceRow + "-item-" + row + "-titleActions");
  actions.innerHTML = "<button class='edit-button' type='button' onclick='saveTitle(" + spaceRow + "," + row + ")'>done</button> <button class='edit-button' type='button' onclick='cancelTitle(" + spaceRow + "," + row + ")'>cancel</button>";
  item.innerHTML = "<input type='text' class='input-text' name='input-box' rows='3' id='space-" + spaceRow + "-item-" + row + "-input-title' value=''>" + startText + "</input>";
}

function saveTitle(spaceRow, row) {
  var item = document.getElementById("space-" + spaceRow + "-item-" + row + "-title");
  var actions = document.getElementById("space-" + spaceRow + "-item-" + row + "-titleActions");
  var inputBox = document.getElementById("space-" + spaceRow + "-item-" + row + "-input-title")
  userDoc.spaces[spaceRow].items[row].title = inputBox.value;
  item.innerHTML = inputBox.value;
  actions.innerHTML = "<button class='edit-button' type='button' onclick='editTitle(" + spaceRow + "," + row + ")'>edit</button>";
  saveSpaces(userDoc);
}

function cancelTitle(spaceRow, row) {
  var item = document.getElementById("space-" + spaceRow + "-item-" + row + "-title");
  var actions = document.getElementById("space-" + spaceRow + "-item-" + row + "-titleActions");
  item.innerHTML = userDoc.spaces[spaceRow].items[row].title;
  actions.innerHTML = "<button class='edit-button' type='button' onclick='editTitle(" + spaceRow + "," + row + ")'>edit</button>";
}

function saveText(spaceRow, row) {
  var item = document.getElementById("space-" + spaceRow + "-item-" + row + "-text");
  var actions = document.getElementById("space-" + spaceRow + "-item-" + row + "-textActions");
  var inputBox = document.getElementById("space-" + spaceRow + "-item-" + row + "-input-text")
  userDoc.spaces[spaceRow].items[row].text = inputBox.value;
  item.innerHTML = inputBox.value;
  actions.innerHTML = "<button class='edit-button' type='button' onclick='editText(" + spaceRow + "," + row + ")'>edit</button>";
  saveSpaces(userDoc);
}

function editText(spaceRow, row) {
  var item = document.getElementById("space-" + spaceRow + "-item-" + row + "-text");
  var actions = document.getElementById("space-" + spaceRow + "-item-" + row + "-textActions");
  actions.innerHTML = "<button class='edit-button' type='button' onclick='saveText(" + spaceRow + "," + row + ")'>done</button> <button class='edit-button' type='button' onclick='cancelText(" + spaceRow + "," + row + ")'>cancel</button>";
  item.innerHTML = "<textarea class='input-text' name='input-box' rows='3' id='space-" + spaceRow + "-item-" + row + "-input-text' value=''>" + startText + "</textarea>";
}

function cancelText(spaceRow, row) {
  var item = document.getElementById("space-" + spaceRow + "-item-" + row + "-text");
  var actions = document.getElementById("space-" + spaceRow + "-item-" + row + "-textActions");
  item.innerHTML = userDoc.spaces[spaceRow].items[row].text;
  actions.innerHTML = "<button class='edit-button' type='button' onclick='editText(" + spaceRow + "," + row + ")'>edit</button>";
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        MEDIA UPLOAD
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//update file name in media upload
function updateFileName(fileInput) {
  var split = fileInput.value.split('\\');
  document.getElementById("file-name").innerHTML = split[split.length - 1]
  document.getElementById("file-name").style.fontSize = "12px"
}

//upload media to S3
function uploadMedia(spaceRow, row) {
    var id = "upload-" + spaceRow + "-" + row;
    var fileObject = document.getElementById(id);
    var fileReader = new FileReader();
    if (fileObject.files.length > 0) {

      if (!(fileObject.files[0].type.includes("text/plain") || fileObject.files[0].type.includes("jpeg") || fileObject.files[0].type.includes("png") || fileObject.files[0].type.includes("ogg"))) {
        loadMessage(false, "file type unsupported - try again");
        return;
      }

      fileReader.readAsArrayBuffer(fileObject.files[0]);
      fileReader.onload = function() {

        if (fileObject.files[0].type.includes("jpeg") || fileObject.files[0].type.includes("png")) {
          var image = new Image;

          var data = fileReader.result;

          image.onload = function() {
            getSignedUrl(userDoc, spaceRow, row, fileObject.files[0], data, image.width, image.height);
          }

          image.src = URL.createObjectURL(fileObject.files[0]);
        }
        else {
          var data = fileReader.result;
          getSignedUrl(userDoc, spaceRow, row, fileObject.files[0], data, 300, 300);
        }
      };
    }
}

function setMediaSelected(spaceRow, row, selected) {
  userDoc.spaces[spaceRow].items[row].media.selected = selected;
  saveSpaces(userDoc);
  loadDatabaseInfo(userDoc.spaces[spaceRow].name, spaceRow)
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        DEVICE MANAGEMENT
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function loadDevices() {

  document.getElementById("db-table").innerHTML = "";

  if (userDoc.devices.length == 0) {
      var table = document.getElementById("db-table");
      var rowV = table.insertRow(0);
      rowV.insertCell(0).innerHTML = "<div style='text-align: center'><button class='db-name-save-button' id='device-add-button' onclick='addNewDevice(" + 0 + ")'><img src='assets/addB.png'></button></div>";
      rowV.cells[0].style.border = "none";
      rowV.cells[0].colSpan = "4";
      return;
  }

  var table = document.getElementById("db-table");

  for (var row = 0; row < userDoc.devices.length; row++) {
      var rowV = table.insertRow(row * 2);
      var rowW = table.insertRow(row * 2 + 1);
      rowV.insertCell(0);
      rowW.insertCell(0);
      var devImage = "assets/holo" + (row%3 + 1) + ".jpg";
      rowV.cells[0].style.backgroundImage = "url('" + devImage + "')";
      rowV.cells[0].style.backgroundSize = "cover";
      rowV.cells[0].style.backgroundPosition = "center";
      rowV.cells[0].style.textAlign = "center"
      rowW.cells[0].innerHTML = "<div style='padding-top: 30px; width: 400px; display: inline-block'>Name: <div style='display: inline-block' id='device-name-row-" + row + "'>" + userDoc.devices[row].deviceName + "</div></div>" +
                        "<div style='display: inline-block; float: right' id='device-actions-row-" + row + "'><a style='cursor: pointer;' onclick='generateQR(\"" + userDoc.devices[row]._id +
                        "\")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/qr.png'><figcaption>QR</figcaption></figure></a><a style='cursor: pointer;' onclick='editDevice(" + row +
                        ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/edit.png'><figcaption>Edit</figcaption></figure></a><a style='cursor: pointer;' onclick='deleteDevice(" + row +
                        ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/delete.png'><figcaption>Delete</figcaption></figure></a></div><div style='display: inline-block; padding-left: 150px;'>Space: <div style='display: inline-block' id='device-space-row-" + row + "'>" + userDoc.devices[row].spaceName + "</div></div>";

      rowV.style.backgroundColor = "#dedede"
      rowW.style.backgroundColor = "white"
      rowV.cells[0].style.height = "150px"
      rowW.cells[0].style.height = "50px"
      rowW.cells[0].style.verticalAlign = "middle"
      rowW.style.fontSize = "25px"
      rowV.style.fontSize = "25px"
  }


  var rowV = table.insertRow(row * 2);
  rowV.insertCell(0).innerHTML = "<div style='text-align: center'><button class='db-name-save-button' id='device-add-button' onclick='addNewDevice(" + (row * 2) + ")'><img src='assets/addB.png'></button></div>";
  rowV.cells[0].style.border = "none";
  rowV.cells[0].colSpan = "4";

}

function addNewDevice(row) {
  var table = document.getElementById("db-table");
  var rowV = table.insertRow(table.rows.length - 1);
  var rowW = table.insertRow(table.rows.length - 1);

  rowV.insertCell(0);
  rowW.insertCell(0);
  var devImage = "assets/holo" + (row%3) + ".jpg";
  rowV.cells[0].style.backgroundImage = "url('" + devImage + "')";
  rowV.cells[0].style.backgroundSize = "cover";
  rowV.cells[0].style.backgroundPosition = "center";
  rowV.cells[0].style.textAlign = "center"

  var options = "<select class='device-space-entry' id='device-space-entry' name='spaces'>";
  for (var space in userDoc.spaces) {
      options += "<option value=\"" + userDoc.spaces[space].name + "\">" + userDoc.spaces[space].name + "</option>";
  }
  options += "</select>"

  rowW.cells[0].innerHTML = "Name: <div style='display: inline-block' id='device-name-row-" + row + "'><input maxlength='15' class='device-name-entry' id='device-name-entry' type='text' value=''></div>" +
                    "<div style='display: inline-block; float: right' id='device-actions-row-" + row + "'>" +
                    "<a style='cursor: pointer;' onclick='saveNewDevice(" + row + ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/save.png'><figcaption>Save</figcaption></figure>" +
                    "</a><a style='cursor: pointer;' onclick='cancelNewDevice(" + row + ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/delete.png'><figcaption>Cancel</figcaption></figure></a>" +
                    "</div><div style='display: inline-block; padding-left: 150px;'>Space: <div style='display: inline-block' id='device-space-row-" + row + "'>" + options + "</div></div>";

  // rowV.style.backgroundColor = "#dedede"
  rowV.style.backgroundColor = "#dedede"
  rowW.style.backgroundColor = "white"
  rowV.cells[0].style.height = "150px"
  rowW.cells[0].style.height = "50px"
  rowW.cells[0].style.verticalAlign = "middle"
  rowW.style.fontSize = "25px"
  rowV.style.fontSize = "25px"

  document.getElementById("device-add-button").disabled = true;

}

function saveNewDevice(row) {
  var table = document.getElementById("db-table");
  var name = document.getElementById("device-name-entry").value;
  var space = document.getElementById("device-space-entry").value;

  if (name == "") {
      loadMessage(false, "please enter a name and try again")
      return;
  }

  if (space == "") {
      loadMessage(false, "please enter a space and try again")
      return;
  }

  var rowV = table.rows[row + 2];
  rowV.cells[0].innerHTML = "<div style='text-align: center'><button class='db-name-save-button' id='device-add-button' onclick='addNewDevice(" + (row + 2) + ")'>add new device</button></div>";

  generateDeviceId(name, space);

  document.getElementById("device-add-button").disabled = false;
}

function deleteDevice(row) {
  swal({
    title: "Are you sure you want to delete this device?",
    showCancelButton: true,
    closeOnConfirm: true,
    type: "warning"
  }, function(isConfirmed) {
        if (isConfirmed) {
          var table = document.getElementById("db-table");
          userDoc.devices.splice(row, 1);

          loadDevices();
          saveDevices(userDoc);

          document.getElementById("device-add-button").disabled = false;
        }
  });
}

function cancelNewDevice(row) {
  var table = document.getElementById("db-table");
  table.deleteRow(table.rows.length - 2);
  table.deleteRow(table.rows.length - 2);
  document.getElementById("device-add-button").disabled = false;
}

function editDevice(row) {
  var deviceName = document.getElementById("device-name-row-" + row);
  var deviceSpace = document.getElementById("device-space-row-" + row);
  var deviceActions = document.getElementById("device-actions-row-" + row);

  var initName = deviceName.innerHTML;
  var initSpace = deviceSpace.innerHTML;

  deviceName.innerHTML = "<input maxlength='18' class='device-name-entry' id='device-name-entry-row-" + row + "' type='text' value='" + deviceName.innerHTML + "'>";

  var options = "<select class='device-space-entry' id='device-space-entry-row-" + row + "' name='spaces'>";
  for (var space in userDoc.spaces) {
      options += "<option value=\"" + userDoc.spaces[space].name + "\">" + userDoc.spaces[space].name + "</option>";
  }
  options += "</select>"
  deviceSpace.innerHTML = options;


  deviceActions.innerHTML = "<a style='cursor: pointer;' onclick='saveEditDevice(" + row + ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/save.png'><figcaption>Save</figcaption></figure>" +
                    "</a><a style='cursor: pointer;' onclick='cancelEditDevice(" + row + ",\"" + initName + "\",\"" + initSpace + "\")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/delete.png'><figcaption>Cancel</figcaption></figure></a>"
                    "</div><div style='display: inline-block; padding-left: 150px;'>Space: <div style='display: inline-block' id='device-space-row-" + row + "'>" + options + "</div>";

}

function cancelEditDevice(row, name, space) {
  var deviceName = document.getElementById("device-name-row-" + row);
  var deviceSpace = document.getElementById("device-space-row-" + row);
  var deviceActions = document.getElementById("device-actions-row-" + row);

  deviceName.innerHTML = name;
  deviceSpace.innerHTML = space;
  deviceActions.innerHTML = "<a style='cursor: pointer;' onclick='generateQR(\"" + userDoc.devices[row]._id +
                "\")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/qr.png'><figcaption>QR</figcaption></figure></a><a style='cursor: pointer;' onclick='editDevice(" + row +
                ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/edit.png'><figcaption>Edit</figcaption></figure></a><a style='cursor: pointer;' onclick='deleteDevice(" + row +
                ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/delete.png'><figcaption>Delete</figcaption></figure></a></div>";

}

function saveEditDevice(row) {
  var name = document.getElementById("device-name-entry-row-" + row).value;
  var space = document.getElementById("device-space-entry-row-" + row).value;

  if (name == "") {
      loadMessage(false, "please enter a name and try again")
      return;
  }

  if (space == "") {
      loadMessage(false, "please enter a space and try again")
      return;
  }

  editDeviceAction(userDoc.devices[row]._id, space, name);

}
