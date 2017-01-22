// var axios = require('axios');

function signIn() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    console.log("About to post with axios " + email + "  " + password );
    axios.post('/jwt', {
        'email': email,
        'password': password
    }).then((res) => {
        // console.log(res);
        console.log("Token is: " + res.data.token);
        // get the JWT
        // set request header
        // make request

    }).catch((err) => {

        // alert the failure to the user
        console.log("Authentication Failed: " + err);
    })

}

//
// function signUp({email, password}) {
//     axios.post('/signUp', {
//         'email': email,
//         'password': password
//     }).then((res) => {
//
//         // get the JWT
//         // set request header
//         // make request
//
//     }).catch((err) => {
//
//
//         // alert the failure to the user
//         console.log("Authentication Failed");
//     })
//
// }
//
