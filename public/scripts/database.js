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
      document.getElementById("db-table").innerHTML = "<div style='text-align: center'>You haven't set up a space yet - click on the plus sign in the sidebar or visit the <a href='/help'>help page</a> to get started!</div>";
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

    //set up animation scene
    // canvas = document.getElementById("c");
    // renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
    // renderer.setSize(100, window.innerHeight);
    // renderer.setClearColor(0xffffff, 0);
    // canvas.style.left = (window.innerWidth - 120) + "px";


    //set up sidebar and welcome div
    // document.getElementById("space-links").innerHTML = "";

    // for (var space in userDoc.spaces) {
    //     document.getElementById("space-links").innerHTML += "<a style='cursor: pointer;' onclick='loadDatabase(this," + space + ")'>" + userDoc.spaces[space].name + "</a><button class='delete-space-button' onclick='clearSpace(\"" + userDoc.spaces[space].name + "\")'><img src='assets/close.png'></button><br/>"
    // }

    //start animation with meshes
    // animate();

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
    // var header = table.createTHead();
    // var headerRow = header.insertRow(0);
    // headerRow.style.background = "-webkit-linear-gradient(135deg, #4952FF, #88B7FF, #FDF6C0, #FFFFFF)"
    // headerRow.style.backgroundAttachment = "fixed"
    // headerRow.style.color = "black";
    // headerRow.insertCell(0).innerHTML = "Image"
    // headerRow.insertCell(1).innerHTML = "Title"
    // headerRow.insertCell(2).innerHTML = "Text"
    // headerRow.insertCell(3).innerHTML = "Mesh"
    for (var row = 0; row < userDoc.spaces[spaceRow].items.length; row++) {
        var rowV = table.insertRow(row);
        rowV.insertCell(0).innerHTML = "<img height='auto' width='350px' src='" + userDoc.spaces[spaceRow].items[row].url + "'>"
        rowV.insertCell(1).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row) + "," + 1 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].title;
        rowV.insertCell(2).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row) + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text +
                                        "<br /><br /><br /><br /><input class='upload-button' id='upload-" + spaceRow + "-" + (row) + "' type='file'><button class='upload-button' type='button' onclick='uploadMedia(" + spaceRow + "," + (row) + ")'>upload media</button>";

        var mediaUrl = "none currently uploaded"

        if (userDoc.spaces[spaceRow].items[row].media != null && typeof(userDoc.spaces[spaceRow].items[row].media.media_url) != 'undefined') {
          var split = userDoc.spaces[spaceRow].items[row].media.media_url.split('/');
          if (split.length > 0) {
            mediaUrl = "<a href=\"" + userDoc.spaces[spaceRow].items[row].media.media_url + "\">" + split[split.length - 1] + "</a>"
          }
        }

        var popoverText = "<button class=\\\"qr-close-button\\\" type=\\\"button\\\" onclick=\\\"closePopover()\\\">X</button>" +
                      "Upload New Media<br /><br /><div style=\\\"font-size: 12px\\\">supported file types:<br />jpeg & png images, ogg videos</div><div style=\\\"text-align: center\\\"><br /><label class=\\\"upload-button\\\"><input accept=\\\"image/png, image/jpeg, video/ogg\\\" onchange=\\\"updateFileName(this)\\\" style=\\\"border: none\\\" class=\\\"upload-button\\\" id=\\\"upload-" + spaceRow + "-" + (row) + "\\\" type=\\\"file\\\">choose file</label> | <button class=\\\"upload-button\\\" type=\\\"button\\\" onclick=\\\"uploadMedia(" + spaceRow + "," + (row) + ")\\\">upload</button><div id=\\\"file-name\\\"></div></div>";
        rowV.cells[2].innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row) + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text +
                                        "<br /><br /><br /><br /><div style='font-size: 12px'>current file: " + mediaUrl + "<br /><button class='upload-button' onclick='showPopover(\"" + popoverText + "\")'>edit media</button></div>";


        // rowV.insertCell(3);

        rowV.style.height = "100px";
        rowV.cells[0].style.width = "175px";
        rowV.cells[1].style.width = "175px";
        // rowV.cells[3].style.width = "100px";
        // rowV.cells[3].setAttribute("name", "mesh");
        // rowV.cells[3].style.background = "none"
    }

    // scenes = [];
    // loadMeshes();
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

