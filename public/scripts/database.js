var startText = "";
var currCellRow = -1;
var currCellCol = -1;
var active = false;
var renderer;
var scenes = [];
var canvas;
var readyForAnimation = false;

var userDoc = {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email")
};

if (!localStorage.getItem("token")) {
    window.location.href = "/";
}

window.addEventListener('resize', function () {
    "use strict";
    canvas.style.left = (window.innerWidth - 120) + "px";
})

function displayData(user) {
    canvas = document.getElementById("c");
    renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
    renderer.setSize(100, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    canvas.style.left = (window.innerWidth - 120) + "px";

    userDoc = JSON.parse(user).local;
    document.getElementById("space-links").innerHTML = "Welcome, " + userDoc.name + "!<br /><br />";

    for (var space in userDoc.spaces) {

      console.log(userDoc.spaces[space])
        document.getElementById("space-links").innerHTML += "<a style='cursor: pointer;' onclick='loadDatabase(this," + space + ")'>" + userDoc.spaces[space].name + "</a><button class='delete-space-button' onclick='clearSpace(\"" + userDoc.spaces[space].name + "\")'>x</button><br/>"
    }

    document.getElementById("space-links").innerHTML += "<div style='font-size:12px; text-align:center'><a style='cursor: pointer;' onclick='addSpace()'>add new space</a></div>"

    var start = {};
    start.text = userDoc.spaces[0].name
    document.getElementById("db-name").innerHTML = userDoc.spaces[0].name
    loadDatabase(start, 0)

    animate();
}


function loadDatabase(space, spaceRow) {

    canvas = document.getElementById("c");
    canvas.style.display = 'block';

    document.getElementById("db-name").innerHTML = space.text; //+ "<br /><button class='qr-button' type='button' onclick='generateQR(\"" + space.text + "\")'>make QR code</button>";

    document.getElementById("db-table").innerHTML = "";

    if (userDoc.spaces[spaceRow].items.length == 0) {
        document.getElementById("db-table").style.border = "none";
        document.getElementById("db-table").innerHTML = "There appears to be no photos taken - start setup via HoloLens!<br /><br />To set up, follow these instructions:<br />" +
                                                          "1. If not already installed, download and install Lensflare for the HoloLens<br />" +
                                                          "2. If the device is already paired with your account, edit it in 'My Devices' to be associated with this space; if not, add a new device in 'My Devices' and associate it with this space<br />" +
                                                          "3. Open Lensflare on the HoloLens - if a new device was added in Step 2, say 'Pair Device' to enter device pairing mode on the HoloLens to scan the QR code generated<br />" +
                                                          "4. Once the device is paired with the space, say 'Enter Setup Mode' to begin set up<br />" +
                                                          "5. Follow directions on the HoloLens to place gems around your space and say 'Done' when you are finished<br />" +
                                                          "6. Once the upload is complete, you may refresh this page to see the new items you identified in the Lensflare setup mode<br />" +
                                                          "7. Edit the items' titles, descriptions, and media fields with your custom information - this will be updated every 10 seconds on your HoloLens<br />";
        scenes = [];
        return;
    }

    var table = document.getElementById("db-table");
    var header = table.createTHead();
    var headerRow = header.insertRow(0);
    headerRow.style.backgroundColor = "#3B3C59";
    headerRow.style.color = "#ffffff";
    headerRow.insertCell(0).innerHTML = "Image"
    headerRow.insertCell(1).innerHTML = "Title"
    headerRow.insertCell(2).innerHTML = "Text"
    headerRow.insertCell(3).innerHTML = "Mesh"
    for (var row = 1; row <= userDoc.spaces[spaceRow].items.length; row++) {
        var rowV = table.insertRow(row);
        rowV.insertCell(0).innerHTML = "<img height='auto' width='350px' src='" + userDoc.spaces[spaceRow].items[row - 1].url + "'>"
        rowV.insertCell(1).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 1 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row - 1].title;
        rowV.insertCell(2).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row - 1].text +
                                        "<br /><br /><br /><br /><input class='upload-button' id='upload-" + spaceRow + "-" + (row - 1) + "' type='file'><button class='upload-button' type='button' onclick='uploadMedia(" + spaceRow + "," + (row - 1) + ")'>upload media</button>";

        var mediaUrl = "none currently uploaded"

        if (userDoc.spaces[spaceRow].items[row - 1].media != null && typeof(userDoc.spaces[spaceRow].items[row - 1].media.media_url) != 'undefined') {
          var split = userDoc.spaces[spaceRow].items[row - 1].media.media_url.split('/');
          if (split.length > 0) {
            mediaUrl = "<a href=\"" + userDoc.spaces[spaceRow].items[row - 1].media.media_url + "\">" + split[split.length - 1] + "</a>"
          }
        }

        var popoverText = "<button class=\\\"qr-close-button\\\" type=\\\"button\\\" onclick=\\\"closePopover()\\\">X</button>" +
                      "Upload New Media<br /><br /><div style=\\\"font-size: 12px\\\">supported file types:<br />jpeg & png images, ogg videos</div><div style=\\\"text-align: center\\\"><br /><label class=\\\"upload-button\\\"><input accept=\\\"image/png, image/jpeg, video/ogg\\\" onchange=\\\"updateFileName(this)\\\" style=\\\"border: none\\\" class=\\\"upload-button\\\" id=\\\"upload-" + spaceRow + "-" + (row - 1) + "\\\" type=\\\"file\\\">choose file</label> | <button class=\\\"upload-button\\\" type=\\\"button\\\" onclick=\\\"uploadMedia(" + spaceRow + "," + (row - 1) + ")\\\">upload</button><div id=\\\"file-name\\\"></div></div>";
        rowV.cells[2].innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row - 1].text +
                                        "<br /><br /><br /><br /><div style='font-size: 12px'>current file: " + mediaUrl + "<br /><button class='upload-button' onclick='showPopover(\"" + popoverText + "\")'>edit media</button></div>";


        rowV.insertCell(3);

        rowV.style.height = "100px";
        rowV.cells[0].style.width = "175px";
        rowV.cells[1].style.width = "175px";
        rowV.cells[3].style.width = "100px";
        rowV.cells[3].setAttribute("name", "mesh");
        rowV.cells[3].style.background = "none"
    }

    scenes = [];
    loadMeshes();
}

