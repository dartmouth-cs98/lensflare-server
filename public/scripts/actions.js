var fadeInInterval;
var fadeOutInterval;

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
    console.log(spaceName);
    axios.post('/clearSpace', {
        params: {
            email: localStorage.getItem('email'),
            space: spaceName
        },
        headers: {
            authorization: localStorage.getItem('token')
        }
    }).then(function (resp) {
        window.location.reload();
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

function addItemTest() {
    axios.post('/saveItem', {
        email: localStorage.getItem('email'),
        url: "http://dartmouth.edu/sites/default/files/styles/header_image/public/2009-1035500133.jpg?itok=LlpoUNH9",
        space: "The MoMA"
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

function loadMockData() {
    var spaces = [{
        name: "The MoMA",
        items: [
            {
                title: "T-Rex",
                text: "The T-Rex is a scary beast, it will eat you up and gobble you whole, without a second thought for your wellbeing or happiness.",
                url: "https://lensflare-files.s3.amazonaws.com/icon_020517113218472.jpg"
            },
            {
                title: "Diplo",
                text: "The long neck giraffe beast is also pretty fucking scary but it's less terrifying that a T-Rex because it prob can't eat you whole or it would choke. It prob also only eats grass.",
                url: "https://lensflare-files.s3.amazonaws.com/icon_020517125514149.jpg"
            },
            {
                title: "Sphinx",
                text: "The Sphinx will ask you a very difficult riddle; if you are able to figure out the answer to the riddle then you can move on past her forboding glare and into the pyramid.",
                url: "https://lensflare-files.s3.amazonaws.com/icon_020517113213243.jpg"
            },
        ]
    },
        {
            name: "Dallas Museum of Art",
            items: [
                {
                    title: "Eminem",
                    text: "Marshall Bruce Mathers III, known professionally as Eminem, is an American rapper, record producer, and actor.",
                    url: "https://lensflare-files.s3.amazonaws.com/icon_020517113218472.jpg"
                },
                {
                    title: "Rihanna",
                    text: "Robyn Rihanna Fenty is a Barbadian singer and songwriter. Born in Saint Michael and raised in Bridgetown, she first entered the music industry by recording demo tapes under the direction of record producer Evan Rogers in 2003.",
                    url: "https://lensflare-files.s3.amazonaws.com/icon_020517125514149.jpg"
                },
                {
                    title: "Backstreet Boys",
                    text: "The Backstreet Boys are an American vocal group, formed in Orlando, Florida in 1993.",
                    url: "https://lensflare-files.s3.amazonaws.com/icon_020517113213243.jpg"
                },
            ]
        }
    ];
    var userDoc = {
        spaces: spaces,
        email: localStorage.getItem("email")
    }
    saveSpaces(userDoc);

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