function edit(spaceRow, row, col) {
    if (currCellRow != -1) {
        cancel(spaceRow, currCellRow, currCellCol)
    }
    active = true;
    var table = document.getElementById("db-table");
    var cell = table.rows[row + 1].cells[col];
    startText = cell.innerText;
    if (col == 1) startText = userDoc.spaces[spaceRow].items[row].title;
    else startText = userDoc.spaces[spaceRow].items[row].text;


    cell.innerHTML = "<form action='/save' method='post'><button class='edit-button' type='button' onclick='save(" + spaceRow + "," + row + "," + col + ")'>done</button> <button class='edit-button' type='button' onclick='cancel(" + spaceRow + "," + row + "," + col + ")'>cancel</button><textarea class='input-text' name='input-box' rows='3' id='input-box' value=''>" + startText + "</textarea></form>";

    currCellRow = row;
    currCellCol = col;
}

function save(spaceRow, row, col) {
    active = false;
    var table = document.getElementById("db-table");
    var cell = table.rows[row + 1].cells[col];
    var inputBox = document.getElementById('input-box')
    if (col == 1) userDoc.spaces[spaceRow].items[row].title = inputBox.value
    else userDoc.spaces[spaceRow].items[row].text = inputBox.value

    if (col == 1) cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + col + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].title;
    else cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + col + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text;

    if (col != 1) {
      var mediaUrl = "none currently uploaded"

      if (userDoc.spaces[spaceRow].items[row].media != null && typeof(userDoc.spaces[spaceRow].items[row].media.media_url) != 'undefined') {
        var split = userDoc.spaces[spaceRow].items[row].media.media_url.split('/');
        if (split.length > 0) {
          mediaUrl = "<a href=\"" + userDoc.spaces[spaceRow].items[row].media.media_url + "\">" + split[split.length - 1] + "</a>"
        }
      }

      var popoverText = "<button class=\\\"qr-close-button\\\" type=\\\"button\\\" onclick=\\\"closePopover()\\\">X</button>" +
                    "Upload New Media<br /><br /><div style=\\\"font-size: 12px\\\">supported file types:<br />jpeg & png images, ogg videos</div><div style=\\\"text-align: center\\\"><br /><label class=\\\"upload-button\\\"><input accept=\\\"image/png, image/jpeg, video/ogg\\\" onchange=\\\"updateFileName(this)\\\" style=\\\"border: none\\\" class=\\\"upload-button\\\" id=\\\"upload-" + spaceRow + "-" + row + "\\\" type=\\\"file\\\">choose file</label> | <button class=\\\"upload-button\\\" type=\\\"button\\\" onclick=\\\"uploadMedia(" + spaceRow + "," + row + ")\\\">upload</button><div id=\\\"file-name\\\"></div></div>";
      cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row  + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text +
                                      "<br /><br /><br /><br /><div style='font-size: 12px'>current file: " + mediaUrl + "<br /><button class='upload-button' onclick='showPopover(\"" + popoverText + "\")'>edit media</button></div>";
    }

    saveSpaces(userDoc);
}

