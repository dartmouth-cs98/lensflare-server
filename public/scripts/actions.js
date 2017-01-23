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
    if(checkAll()) {
      axios.post('/signUp', {
          'username': email,
          'password': password,
          'name': name
      }).then((res) => {

          window.location.href = "/";

          console.log("Signup Complete");

      }).catch((err) => {

          console.log(err);
          // alert the failure to the user
          console.log("Authentication Failed");
          document.getElementById("message").innerHTML = "Signup failed: " + err;
      })
    }

}

function loadSpaces() {
  console.log(localStorage.getItem("email"))
  axios.get('/getSpaces', { params: { email: localStorage.getItem("email") } }).then(function(resp) {
    console.log(resp.request.response)
    displayData(resp.request.response);
  }).catch(function(error) {
    console.log(error);
  });
}

function saveSpaces(userDoc) {
  axios.post('/saveSpaces', userDoc).then(function(resp) {
    console.log("Data saved");
  }).catch(function(error) {
    console.log(error);
  });
}

function loadMockData() {

  var spaces = [{
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
  var userDoc = {
    spaces: spaces,
    email: localStorage.getItem("email")
  }
  axios.post('/saveSpaces', userDoc).then(function(resp) {
    console.log("Data saved");
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
  localStorage.removeItem('email');
  window.location.href = "/";
}