function updateFileName(fileInput) {
  var split = fileInput.value.split('\\');
  document.getElementById("file-name").innerHTML = split[split.length - 1]
  document.getElementById("file-name").style.fontSize = "12px"
}

function loadDevices() {

  document.getElementById("db-table").innerHTML = "";

  // userDoc.devices = [{id: "1", name: "Nick's HoloLens #1", space: "CS98"}];

  if (userDoc.devices.length == 0) {
      document.getElementById("db-table").style.border = "none";
      document.getElementById("db-table").innerHTML = "You haven't added any devices yet! <button class='db-name-save-button' id='device-add-button' onclick='addFirstDevice()'>Click here to add a new device.</button>";
      return;
  }

  var table = document.getElementById("db-table");
  var header = table.createTHead();
  var headerRow = header.insertRow(0);
  headerRow.style.backgroundColor = "#3B3C59";
  headerRow.style.color = "#ffffff";
  headerRow.insertCell(0).innerHTML = "Device Name"
  headerRow.insertCell(1).innerHTML = "Space Associated"
  headerRow.insertCell(2).innerHTML = "Actions"

  for (var row = 1; row <= userDoc.devices.length; row++) {
      var rowV = table.insertRow(row);
      console.log(userDoc.devices[row - 1])
      rowV.insertCell(0).innerHTML = userDoc.devices[row - 1].deviceName;
      rowV.insertCell(1).innerHTML = userDoc.devices[row - 1].spaceName;
      rowV.insertCell(2).innerHTML = "<a style='cursor: pointer;' onclick='generateQR(\"" + userDoc.devices[row - 1]._id + "\")'>qr</a> | <a style='cursor: pointer;' onclick='deleteDevice(" + (row - 1) + ")'>delete</a>";
      rowV.cells[0].style.width = "45%";
      rowV.cells[1].style.width = "45%";
      rowV.cells[2].style.textAlign = "center";
  }


  var rowV = table.insertRow(row);
  rowV.insertCell(0).innerHTML = "<div style='text-align: center'><button class='db-name-save-button' id='device-add-button' onclick='addNewDevice(" + row + ")'>add new device</button></div>";
  rowV.cells[0].style.border = "none";
  rowV.cells[0].colSpan = "3";

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
  var rowV = table.insertRow(row);
  document.getElementById("device-add-button").disabled = true;
  rowV.insertCell(0).innerHTML = "<input maxlength='18' id='device-name-entry' type='text' value=''>";

  var options = "<select id='device-space-entry' name='spaces'>";
  for (var space in userDoc.spaces) {
      options += "<option value=\"" + userDoc.spaces[space].name + "\">" + userDoc.spaces[space].name + "</option>";
  }
  options += "</select>"
  rowV.insertCell(1).innerHTML = options;

  rowV.insertCell(2).innerHTML = "<a style='cursor: pointer;' onclick='saveNewDevice(" + row + ")'>save</a> | <a style='cursor: pointer;' onclick='cancelNewDevice(" + row + ")'>cancel</a>";
  rowV.cells[2].style.textAlign = "center";
}

