var startText = "";
var currCellRow = -1;
var currCellCol = -1;
var active = false;

var userDoc = {};

console.log(localStorage.getItem("token"));
if (!localStorage.getItem("token")) {
    window.location.href = "/";
}


userDoc.spaces = [{
    name: "The MoMA",
    items: [
        {
            title: "T-Rex",
            text: "The T-Rex is a scary beast, it will eat you up and gobble you whole, without a second thought for your wellbeing or happiness.",
            url: "http://islanublar.jurassicworld.com/media/dinosaurs/tyrannosaurus-rex/tyrannosaurus-rex-info-graphic.png"
        },
        {
            title: "Diplo",
            text: "The long neck giraffe beast is also pretty fucking scary but it's less terrifying that a T-Rex because it prob can't eat you whole or it would choke. It prob also only eats grass.",
            url: "http://f.tqn.com/y/dinosaurs/1/S/N/Q/-/-/diplodocus-carnegi.jpg"
        },
        {
            title: "Sphinx",
            text: "The Sphinx will ask you a very difficult riddle; if you are able to figure out the answer to the riddle then you can move on past her forboding glare and into the pyramid.",
            url: "http://www.guardians.net/egypt/sphinx/images/sphinx-front-wa-2001.jpg"
        },
    ]
},
    {
        name: "Dallas Museum of Art",
        items: [
            {
                title: "Eminem",
                text: "Marshall Bruce Mathers III, known professionally as Eminem, is an American rapper, record producer, and actor.",
                url: "http://www.rapbasement.com/wp-content/uploads/2016/03/Eminem-Fack-live.jpg"
            },
            {
                title: "Rihanna",
                text: "Robyn Rihanna Fenty is a Barbadian singer and songwriter. Born in Saint Michael and raised in Bridgetown, she first entered the music industry by recording demo tapes under the direction of record producer Evan Rogers in 2003.",
                url: "https://static01.nyt.com/images/2015/10/25/t-magazine/25tmag-11well_rihanna-t_CA0/25tmag-11well_rihanna-t_CA0-articleLarge-v2.jpg"
            },
            {
                title: "Backstreet Boys",
                text: "The Backstreet Boys are an American vocal group, formed in Orlando, Florida in 1993.",
                url: "https://upload.wikimedia.org/wikipedia/en/c/c2/Albumus.jpg"
            },
        ]
    },
    {
        name: "DALI Lab",
        items: [
            {
                title: "3D Printer",
                text: "This new Generation MakerBot Printer has a 25% Larger Build Volume, and Prints 30% faster than the MakerBot Replicator Desktop.",
                url: "https://images-na.ssl-images-amazon.com/images/I/81NadegaTkL._SL1500_.jpg"
            },
            {
                title: "Inkjet Printer",
                text: "Full functions obtained with Windows XP.",
                url: "https://images-na.ssl-images-amazon.com/images/I/410AR6QRK9L.jpg"
            },
            {
                title: "Espresso Machine",
                text: "Includes Aeroccino Plus milk frother: rapid one touch preparation of hot or cold milk froth; Items sold separately valued at 199. Easy insertion and ejection of capsules; For use with Espresso coffee capsules only<br />Compact brewing unit technology; Fast preheating time: 25 seconds; 19 Bar high pressure pump<br />Removable 24 ounce water tank; Folding cup tray accommodates tall recipe glasses; Used capsule container holds 9-11 used capsules",
                url: "https://images-na.ssl-images-amazon.com/images/I/81XmnHW2NRL._SL1500_.jpg"
            },
        ]
    }
];


function loadInit() {
    for (var space in userDoc.spaces) {
        document.getElementById("space-links").innerHTML += "<a style='cursor: pointer;' onclick='loadDatabase(this," + space + ")'>" + userDoc.spaces[space].name + "</a><br />"
    }

    document.getElementById("space-links").innerHTML += "<div style='font-size:12px; text-align:center'><a style='cursor: pointer;' onclick='addSpace()'>add new space</a></div>"

    var start = {};
    start.text = userDoc.spaces[0].name
    document.getElementById("db-name").innerHTML = userDoc.spaces[0].name
    loadDatabase(start, 0)

    console.log(userDoc.spaces);

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
    console.log(row + ", " + col);
    if (col == 1) cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + col + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].title;
    else cell.innerHTML = "<button class='edit-button' type='button' onclick='edit(" + spaceRow + "," + row + "," + col + ")'>edit</button><br />" + userDoc.spaces[spaceRow].items[row].text;
}

function cancel(spaceRow, row, col) {
    var table = document.getElementById("db-table");
    var cell = table.rows[row + 1].cells[col];
    console.log(row + ", " + col);
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
}

function reloadSidebar() {

    document.getElementById("space-links").innerHTML = "";

    for (var space in userDoc.spaces) {
        document.getElementById("space-links").innerHTML += "<a style='cursor: pointer;' onclick='loadDatabase(this," + space + ")'>" + userDoc.spaces[space].name + "</a><br />"
    }

    document.getElementById("space-links").innerHTML += "<div style='font-size:12px; text-align:center'><a style='cursor: pointer;' onclick='addSpace()'>add new</a></div>"

}