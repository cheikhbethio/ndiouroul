// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../model/user').user;

// expose this function to our app using module.exports
module.exports = function (passport) {


	// used to serialize the user for the session
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});


	passport.use('local-signup', new LocalStrategy({
		usernameField: 'login',
		passwordField: 'password',
		passReqToCallback: true
	},
		function (req, login, password, done) {

			process.nextTick(function () {

				User.findOne({'local.login': req.body.login}, function (err, user) {
					if (err)
						return done(err);
					if (user) {
						return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
					} else {
						var newUser = new User();

						newUser.local.email = req.body.email;
						newUser.local.login = req.body.login;
						newUser.local.password = newUser.generateHash(password);
						newUser.local.firstname = req.body.firstname;
						newUser.local.lastname = req.body.lastname;
						newUser.local.right = req.body.right;

						newUser.save(function (err) {
							if (err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			});
		}));

	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true // allows us to pass back the entire request to the callback
	},
		function (req, username, password, done) {
			User.findOne({'local.login': username}, function (err, user) {

				if (err)
					return done(err);
				// if (!user || user.local.status.code !== "451") {
				// 	return done(null, false);
				// }
				if (!user.validPassword(password))
					return done(null, false);
				return done(null, user);
			});
		}));

};
