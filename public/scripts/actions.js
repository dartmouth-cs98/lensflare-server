var fadeInInterval;
var fadeOutInterval;

//sign in using username and pass
function signIn() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    axios.post('/jwt', {
        'email': email,
        'password': password
    }).then((res) => {
        // get the JWT
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("email", res.data.email);
        // set request header
        // make request
        window.location.href = "/database";

    }).catch((err) => {
        // alert the failure to the user
        document.getElementById("message").innerHTML = "Authentication failed: " + err;
    })

}

//SIGN UP LOCALLY
function signUp() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("pass1").value
    if (checkAll()) {
        axios.post('/signUp', {
            'username': email,
            'password': password,
            'name': name
        }).then((res) => {
            window.location.href = "/";
        }).catch((err) => {
            // alert the failure to the user
            document.getElementById("message").innerHTML = "Signup failed: " + err;
        })
    }

}

//check if user really wants to clear space or not
function clearSpace(spaceName) {
  swal({
    title: "Are you sure you want to delete the space \"" + spaceName + "\"?",
    showCancelButton: true,
    closeOnConfirm: true,
    type: "warning"
  }, function(isConfirmed) {
        if (isConfirmed) clearSpaceConfirmed(spaceName)
  });
}


//clear space when confirmed
function clearSpaceConfirmed(spaceName) {
    closePopover();
    axios.post('/clearSpace', {
        params: {
            email: localStorage.getItem('email'),
            space: spaceName
        }
    }, {
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        // window.location.reload();
        for (var space in userDoc.spaces) {
          if (userDoc.spaces[space].name == spaceName) {
            userDoc.spaces.splice(space, 1)
            break;
          }
        }
        displaySpaces();
    });
}

//gerneates device id given a device name and space
function generateDeviceId(device, space) {
    axios.post('/generateDeviceId', {
        params: {
            userEmail: localStorage.getItem('email'),
            spaceName: space,
            deviceName: device
        }
    }, {
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        generateQR(JSON.parse(resp.data).deviceToken);
        userDoc.devices.push({"deviceName": device, "spaceName": space, "_id": JSON.parse(resp.data).deviceToken});
        loadDevices();
    });
}

//edit the device given a token and a new name/space
function editDeviceAction(deviceToken, deviceSpace, deviceName) {
    axios.post('/editDevice', {
        params: {
            email: localStorage.getItem('email'),
            deviceId: deviceToken,
            space: deviceSpace,
            name: deviceName
        }
    }, {
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        for (var deviceInd in userDoc.devices) {
          if (userDoc.devices[deviceInd]._id == deviceToken) {
            userDoc.devices[deviceInd].deviceName = deviceName
            userDoc.devices[deviceInd].spaceName = deviceSpace
          }
        }
        loadDevices();
        loadMessage(true, "device saved")
    }).catch(function (error) {
        loadMessage(false, error)
    });
}

//load all spaces
function loadSpaces() {
    axios.get('/getSpaces', {
        params: {
            email: localStorage.getItem('email')
        },
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        displayWelcome(resp.request.response);
    }).catch(function (error) {
        loadMessage(false, error)
    });
}

//save the userDoc
function saveSpaces(userDoc) {
    axios.post('/saveSpaces', {
        userDoc: userDoc
    }, {
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        loadMessage(true, "saved successfully")
    }).catch(function (error) {
        loadMessage(false, "error saving - try again")
    });
}

//get a signed URL given the userdoc and the file
function getSignedUrl(userDoc, spaceRow, row, file, fileBytes, width, height) {
    axios.post('/sign-s3', {
        headers: {
            'content-type': 'application/json'
        }, file: userDoc.email + "/" + userDoc.spaces[spaceRow].name + "/" + file.name
    }).then(function (resp) {
        userDoc.spaces[spaceRow].items[row].media = {'selected': true, 'media_url': resp.data.url, 'type': file.type, 'width': width, 'height': height};
        saveSpaces(userDoc);
        putS3Media(file, fileBytes, resp, spaceRow)
    }).catch(function (error) {
        loadMessage(false, "error uploading - try again")
    });
}

