var startText = "";
var currCellRow = -1;
var currCellCol = -1;
var active = false;

var userDoc = {
  name: localStorage.getItem("name"),
  email: localStorage.getItem("email")
};

if (!localStorage.getItem("token")) {
    window.location.href = "/";
}

function displayData(user) {
  userDoc = JSON.parse(user).local;

  document.getElementById("space-links").innerHTML = "Welcome, " + userDoc.name + "!<br /><br />";

  for (var space in userDoc.spaces) {
      document.getElementById("space-links").innerHTML += "<a style='cursor: pointer;' onclick='loadDatabase(this," + space + ")'>" + userDoc.spaces[space].name + "</a><br />"
  }

  document.getElementById("space-links").innerHTML += "<div style='font-size:12px; text-align:center'><a style='cursor: pointer;' onclick='addSpace()'>add new space</a></div>"

  var start = {};
  start.text = userDoc.spaces[0].name
  document.getElementById("db-name").innerHTML = userDoc.spaces[0].name
  loadDatabase(start, 0)

  console.log(userDoc);
}

function loadDatabase(space, spaceRow) {
    document.getElementById("db-name").innerHTML = space.text
    document.getElementById("db-table").innerHTML = "";

    if (userDoc.spaces[spaceRow].items.length == 0) {
        document.getElementById("db-table").innerHTML = "There appears to be no photos taken - start setup via HoloLens!";
        return;
    }

    var table = document.getElementById("db-table");
    var header = table.createTHead();
    var headerRow = header.insertRow(0);
    headerRow.insertCell(0).innerHTML = "Image"
    headerRow.insertCell(1).innerHTML = "Title"
    headerRow.insertCell(2).innerHTML = "Text"
    headerRow.insertCell(3).innerHTML = "Media"
    for (var row = 1; row < 4; row++) {
        var rowV = table.insertRow(row);
        rowV.insertCell(0).innerHTML = "<img height='auto' width='250px' src='" + userDoc.spaces[spaceRow].items[row - 1].url + "'>"
        rowV.insertCell(1).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 1 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row - 1].title;
        rowV.insertCell(2).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 2 + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row - 1].text;
        rowV.insertCell(3).innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + (row - 1) + "," + 3 + ")'>edit</button><br />[add URL]";

        rowV.cells[0].style.backgroundColor = "#f0f0ff";
        rowV.cells[1].style.width = "175px";
        rowV.cells[2].style.backgroundColor = "#f0f0ff";
        rowV.cells[3].style.width = "100px";

    }
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
    document.getElementById("db-name").innerHTML = "<input class='db-name-entry' id='db-name-entry' type='text' value=''><form action='/save' method='post'><button class='db-name-save-button' onclick='saveNewSpace()'>save</button></form>"
    document.getElementById("db-name-entry").focus();
    document.getElementById("db-table").innerHTML = "Enter the new item's name above and then start setup via HoloLens!";
}

function saveNewSpace() {
    var dbName = document.getElementById("db-name-entry").value;

    if (dbName == "") {
        document.getElementById("db-table").innerHTML = "<div style='color:red'>Please enter a name for the new entry and try again.</div>"
        return;
    }
    userDoc.spaces.push({
        name: dbName,
        items: []
    })
    reloadSidebar();

    var newDB = {};
    newDB.text = dbName;
    loadDatabase(newDB, userDoc.spaces.length - 1);
    saveSpaces(userDoc);
}

function reloadSidebar() {

    document.getElementById("space-links").innerHTML = "";

    for (var space in userDoc.spaces) {
        document.getElementById("space-links").innerHTML += "<a style='cursor: pointer;' onclick='loadDatabase(this," + space + ")'>" + userDoc.spaces[space].name + "</a><br />"
    }

    document.getElementById("space-links").innerHTML += "<div style='font-size:12px; text-align:center'><a style='cursor: pointer;' onclick='addSpace()'>add new</a></div>"

}
