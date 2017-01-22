function signIn() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    console.log("About to post with axios " + email + "  " + password);
    axios.post('/jwt', {
        'email': email,
        'password': password
    }).then((res) => {
        // console.log(res);

        // console.log("Token is: " + res.data.token);
        localStorage.setItem("token", res.data.token);
        window.location.href = "/database";


        // get the JWT
        // set request header
        // make request

    }).catch((err) => {

        // alert the failure to the user
        console.log("Authentication Failed: " + err);
    })

}

//
function signUp() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("pass1").value
    console.log(name + " " + email + " " + password);
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
    })

}