function saveNewDevice(row) {
  var table = document.getElementById("db-table");
  var rowV = table.rows[row];
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

  var rowV = table.rows[row + 1];
  rowV.cells[0].innerHTML = "<div style='text-align: center'><button class='db-name-save-button' id='device-add-button' onclick='addNewDevice(" + (row + 1) + ")'>add new device</button></div>";

  generateDeviceId(name, space);

  document.getElementById("device-add-button").disabled = false;
}

function deleteDevice(row) {
  var table = document.getElementById("db-table");
  var rowV = table.deleteRow(row);
  userDoc.devices.splice(row, 1);

  loadDevices();
  console.log(userDoc.devices[row])
  saveDevices(userDoc);

  document.getElementById("device-add-button").disabled = false;
}

function cancelNewDevice(row) {
  var table = document.getElementById("db-table");
  var rowV = table.deleteRow(row);
  document.getElementById("device-add-button").disabled = false;
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

function uploadMedia(spaceRow, row) {
    var id = "upload-" + spaceRow + "-" + row;
    var fileObject = document.getElementById(id);
    var fileReader = new FileReader();
    if (fileObject.files.length > 0) {
      console.log(fileObject.files[0].type)
      if (!(fileObject.files[0].type.includes("jpeg") || fileObject.files[0].type.includes("png") || fileObject.files[0].type.includes("ogg"))) {
        loadMessage(false, "file type unsupported - try again");
        return;
      }
      fileReader.readAsArrayBuffer(fileObject.files[0]);
      fileReader.onload = function() {
        var data = fileReader.result;
        getSignedUrl(userDoc, spaceRow, row, fileObject.files[0], data);
      };
    }
    console.log(fileObject);
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
                    "Upload New Media<br /><br /><div style=\\\"font-size: 12px\\\">supported file types:<br />jpeg & png images, ogg videos</div><div style=\\\"text-align: center\\\"><br /><input style=\\\"border: none\\\" class=\\\"upload-button\\\" id=\\\"upload-" + spaceRow + "-" + row + "\\\" type=\\\"file\\\"><br /><button class=\\\"upload-button\\\" type=\\\"button\\\" onclick=\\\"uploadMedia(" + spaceRow + "," + row + ")\\\">upload</button></div>";
      cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text +
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
                      "Upload New Media<br /><br /><div style=\\\"font-size: 12px\\\">supported file types:<br />jpeg & png images, ogg videos</div><div style=\\\"text-align: center\\\"><br /><input style=\\\"border: none\\\" class=\\\"upload-button\\\" id=\\\"upload-" + spaceRow + "-" + row + "\\\" type=\\\"file\\\"><br /><button class=\\\"upload-button\\\" type=\\\"button\\\" onclick=\\\"uploadMedia(" + spaceRow + "," + row + ")\\\">upload</button></div>";
        cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text +
                                        "<br /><br /><br /><br /><div style='font-size: 12px'>current file: " + mediaUrl + "<br /><button class='upload-button' onclick='showPopover(\"" + popoverText + "\")'>edit media</button></div>";
      }
    }

}

