/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/
/*Nodejs API\config\express-config.js */
class ExpressConfig{
	
	constructor(app){
		// Setting .html as the default template extension
		app.set('view engine', 'html');

		//Files 
		app.use(require('express').static(require('path').join('public')));
	}
}
module.exports = ExpressConfig;
