# Lensflare Server

## About
The repo is the server component of the [Lensflare](https://github.com/dartmouth-cs98/lensflare-unityUI) project. It provides all of the front-end code for the user website along with all of the API calls needed both from the website and from the HoloLens.

Visit [lensflare.space](http://www.lensflare.space) to try it out!

##Usage
### Front-End
#### Sign up for an account
- This step is fairly straight forward - simply fill out the create account form and submit - the account is immediately created
![new account](https://github.com/dartmouth-cs98/lensflare-server/blob/master/newaccount.png)

#### Sign in
- Simply enter your account information to sign in
![sign in](https://github.com/dartmouth-cs98/lensflare-server/blob/master/login.png)

#### Add a space
- Click on “Spaces” in the sidebar and then click the plus sign to add a new space; enter a name and click the check mark to save it to the database

#### Remove a space
- Click on “Spaces” in the sidebar and then click the “x” next to the space you’d like to delete
![spaces](https://github.com/dartmouth-cs98/lensflare-server/blob/master/spaces.png)

#### Add a device
- Click on “Devices” in the sidebar and then click the plus sign to add a new device; enter a name and choose a space, then click the save button to save

#### Remove a device
- Click on “Devices” in the sidebar and then click the “x” next to the device you’d like to delete

#### Edit a device
- Click on “Devices” in the sidebar and then click the edit button next to the device you’d like to edit; enter a new name/space and click save
![devices](https://github.com/dartmouth-cs98/lensflare-server/blob/master/devices.png)

## Deployment
Deployed to Heroku app on each new push to master

## Code
The most up-to-date code resides on the master branch, which contains all of the front-end styling and scripts (in /public) along with all of the Node.js/Express.js work in the remaining folders.

## Architecture
- [Amazon S3](https://aws.amazon.com/s3/)
- [Node Express](http://expressjs.com/)
- [Heroku](http://heroku.com/)

## Libraries
- [QRCode.js](https://github.com/davidshimjs/qrcodejs)
- [three.js](https://threejs.org/)
- [Passport](http://passportjs.org/)
- [SweetAlert](http://t4t5.github.io/sweetalert/)
- [particles.js](https://github.com/VincentGarreau/particles.js/)

## Assets
- [Google Material Icons](https://material.io/icons/)
- [HoloLens press kit](https://news.microsoft.com/microsoft-hololens-press-materials/)

## Authors
- Nick Moolenijzer, Jeremy Mittleman, Rich Shen, Armin Mahban, Ellis Guo

## Acknowledgements
- Tim Tregubov, for constant advice and help on the project
- DALI Lab, for use of resources

## Sources, Useful Tutorials, etc.
Centering in CSS: A Complete Guide. (2014, September 2). Retrieved March 11, 2017, from https://css-tricks.com/centering-css-complete-guide/

Change HTML name element using JavaScript - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/9447439/change-html-name-element-using-javascript

chris. (n.d.-a). An Introduction to MongoDB. Retrieved March 11, 2017, from https://scotch.io/tutorials/an-introduction-to-mongodb

chris. (n.d.-b). Authenticate a Node.js API with JSON Web Tokens. Retrieved March 11, 2017, from https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

chris. (n.d.-c). Easy Node Authentication: Setup and Local. Retrieved March 11, 2017, from https://scotch.io/tutorials/easy-node-authentication-setup-and-local

CSS for Button Glow Effect on Hover. (2016, January 16). Retrieved March 11, 2017, from https://superdevresources.com/css-button-glow-effect/

Execute a javascript function by clicking on text - Real’s Javascript How-to. (n.d.). Retrieved March 11, 2017, from http://www.rgagnon.com/jsdetails/js-0069.html

Express FAQ. (n.d.-a). Retrieved March 11, 2017, from http://expressjs.com/en/starter/faq.html

Express FAQ. (n.d.-b). Retrieved March 11, 2017, from http://expressjs.com/en/starter/faq.html

Google Fonts. (n.d.). Retrieved March 11, 2017, from https://fonts.google.com/

How To Create an Alert Message Box. (n.d.). Retrieved March 11, 2017, from https://www.w3schools.com/howto/howto_js_alert.asp

html - How do you create a hidden div that doesn’t create a line break or horizontal space - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/1992114/how-do-you-create-a-hidden-div-that-doesnt-create-a-line-break-or-horizontal-sp

html - Make an image fill up the cell completely - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/26240707/make-an-image-fill-up-the-cell-completely

html - Styling an input type=“file” button - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/572768/styling-an-input-type-file-button

HTML DOM Input FileUpload files Property. (n.d.). Retrieved March 11, 2017, from https://www.w3schools.com/jsref/prop_fileupload_files.asp

HTML DOM Input FileUpload Object. (n.d.). Retrieved March 11, 2017, from https://www.w3schools.com/jsref/dom_obj_fileupload.asp

HTML DOM Table createTHead() Method. (n.d.). Retrieved March 11, 2017, from https://www.w3schools.com/jsref/met_table_createthead.asp

html5 - How to get byte array from input type file using javascript - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/22680695/how-to-get-byte-array-from-input-type-file-using-javascript

HW 5 p2. (n.d.). Retrieved March 11, 2017, from http://cs52.me/assignments/hw5p2/

javascript - Copy from textarea to div, preserving linebreaks - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/16165286/copy-from-textarea-to-div-preserving-linebreaks

javascript - How can I “dim” the rest of the web page when displaying a notification DIV? - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/9455556/how-can-i-dim-the-rest-of-the-web-page-when-displaying-a-notification-div

javascript - How to disable an input type=text? - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/2874688/how-to-disable-an-input-type-text

javascript - I can’t do a request that needs to set a header with axios - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/38123079/i-cant-do-a-request-that-needs-to-set-a-header-with-axios

javascript - setInterval with loop time - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/8421998/setinterval-with-loop-time

javascript - setTimeout in for-loop does not print consecutive values - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/5226285/settimeout-in-for-loop-does-not-print-consecutive-values

Jonathan, A. (2016, October 22). Express, Passport and JSON Web Token (jwt) Authentication for Beginners. Retrieved from https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/

mzabriskie/axios. (n.d.). Retrieved March 11, 2017, from https://github.com/mzabriskie/axios

node.js - How do I embed EJS code in static Javascript? - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/18413689/how-do-i-embed-ejs-code-in-static-javascript

Node.js Authentication using Passport.js | @RisingStack. (2016, May 24). Retrieved March 11, 2017, from http://blog.risingstack.com/node-hero-node-js-authentication-passport-js/

Passport. (n.d.). Retrieved March 11, 2017, from http://passportjs.org/docs

passport/express-4.x-local-example. (n.d.). Retrieved March 11, 2017, from https://github.com/passport/express-4.x-local-example

Removing input background colour for Chrome autocomplete? - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/2781549/removing-input-background-colour-for-chrome-autocomplete

themikenicholson/passport-jwt. (n.d.). Retrieved March 11, 2017, from https://github.com/themikenicholson/passport-jwt

thumbnails - Getting Image Dimensions using Javascript File API - Stack Overflow. (n.d.-a). Retrieved March 11, 2017, from http://stackoverflow.com/questions/7460272/getting-image-dimensions-using-javascript-file-api

thumbnails - Getting Image Dimensions using Javascript File API - Stack Overflow. (n.d.-b). Retrieved March 11, 2017, from http://stackoverflow.com/questions/7460272/getting-image-dimensions-using-javascript-file-api

What is the most efficient way to deep clone an object in JavaScript? - Stack Overflow. (n.d.). Retrieved March 11, 2017, from http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript

Wu, K. (2015, July 9). Client-side file upload to S3 using axios. Retrieved from https://medium.com/@kevinwu/client-side-file-upload-to-s3-using-axios-c9363ec7b530#.9t3jvr74x
