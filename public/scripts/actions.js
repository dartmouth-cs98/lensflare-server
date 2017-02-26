var fadeInInterval;
var fadeOutInterval;

function addItemTest() {
    axios.post('/saveItem', {
        email: localStorage.getItem('email'),
        url: "http://dartmouth.edu/sites/default/files/styles/header_image/public/2009-1035500133.jpg?itok=LlpoUNH9",
        space: "CS98"
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

function signIn() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    console.log("About to post with axios " + email + "  " + password);
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
        console.log(err);
        document.getElementById("message").innerHTML = "Authentication failed: " + err;
    })

}

//
function signUp() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("pass1").value
    console.log(name + " " + email + " " + password);
    if (checkAll()) {
        axios.post('/signUp', {
            'username': email,
            'password': password,
            'name': name
        }).then((res) => {

            window.location.href = "/";
            console.log("Signup Complete");

        }).catch((err) => {
            // alert the failure to the user
            console.log(err);
            document.getElementById("message").innerHTML = "Signup failed: " + err;
        })
    }

}

function clearSpace(spaceName) {
    var popoverValue = "Are you sure you want to delete " + spaceName + "?<br />" +
                        "<div style='text-align: center'><button type='button' style='background-color: transparent; cursor: pointer; border: none' onclick='clearSpaceConfirmed(\"" + spaceName + "\")'>YES</button>" +
                        "<button type='button' style='background-color: transparent; cursor: pointer; border: none' onclick='closePopover()'>NO</button></div>";
    showPopover(popoverValue);
}

function clearSpaceConfirmed(spaceName) {
  closePopover();
  axios.post('/clearSpace', {
      params: {
          email: localStorage.getItem('email'),
          space: spaceName
      } }, {
      headers: {
          authorization: localStorage.getItem('token')
      }
  }).then(function (resp) {
      window.location.reload();
  });
}

function generateDeviceId(device, space) {
  axios.post('/generateDeviceId', {
      params: {
          userEmail: localStorage.getItem('email'),
          spaceName: space,
          deviceName: device
      } }, {
      headers: {
          authorization: localStorage.getItem('token')
      }
  }).then(function (resp) {
      generateQR(JSON.parse(resp.data).deviceToken);
      userDoc.devices.push({"deviceName": device, "spaceName": space, "_id": JSON.parse(resp.data).deviceToken});
      loadDevices();
  });
}

function loadSpaces() {
    axios.get('/getSpaces', {
        params: {
            email: localStorage.getItem('email')
        },
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        displayData(resp.request.response);
    }).catch(function (error) {
        console.log(error);
    });
}

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

function getSignedUrl(space, file, fileBytes) {
    axios.post('/sign-s3', {
        file: file.name
    }).then(function (resp) {
        console.log(resp);
        putS3Media(space, file, fileBytes, resp)
    }).catch(function (error) {
        loadMessage(false, "error uploading - try again")
    });
}

function putS3Media(space, file, fileBytes, resp) {
    axios.put(resp.data.signedUrl, file, {
        headers: {
          'Content-Type': file.type
        }
    }).then(function (resp) {
        console.log(resp);
    }).catch(function (error) {
        loadMessage(false, "error uploading - try again")
    });
}

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

function generateQR(deviceTokenJSON) {
  showPopover("QR Code<button class='qr-close-button' type='button' onclick='closePopover()'>X</button><br />");
  var qrCode = new QRCode(document.getElementById('popover'), deviceTokenJSON);
}

function showPopover(value) {
  document.getElementById('popover').innerHTML = value;
  document.getElementById('popover').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

function closePopover() {
  document.getElementById('popover').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

function loadMessage(success, message) {
    if (!success) document.getElementById("db-messages").style.backgroundColor = "#ff7f7f"

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


/*
 *
 * Sign up checking functions below
 *
 *
 */

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
