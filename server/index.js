//////////////////////////////////////////////////////////
// 					INITIAL IMPORTS					   //
////////////////////////////////////////////////////////
const Auth0Strategy 	= require('passport-auth0'),
		  bodyParser 	  	= require('body-parser'),
  		passport 	    	= require('passport'),
  		session 	     	= require('express-session'),
  		massive	    		= require('massive'),
  		express     	 	= require('express'),
  		config 	    		= require('../config')
  		cors		       	= require('cors'),
  		port 		       	= 3001,
  		app		 	       	= express();

// Controllers
const typeIndustryController = require('./controllers/typeIndustryController');
const jobPostingsController = require('./controllers/jobPostingsController');
const resumesController	= require('./controllers/resumesController');

// APP SETUP
app.use(bodyParser.json());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
}));
app.use(cors());
app.use(express.static(`${__dirname}/../public/`));
app.use(passport.initialize())
app.use(passport.session())

//INITIALIZE POSTGRES TABLES
massive(config.massiveUrl)
	.then(db => {
		app.set('db', db);

		db.init_tables.schema_create_seed().then(res => {
			console.log('schema create tables')
			// db.init_tables.schema_row_seed().then(res => {
				// console.log('schema insert dummy rows');
        // db.init_tables.schema_job_postings_seed().then(res => {
          // console.log('inserted job postings')
        // }).catch(err => console.log(err));
			// }).catch(err => console.log(err));
		}).catch(err => console.log(err));
	}).catch(err => console.log(err));


///////////////////////////////////////////////////////////
// 						PASSPORT 	Employee-Side                  	//
/////////////////////////////////////////////////////////
let user_id;
passport.use('employee', new Auth0Strategy({
  domain: config.domain,
  clientID: config.clientId1,
  clientSecret: config.clientSecret1,
  callbackURL: 'http://165.227.99.251:3001/auth/callback1'
}, function(accessToken, refreshToken, extraParams, profile, done) {
  //GO TO DB TO FIND AND CREATE USER
  console.log(profile)
  let db = app.get('db')
  ,email = profile.emails[0].value
  ,first_name = profile.name.givenName
	,last_name = profile.name.familyName
  ,picture = profile.picture
	,auth_id = profile.id
	,user_name = profile.nickname
	// console.log('profile', profile)
  db.users.get_user(auth_id).then(res=> {
    if(!res.length){
        db.users.create_user([first_name, last_name, email, picture, auth_id, user_name])
        .then((userCreated) => {
          console.log('Logged in user: ',userCreated)
              return done(null, userCreated[0])
            }).catch( (e) => console.log(e))
      } else {
        return done(null, res[0]);
      }
    }).catch( err => console.log( err )) // GOES TO SERIALIZE-USER WHEN U INVOKE DONE
}));

app.get('/auth/1', passport.authenticate('employee'))
app.get('/auth/callback1', passport.authenticate('employee', {successRedirect: `http://165.227.99.251:3001/#/app/user/`}))

passport.serializeUser(function(profileToSession, done) {
	// console.log('serialize-user-employee', profileToSession)
  done(null, profileToSession); // PUTS 2ND ARGUMENT ON SESSION
});

passport.deserializeUser(function(profileFromSession, done) {
	// console.log('deserialize-user-employee', profileFromSession)
  done(null, profileFromSession); //PUTS 2ND ARGUMENT ON REQ.USER
});
app.get('/api/userInfo', function(req,res){
    res.send(req.user)
})


///////////////////////////////////////////////////////////
// 						PASSPORT  Employer-side                 	//
/////////////////////////////////////////////////////////
passport.use('employer',new Auth0Strategy({
  domain: config.domain,
  clientID: config.clientId2,
  clientSecret: config.clientSecret2,
  callbackURL: 'http://165.227.99.251:3001/auth/callback2'
}, function(accessToken, refreshToken, extraParams, profile, done) {
  //GO TO DB TO FIND AND CREATE USER
	console.log('profile', profile)
  let db = app.get('db')
	,email = profile.emails[0].value
  ,name = profile.displayName
  ,picture = profile.picture
	,auth_id = profile.id
	,user_name = profile.nickname
  db.companies.get_company(auth_id).then(res=> {
    if(!res.length){
        db.companies.create_company([name, email, picture, auth_id, user_name])
        .then((userCreated) => {
          console.log('Logged in user: ',userCreated)
              return done(null, userCreated[0])
            }).catch( (e) => console.log(e))
      } else {
        return done(null, res[0]);
      }
    }).catch( err => console.log( err )) // GOES TO SERIALIZE-USER WHEN U INVOKE DONE
}));