//put the actual media file in S3
function putS3Media(file, fileBytes, resp, spaceRow) {
    axios.put(resp.data.signedUrl, fileBytes, {
        headers: {
            'Content-Type': ''
        }
    }).then(function (resp) {
        // now save the url in the userDoc
        loadDatabaseInfo(userDoc.spaces[spaceRow].name, spaceRow);
    }).catch(function (error) {
        loadMessage(false, "error uploading - try again")
    });
}

//save devices
function saveDevices(userDoc) {
    axios.post('/saveDevices', {
        userDoc: userDoc
    }, {
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        loadMessage(true, "saved successfully")
    }).catch(function (error) {
        loadMessage(false, "error saving - try again")
    });
}



//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        MESSAGES TO USER
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


//generate a QR code and show the user
function generateQR(deviceTokenJSON) {
    // showPopover("QR Code<button class='qr-close-button' type='button' onclick='closePopover()'>X</button><br />");
    swal({
      title: "QR Code",
      text: "<div style='padding-left:110px' id='qr-popup'></div>",
      closeOnConfirm: true,
      html: true
    });
    var qrCode = new QRCode(document.getElementById('qr-popup'), deviceTokenJSON);
}

//show popover
function showPopover(value) {
    document.getElementById('popover').innerHTML = value;
    document.getElementById('popover').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

//close popover
function closePopover() {
    document.getElementById('popover').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

//load a message to the user - false means red, true means green
function loadMessage(success, message) {
    if (!success) document.getElementById("db-messages").style.backgroundColor = "#ff7f7f"
    else document.getElementById("db-messages").style.backgroundColor = "#84BE6A"

    document.getElementById("db-messages").innerHTML = message;
    document.getElementById("db-messages").style.opacity = "0";
    var opacity = 0;
    var fadeInDone = false;

    if (typeof fadeInInterval != 'undefined') clearInterval(fadeInInterval);
    if (typeof fadeInInterval != 'undefined') clearInterval(fadeOutInterval);

    fadeInInterval = setInterval(function () {
        document.getElementById("db-messages").style.opacity = "" + opacity;
        opacity += 0.01;
        if (opacity > 1.5) {
            fadeInDone = true;
            clearInterval(fadeInInterval);
        }
    }, 10);

    fadeOutInterval = setInterval(function () {
        if (fadeInDone) {
            document.getElementById("db-messages").style.opacity = "" + opacity;
            opacity -= 0.01;
            if (opacity < 0) {
                clearInterval(fadeOutInterval);
            }
        }
    }, 10);
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                        SIGN UP CHECKS
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function checkAll() {
   document.getElementById("errors").innerHTML = ""
   var pass = checkPasswords()
   pass = checkName() && pass
   pass = checkEmail() && pass
   return pass;
}

function checkPasswords() {
    var pass1 = document.getElementById("pass1");
    var pass2 = document.getElementById("pass2");
    if (pass1.value != pass2.value) {
        document.getElementById("errors").innerHTML += "Passwords do not match. Try again.<br />"
        pass1.style.backgroundColor = "#ffcccc"
        pass2.style.backgroundColor = "#ffcccc"
        return false;
    }
    else if (pass1.value.length < 9) {
        document.getElementById("errors").innerHTML += "Password is not long enough. Please enter a password longer than 8 characters.<br />"
        pass1.style.backgroundColor = "#ffcccc"
        return false;
    }
    pass1.style.backgroundColor = "#ffffff"
    pass2.style.backgroundColor = "#ffffff"
    return true;
}

function checkName() {
    var name = document.getElementById("name");
    if (name.value.length < 3) {
        document.getElementById("errors").innerHTML += "Name must be at least 2 characters. Try again.<br />"
        name.style.backgroundColor = "#ffcccc"
        return false;
    }
    name.style.backgroundColor = "#ffffff"
    return true;
}

function checkEmail() {
    var email = document.getElementById("email");
    if (email.value.length == 0) {
        document.getElementById("errors").innerHTML += "Please enter your email address.<br />"
        email.style.backgroundColor = "#ffcccc"
        return false;
    }
    email.style.backgroundColor = "#ffffff"
    return true;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = "/";
}