function cancel(spaceRow, row, col) {
    var table = document.getElementById("db-table");
    var cell = table.rows[row + 1].cells[col];

    if (active) {
      cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + col + ")'>edit</button><br />" + startText;

      if (col != 1) {
        var mediaUrl = "none currently uploaded"

        if (userDoc.spaces[spaceRow].items[row].media != null && typeof(userDoc.spaces[spaceRow].items[row].media.media_url) != 'undefined') {
          var split = userDoc.spaces[spaceRow].items[row].media.media_url.split('/');
          if (split.length > 0) {
            mediaUrl = "<a href=\"" + userDoc.spaces[spaceRow].items[row].media.media_url + "\">" + split[split.length - 1] + "</a>"
          }
        }

        var popoverText = "<button class=\\\"qr-close-button\\\" type=\\\"button\\\" onclick=\\\"closePopover()\\\">X</button>" +
                      "Upload New Media<br /><br /><div style=\\\"font-size: 12px\\\">supported file types:<br />jpeg & png images, ogg videos</div><div style=\\\"text-align: center\\\"><br /><label class=\\\"upload-button\\\"><input accept=\\\"image/png, image/jpeg, video/ogg\\\" onchange=\\\"updateFileName(this)\\\" style=\\\"border: none\\\" class=\\\"upload-button\\\" id=\\\"upload-" + spaceRow + "-" + row + "\\\" type=\\\"file\\\">choose file</label> | <button class=\\\"upload-button\\\" type=\\\"button\\\" onclick=\\\"uploadMedia(" + spaceRow + "," + row + ")\\\">upload</button><div id=\\\"file-name\\\"></div></div>";
        cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row  + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text +
                                        "<br /><br /><br /><br /><div style='font-size: 12px'>current file: " + mediaUrl + "<br /><button class='upload-button' onclick='showPopover(\"" + popoverText + "\")'>edit media</button></div>";

      }
    }

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

      console.log(fileObject.files[0].type)
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

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        DEVICE MANAGEMENT
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function loadDevices() {

  document.getElementById("db-table").innerHTML = "";

  if (userDoc.devices.length == 0) {
      document.getElementById("db-table").style.border = "none";
      document.getElementById("db-table").innerHTML = "You haven't added any devices yet! <button class='db-name-save-button' id='device-add-button' onclick='addFirstDevice()'>Click here to add a new device.</button>";
      return;
  }

  // else {
  //     document.getElementById("db-table").style.border = "none";
  //     for (var row in userDoc.devices) {
  //       document.getElementById("db-table").innerHTML += "<div class='space-blocks'><img width='100%' src='assets/device.png'>" +
  //       "<br />" + userDoc.devices[row].deviceName + " for " + userDoc.devices[row].spaceName + "<br /><a style='cursor: pointer;' onclick='generateQR(\"" + userDoc.devices[row]._id + "\")'>qr</a> | <a style='cursor: pointer;' onclick='editDevice(" + row +
  //       ")'>edit</a> | <a style='cursor: pointer;' onclick='deleteDevice(" + row + ")'>delete</a></div>";
  //
  //     }
  //     document.getElementById("db-table").innerHTML += "<div id='new-space-block' class='space-blocks'><img onclick='addSpace()' width='100%' style='padding-bottom: 21px' src='assets/addholder.png'></div>"
  //
  // }

  var table = document.getElementById("db-table");

  for (var row = 0; row < userDoc.devices.length; row++) {
      var rowV = table.insertRow(row * 2);
      var rowW = table.insertRow(row * 2 + 1);
      rowV.insertCell(0);
      rowW.insertCell(0);
      rowV.cells[0].innerHTML = "<img src='assets/dev.svg' height='100%'>";
      rowV.cells[0].style.textAlign = "center"
      rowW.cells[0].innerHTML = "Name: <div style='display: inline-block' id='device-name-row-" + row + "'>" + userDoc.devices[row].deviceName + "</div>" +
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

function addFirstDevice() {
  document.getElementById("db-table").innerHTML = "";

  var table = document.getElementById("db-table");
  var header = table.createTHead();
  var headerRow = header.insertRow(0);
  headerRow.style.backgroundColor = "#3B3C59";
  headerRow.style.color = "#ffffff";
  headerRow.insertCell(0).innerHTML = "Device Name"
  headerRow.insertCell(1).innerHTML = "Space Associated"
  headerRow.insertCell(2).innerHTML = "Actions"

  var rowV = table.insertRow(1);
  rowV.insertCell(0).innerHTML = "<input maxlength='18' id='device-name-entry' type='text' value=''>";

  var options = "<select id='device-space-entry' name='spaces'>";
  for (var space in userDoc.spaces) {
      options += "<option value=\"" + userDoc.spaces[space].name + "\">" + userDoc.spaces[space].name + "</option>";
  }
  options += "</select>"
  rowV.insertCell(1).innerHTML = options;

  rowV.insertCell(2).innerHTML = "<a style='cursor: pointer;' onclick='saveNewDevice(" + 1 + ")'>save</a> | <a style='cursor: pointer;' onclick='cancelNewDevice(" + 0 + ")'>cancel</a>";
  rowV.cells[2].style.textAlign = "center";

  var rowV = table.insertRow(2);
  rowV.insertCell(0).innerHTML = "<div style='text-align: center'><button class='db-name-save-button' id='device-add-button' onclick='addNewDevice(" + 2 + ")'>add new device</button></div>";
  rowV.cells[0].style.border = "none";
  rowV.cells[0].colSpan = "3";
  document.getElementById("device-add-button").disabled = true;
}

function addNewDevice(row) {
  var table = document.getElementById("db-table");
  var rowV = table.insertRow(table.rows.length - 1);
  var rowW = table.insertRow(table.rows.length - 1);

  rowV.insertCell(0);
  rowW.insertCell(0);
  rowV.cells[0].innerHTML = "<img src='assets/dev.svg' height='100%'>";
  rowV.cells[0].style.textAlign = "center"

  var options = "<select id='device-space-entry' name='spaces'>";
  for (var space in userDoc.spaces) {
      options += "<option value=\"" + userDoc.spaces[space].name + "\">" + userDoc.spaces[space].name + "</option>";
  }
  options += "</select>"

  rowW.cells[0].innerHTML = "Name: <div style='display: inline-block' id='device-name-row-" + row + "'><input maxlength='15' id='device-name-entry' type='text' value=''></div>" +
                    "<div style='display: inline-block; float: right' id='device-actions-row-" + row + "'>" +
                    "<a style='cursor: pointer;' onclick='saveNewDevice(" + row + ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/save.png'><figcaption>Save</figcaption></figure>" +
                    "</a><a style='cursor: pointer;' onclick='cancelNewDevice(" + row + ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/delete.png'><figcaption>Cancel</figcaption></figure></a>" +
                    "</div><div style='display: inline-block; padding-left: 150px;'>Space: <div style='display: inline-block' id='device-space-row-" + row + "'>" + options + "</div></div>";

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
  var table = document.getElementById("db-table");
  userDoc.devices.splice(row, 1);

  loadDevices();
  saveDevices(userDoc);

  document.getElementById("device-add-button").disabled = false;
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

  deviceName.innerHTML = "<input maxlength='18' id='device-name-entry' type='text' value='" + deviceName.innerHTML + "'>";

  var options = "<select id='device-space-entry' name='spaces'>";
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
                ")'><figure style='font-size: 14px; text-align:center; display: inline-block'><img src='assets/delete.png'><figcaption>Delete</figcaption></figure></a></div><div style='display: inline-block; padding-left: 150px;'>Space: <div style='display: inline-block' id='device-space-row-" + row + "'>" + userDoc.devices[row].spaceName + "</div>";

}

function saveEditDevice(row) {
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

  editDeviceAction(userDoc.devices[row]._id, space, name);

}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        MESH/ANIMATION MANAGEMENT
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// function loadMeshes() {
//
//     var cells = document.getElementsByName('mesh');
//
//     var loader = new THREE.JSONLoader();
//     loader.load("scripts/gem.json", function(geometry) {
//       for (var i = 0; i < cells.length; i++) {
//         var cell = cells[i];
//         var scene = new THREE.Scene();
//         var camera = new THREE.PerspectiveCamera(35, 1, 1, 10000);
//
//         camera.position.z = 5;
//         scene.userData.camera = camera;
//         var material = new THREE.MeshBasicMaterial( {color: 0x3B3C59, wireframe: true} );
//         var mesh = new THREE.Mesh(geometry, material);
//
//         scene.add(mesh);
//         scene.userData.element = cell;
//         scenes.push(scene);
//         readyForAnimation = true;
//       }
//     })
//
// }
//
// function animate() {
//
//     renderer.setScissorTest(false);
//     renderer.clear();
//     renderer.setScissorTest(true);
//
//     for (var i in scenes) {
//         var mesh = scenes[i].children[0];
//
//         mesh.rotation.y += 0.015;
//
//         var cell = scenes[i].userData.element;
//
//         var rect = cell.getBoundingClientRect();
//
//         renderer.setViewport(0, renderer.domElement.clientHeight - rect.bottom + rect.height - 100, 100, 100);
//         renderer.setScissor(0, renderer.domElement.clientHeight - rect.bottom + rect.height - 100, 100, 100);
//
//         renderer.render(scenes[i], scenes[i].userData.camera)
//     }
//
//     requestAnimationFrame(animate);
//
// }