function addSpace() {
    scenes = [];
    document.getElementById("db-name").innerHTML = "<input class='db-name-entry' maxlength='18' id='db-name-entry' type='text' value=''><br /><button class='db-name-save-button' onclick='saveNewSpace()'>save</button>"
    document.getElementById("db-name-entry").focus();
    document.getElementById("db-table").style.border = "none";
    document.getElementById("db-table").innerHTML = "Enter the new item's name above and then start setup via HoloLens!";
}

function manageDevices() {
    canvas = document.getElementById("c");
    canvas.style.display = 'none';
    document.getElementById("db-name").innerHTML = "My Devices"
    document.getElementById("db-table").style.border = "none";
    loadDevices()
}

function saveNewSpace() {
    var dbName = document.getElementById("db-name-entry").value;

    if (dbName == "") {
        document.getElementById("db-table").innerHTML = "<div style='color:red'>Please enter a name for the new entry and try again.</div>"
        return;
    }
    userDoc.spaces.push({
        name: dbName,
        items: [],
        anchors: ""
    })
    reloadSidebar();

    var newDB = {};
    newDB.text = dbName;
    loadDatabase(newDB, userDoc.spaces.length - 1);
    saveSpaces(userDoc);
}

function reloadSidebar() {

    document.getElementById("space-links").innerHTML = "Welcome, " + userDoc.name + "!<br /><br />";

    for (var space in userDoc.spaces) {
        document.getElementById("space-links").innerHTML += "<a style='cursor: pointer;' onclick='loadDatabase(this," + space + ")'>" + userDoc.spaces[space].name + "</a><button class='delete-space-button' onclick='clearSpace(\"" + userDoc.spaces[space].name + "\")'>x</button><br/>"
    }

    document.getElementById("space-links").innerHTML += "<div style='font-size:12px; text-align:center'><a style='cursor: pointer;' onclick='addSpace()'>add new</a></div>"
}


function loadMeshes() {

    var cells = document.getElementsByName('mesh');

    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(35, 1, 1, 10000);
        camera.position.z = 1000;
        scene.userData.camera = camera;

        // camera.position.z = 15;
        // scene.userData.camera = camera;
        //
        // var loader = new THREE.JSONLoader();
        // loader.load("scripts/mclaren.json", function(geometry) {
        //   var material = new THREE.MeshBasicMaterial( {color: 0x3B3C59, wireframe: true} );
        //   var mesh = new THREE.Mesh(geometry, material);
        //   scene.add(mesh);
        //   scene.userData.element = cell;
        //   scenes.push(scene);
        //   readyForAnimation = true;
        // })

        var geometry = new THREE.BoxGeometry(200, 200, 200);
        var material = new THREE.MeshBasicMaterial({color: 0x3B3C59, wireframe: true});

        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        scene.userData.element = cell;

        scenes.push(scene);
    }

}

function animate() {

    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);

    for (var i in scenes) {
        var mesh = scenes[i].children[0];

        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;

        var cell = scenes[i].userData.element;

        var rect = cell.getBoundingClientRect();

        renderer.setViewport(0, renderer.domElement.clientHeight - rect.bottom + rect.height - 100, 100, 100);
        renderer.setScissor(0, renderer.domElement.clientHeight - rect.bottom + rect.height - 100, 100, 100);

        renderer.render(scenes[i], scenes[i].userData.camera)
    }

    requestAnimationFrame(animate);

}
