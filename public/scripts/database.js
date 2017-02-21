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
    document.getElementById("db-name").innerHTML = space.text; //+ "<br /><button class='qr-button' type='button' onclick='generateQR(\"" + space.text + "\")'>make QR code</button>";

    document.getElementById("db-table").innerHTML = "";

    if (userDoc.spaces[spaceRow].items.length == 0) {
        document.getElementById("db-table").style.border = "none";
        document.getElementById("db-table").innerHTML = "There appears to be no photos taken - start setup via HoloLens!";
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
        rowV.insertCell(2).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row - 1].text;
        rowV.insertCell(3);
        // .innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 3 + ")'>edit</button><br />";

        rowV.style.height = "100px";
        // rowV.cells[0].style.backgroundColor = "#f0f0ff";
        rowV.cells[0].style.width = "175px";
        rowV.cells[1].style.width = "175px";
        // rowV.cells[2].style.backgroundColor = "#f0f0ff";
        rowV.cells[3].style.width = "100px";
        rowV.cells[3].setAttribute("name", "mesh");
        rowV.cells[3].style.background = "none"
    }

    scenes = [];
    loadMeshes();
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
      rowV.insertCell(2).innerHTML = "<a style='cursor: pointer;' onclick='generateQR(\"" + userDoc.devices[row - 1]._id + "\")'>qr</a> | edit | <a style='cursor: pointer;' onclick='deleteDevice(" + (row - 1) + ")'>delete</a>";
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

  rowV.insertCell(2).innerHTML = "<a style='cursor: pointer;' onclick='saveNewDevice(" + row + ")'>save</a> | <a style='cursor: pointer;' onclick='cancelNewDevice(" + (row - 1) + ")'>cancel</a>";
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

  // rowV.cells[0].innerHTML = document.getElementById("device-name-entry").value;
  // rowV.cells[1].innerHTML = document.getElementById("device-space-entry").value;
  // rowV.cells[2].innerHTML = "edit | delete";

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
    startText = startText.slice(4, startText.length);
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
    saveSpaces(userDoc);
}

function cancel(spaceRow, row, col) {
    var table = document.getElementById("db-table");
    var cell = table.rows[row + 1].cells[col];

    if (active) cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + col + ")'>edit</button><br />" + startText;
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
