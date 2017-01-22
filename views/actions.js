var axios = require('axios');

export function signIn() {
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    console.log("About to post with axios");
    axios.post('/jwt', {
        'email': email,
        'password': password
    }).then((res) => {
        console.log(res.token);
        // get the JWT
        // set request header
        // make request

    }).catch((err) => {

        // alert the failure to the user
        console.log("Authentication Failed: " + err);
    })

}


export function signUp({email, password}) {
    axios.post('/signUp', {
        'email': email,
        'password': password
    }).then((res) => {

        // get the JWT
        // set request header
        // make request

    }).catch((err) => {


        // alert the failure to the user
        console.log("Authentication Failed");
    })

}