app.get('/auth/2', passport.authenticate('employer'))
app.get('/auth/callback2', passport.authenticate('employer', {successRedirect: 'http://165.227.99.251:3001/#/app/company/'}))

passport.serializeUser(function(profileToSession, done) {
	console.log('serialize-user', profileToSession)
  done(null, profileToSession); // PUTS 2ND ARGUMENT ON SESSION
});

passport.deserializeUser(function(profileFromSession, done) {
	console.log('deserialize-user', profileFromSession)
  done(null, profileFromSession); //PUTS 2ND ARGUMENT ON REQ.USER
});
app.get('/api/companyInfo', function(req,res){
    res.send(req.user)
})
///////////////////////////////////////////////////////////
//				LOG OUT                                       //
/////////////////////////////////////////////////////////
app.get('/auth/logout', function (req, res) {
    req.logout();
    res.redirect ('http://165.227.99.251:3001') // change this to the sign in route
})
///////////////////////////////////////////////////////////
//				APPLICATION ENDPOINTS                         //
/////////////////////////////////////////////////////////
app.get('/api/industries', typeIndustryController.getAllIndustries)
app.get('/api/users/:user_id', resumesController.getUserInformation)
app.get('/api/jobtypes', typeIndustryController.getAllJobTypes);
app.get('/api/job_postings', jobPostingsController.getAllJobPostings);
app.get('/api/company/:company_id', jobPostingsController.getCompanyInfo);
app.get('/api/:company_id/job_postings', jobPostingsController.getAllCompanyJobPostings);
app.get('/api/:company_id/posts/:job_post_id', jobPostingsController.getCompanyJobPostById);
app.get('/api/:user_id/saved_jobs', jobPostingsController.getSavedJobPostingsByUser);
app.get('/api/:user_id/resume', resumesController.getResumeByUser)
app.get('/api/job_postings/:job_post_id/resumes', jobPostingsController.getBlindResumesByJobPostId);
app.get('/api/job_postings/:job_post_id/shortlist', jobPostingsController.getBlindResumesByJobPostIdShortlist);
app.get('/api/job_postings/:job_post_id', jobPostingsController.getJobPostById);
app.get('/api/job_postings/:job_post_id/candidates', jobPostingsController.getSelectedCandidatesByJobPostId);

app.post('/api/:user_id/resume/new', resumesController.createResume);
app.post('/api/:resume_id/education/new', resumesController.createResumeEducation)
app.post('/api/:resume_id/experience/new', resumesController.createResumeExperience)
app.post('/api/:resume_id/skill/new', resumesController.createResumeSkill);
app.post('/api/:company_id/job_post/new', jobPostingsController.createNewJobPost)
app.post('/api/:job_post_id/:user_id/submit', resumesController.createSubmittedResume)

app.patch('/api/education/:education_id', resumesController.updateResumeEducation);
app.patch('/api/experience/:experience_id', resumesController.updateResumeWorkExperience);
app.patch('/api/:job_post_id/:resume_id/shortlist', jobPostingsController.updateResumeToShortlist)
app.patch('/api/:job_post_id/:resume_id/interview', jobPostingsController.updateResumeToInterview)
app.patch('/api/:user_id/resume/demographics', resumesController.updateResumeDemographics)

app.delete('/api/education/:education_id', resumesController.deleteResumeEducation);
app.delete('/api/experience/:experience_id', resumesController.deleteResumeExperience);
app.delete('/api/skill/:skill_id', resumesController.deleteResumeSkill);
app.delete('/api/:job_post_id/:resume_id', jobPostingsController.deleteSubmittedResume)



//PORT
app.listen(port, () => console.log(`Listening on port ${port}`))
