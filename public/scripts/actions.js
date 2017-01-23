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
    if(checkAll()) {
      axios.post('/signUp', {
          'username': email,
          'password': password,
          'name': name
      }).then((res) => {
          localStorage.setItem("token", res.data.token);
          window.location.href = "/database";

          console.log("Signup Complete");
          // get the JWT
          // set request header
          // make request

      }).catch((err) => {

          console.log(err);
          // alert the failure to the user
          console.log("Authentication Failed");
          document.getElementById("message").innerHTML = "Signup failed: " + err;
      })
    }

}

function getDB() {
  axios.get('/getSpaces').then(function(resp) {
    console.log("HERE");
    console.log(resp.request.response);
    displayData(resp.request.response);
  }).catch(function(error) {
    console.log(error);
  });
}


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
  window.location.href = "/";
}
