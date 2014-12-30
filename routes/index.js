var express = require('express');
var router = express.Router();
var loginSchema=require('../schema/login');
var usersSchema=require('../schema/users');
var counterSchema=require('../schema/counter');
var wishesSchema=require('../schema/wishes');
var mailUtil=require('./sendMail');
var session=require('express-session');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Make ur wish' });
});


router.get('/mylogin',function(req,res){

  res.render('login.html', { title: 'Make ur wish | Home' });

});


router.get('/userhome',function(req,res){
    if(req.session.username!=undefined && req.session.password!=undefined)
    {
      res.render('home.html');
    }
    else
    {
      res.render('login.html');
    }

});



router.get('/wishes',function(req,res){

  res.render('wishes.html', { title: 'Make a wish' });

});


/** Login success route **/

router.post('/home',function(req,res,next){

loginSchema.find({username:req.body.fname,
          password:req.body.pass}).exec(function(err,login){

            if(err || login.length<=0){

              console.log('Invalid User'+err);
              console.log(req.body.fname +" "+req.body.pass);
              res.json({message:'Invalid Email or Password',status:'true'});

            }
            else if(login)
            {
              if(login[0].status==1)
              {
                console.log("user already wished!");
                res.json({message:'You made a wish already',status:'true'});
              }
              else
              {
               console.log(req.body.fname +" "+req.body.pass);
               req.session.username=req.body.fname;
               req.session.password=req.body.pass;
               req.session.wishid=login[0].wishid;
               console.log(req.session.username +" "+req.session.password+" "+login[0].wishid);
               res.contentType('application/html');
               res.redirect('/userhome');
             }
               
            }
          });


});


/** Upload user wishes route **/

router.post('/upload', function (req, res){

if(req.session.username!=undefined && req.session.password!=undefined)
{
          var form = new formidable.IncomingForm(); 
          var myfields={};
          var file_name="default.jpg";

          
           

          form.parse(req, function(err, fields, files) {

            myfields.fname=fields.fname;
            myfields.wish=fields.wish;
            console.log(myfields);
            console.log(typeof myfields);
            res.json({'status':'Your post uploaded'});
             
          });
           
          

          form.on('end', function(fields, files) {


            try
            {

              if(this.openedFiles[0].name!=undefined && this.openedFiles[0].name!='')
                {
                    var temp_path = this.openedFiles[0].path;
                  /* The file name of the uploaded file */
                   file_name =req.session.wishid+this.openedFiles[0].name;
                   console.log(this.openedFiles[0].name);
                  /* Location where we want to copy the uploaded file */
                  var new_location = 'uploads/';
                 /* Temporary location of our uploaded file */
                  fs.copy(temp_path, new_location + file_name, function(err) {  
                    if (err) {
                      console.error(err);

                    } else {
                      console.log("Upload success!");
                    }
                  });

               }
               else
               {
               console.log('no foto to upload');
             }


             var record=new wishesSchema({
                  username:req.session.username,
                  name:myfields.fname,
                  wishid:req.session.wishid,
                  wish:myfields.wish,
                  photopath:file_name
            });



          record.save(function(err){
                                  if(err){
                                        console.log("error in saving user wishes to db "+err);
                                        res.status(500).json({status:'Error in upload. Please try again later'});
                                   }
                                 else{ 
                                
                                      console.log("User wish added to db "+req.session.username);

                       }});




           loginSchema.findOneAndUpdate({wishid:req.session.wishid,username:req.session.username,status:0},{status:1}, function(err,user){

                    if(err || user.length<=0){

                        console.log("No user found for loginSchema update"+err);
                      }
                      else if(user)
                      {
                          console.log("User Login Schema status updated"+user);
                       
                      }

                });

 
            }
            catch(err)
            {

              console.log('Error in upload '+err);
              res.json({'status':'Error in upload. Please try again later'});
              
            }
            
           
          });
      
      }
      else
      {

        console.log('No credentials in the session object!');
        res.json({'status':'Session Expired'});
      }
});


/** SignUp route **/
router.post('/signup', function (req, res){
    
    try
    {
     var mycounter={};
     occationdt=req.body.date;
     console.log(occationdt);
     var randomnumber=Math.floor(Math.random()*5001);

     counterSchema.find({counterid:'wishid'}).exec(function(err,counter){

            if(err){
              console.log(err);
            }
            else if(counter)
            {
               mycounter=counter;
              
              console.log("counter val"+counter+mycounter);

                            var record=new usersSchema({
                             wishid:mycounter[0].counterval, 
                             email: req.body.email,
                             celebName:req.body.celebName,
                             celebMail:req.body.celebEmail,
                             occation: req.body.occation,
                             occdate:new Date(req.body.date) ,
                             timeStamp: Date.now(),
                             friendsMail:req.body.emails,
                             status:"created"
                          });

                           var userrec1=new loginSchema({
                                     wishid:mycounter[0].counterval, 
                                     username: req.body.email,
                                     password:randomnumber.toString()+mycounter[0].counterval,
                                     status:0 });

                          var mailOption1={
                            from:'MakeUrWish<admin@makeawish.com>',
                            to: req.body.email,
                            subject:"MakeUrWish - "+req.body.celebName+" - "+req.body.occation,
                            html:"<!DOCTYPE html><html><div style='color:white; font-family: calibri; font-style: italic;'><div style='background: rgb(1, 30, 54);border: 1px solid black; padding:25px;'><h2 style='font-family:'Trebuchet MS';text-align: center;font-size: 35px; border-bottom:1px solid white; font-style: italic'>Make Ur Wish</h2><br/>A Warm greetings from MakeUrWish,<br/><div style=' margin-left: 30px;'>"+"<br/>Your password:<b><i> "+randomnumber.toString()+mycounter[0].counterval+"<br/><a href='http://makeurwish.herokuapp.com/mylogin'><span  class='btn btn-primary'>Click here</span></a> to wish "+req.body.celebName+"</i></b></div></div></div><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css'><link href='http://fonts.googleapis.com/css?family=Great+Vibes' rel='stylesheet' type='text/css'></html>"
                          };

                          var mail1=mailUtil(mailOption1);
                              record.save(function(err){
                              if(err){
                                  console.log(err);
                                  res.status(500).json({status:'Server Error. Please try again later'});
                              }
                              else{ 
                                     userrec1.save(function(err){
                                  if(err){
                                        console.log("error in creating user account "+err);
                                        res.status(500).json({status:'Server Error. Please try again later'});
                                   }
                                 else{                              
                                      console.log("user id created "+req.body.email);
                                  }});
                                    mail1.sendMail();
                                   console.log("saved "+req.body.email);
                              }});                    
                          length=req.body.emails.length;
                          for(i=0;i<length;i++)
                          {

                                     randomnumber=Math.floor(Math.random()*5001);
                                      var userrec=new loginSchema({
                                     wishid:mycounter[0].counterval, 
                                     username: req.body.emails[i],
                                     password:randomnumber.toString()+mycounter[0].counterval,
                                     status:0 });


                                  var mailOption1={
                                    from:'MakeUrWish<admin@makeawish.com>',
                                    to: req.body.emails[i],
                                    subject:"MakeUrWish -"+req.body.celebName+" - "+req.body.occation,
                                    html:"<!DOCTYPE html><html><div style='color:#FFF; font-family: calibri; font-style: italic;'><div style='background: rgb(1, 30, 54);border: 1px solid black; padding:25px;'><h2 style='font-family:'Trebuchet MS'; text-align:center;font-size: 35px; border-bottom:1px solid white; font-style: initial'>Make Ur Wish</h2><br/>A Warm greetings from MakeUrWish,<br/><div style=' margin-left: 30px;'>"+"<br/>Your password:<b><i> "+randomnumber.toString()+mycounter[0].counterval+"<br/><a href='http://makeurwish.herokuapp.com/mylogin'><span  class='btn btn-primary'>Click here</span></a> to wish "+req.body.celebName+"</i></b></div></div></div><link rel='stylesheet' href='http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css'><link href='http://fonts.googleapis.com/css?family=Great+Vibes' rel='stylesheet' type='text/css'></html>"};

                                  var mail2=mailUtil(mailOption1);
                                             userrec.save(function(err){
                                              if(err){
                                                    console.log("error in creating user account "+err);
                                                    res.status(500).json({status:'Server Error. Please try again later'});
                                               }
                                             else{                                           
                                                  console.log("user id created "+req.body.emails[i]);
                                              }});                          
                                               mail2.sendMail();
                                               console.log("saved "+req.body.emails[i]);
                                        
                            }
                           
                           counterSchema.findOneAndUpdate({counterid:'wishid'},{counterval:mycounter[0].counterval+1},

                            function(err,counter){

                              if(err)
                              {
                                console.log("counter update err "+err);
                              }
                              else
                              {
                                console.log('Counter update'+counter);
                              }
                            });


                        res.json({status:'To wish '+req.body.celebName+' click the link sent to your mail',counter:mycounter});
                         
            }
          });
    
            
    }
    catch(err)
    {
      res.json({status:'Server Error. Please try again later'});
      console.log(err);
    }
    
});

/** Scheduling code - Creating html files and routes for the wishes added on the day **/
try
{

                var schedule = require('node-schedule');
                var rule = new schedule.RecurrenceRule();
                rule.minute =40;
                

                var j = schedule.scheduleJob(rule, function(){
                    console.log('Scheduling started for '+Date.now());

                     var datenow=new Date(Date.now());
                      datenow.setHours(18,31,0,0);
                      console.log(datenow);
                     usersSchema.find({status:'created'}).exec(function(err,users){
                      if(err)
                      {
                        console.log("error searching occation date");

                      }
                      else if(users.length >0)
                        {


                          var mailSender=function(user,mails,link){
                               try{
                                     var mailOption1={
                                              from:'MakeUrWish<admin@makeawish.com>',
                                              to: mails.toString(),
                                              subject:"Greetings- makeurwish.com",
                                              html:"<!DOCTYPE html><html><div style='color:white; font-family: calibri; font-style: italic;'><div style='background: rgb(1, 30, 54);border: 1px solid black; padding:25px;'><h2 style='font-family:'Trebuchet MS';text-align: center;font-size: 35px; border-bottom:1px solid white; font-style: italic'>Make Ur Wish</h2>Hi "+user.celebName+","+"<br/><b>A warm greetings from MakeUrWish,</b><br/><span class='content'> Take a look at special wishes of your friends for you. <br/><a href='http://makeurwish.herokuapp.com/"+link+"'><span  class='btn btn-primary'>Click Here</span></a><span></div></div></html>"
                                            };
                                        mailUtil(mailOption1).sendMail();
                                      }
                                    catch(err)
                                    {
                                      console.log('Exception in sending mail '+err);
                                    }


                                   };



                          /**file writing**/
                          var fileCreator=function(nameAssigned,template1){


                                randomnumber=Math.floor(Math.random()*8001);
                                link=randomnumber.toString()+nameAssigned;
                                           fs.writeFile("views/"+link+".html", template1, function(err) {

                                          

                                              console.log("In write file function for "+link);
                                              if(err) {
                                                        console.log("Error in Writing file "+link+" "+err);
                                                      } 
                                              else {
                                                     
                                                      
                                                       console.log("The file was saved!-wishid-"+nameAssigned+"-route-"+link);
                                                      router.get('/'+link,function(req,res){
                                                               res.render(link+".html", { title: 'test' });
                                                        });

                                                       usersSchema.findOneAndUpdate({wishid:nameAssigned,status:'created'},{status:'updated'},

                                                        function(err,user){

                                                          if(err || user==null)
                                                          {
                                                            console.log("User schema update ERROR after route creation"+err);

                                                          }
                                                          else if(user!=null)
                                                          {
                                                            console.log('User schema updated after route creation'+user);

                                                           /**  var emails=[];
                                                             emails.push(user.email);
                                                             emails.concat(user.friendsMail);
                                                             mailSender(user,emails,link); **/

                                                             mailOption={

                                                                from:'MakeUrWish<admin@makeawish.com>',
                                                                to: "catchmemadhan93@gmail.com",
                                                                subject:"Greetings- makeurwish.com",
                                                                html:"<!DOCTYPE html><html><div style='color:white; font-family: calibri; font-style: italic;'><div style='background: rgb(1, 30, 54);border: 1px solid black; padding:25px;'><h2 style='font-family:'Trebuchet MS';text-align: center;font-size: 35px; border-bottom:1px solid white; font-style: italic'>Make Ur Wish</h2>Hi "+user.celebName+","+"<br/><b>A warm greetings from MakeUrWish,</b><br/><span class='content'> Take a look at special wishes of your friends for you. <br/><a href='http://makeurwish.herokuapp.com/"+link+"'><span  class='btn btn-primary'>Click Here</span></a><span></div></div></html>"

                                                             }
                                                             mailUtil(mailOption).sendMail();



                                                        }});


                                                   }
                                             }); 


                                         };

                         var wishCreator=function(userwishid,template1){
                             wishesSchema.find({wishid:userwishid}).exec(function(err,wishes){

                              if(err)
                              {
                                console.log("Error in retreiving wishes for "+userwishid);
                              }
                              else(wishes)
                              {

                                        console.log("Wishes:"+wishes);
                                        var photos={};
                                        var counter=1;

                                        for(wish in wishes)
                                        {
                                              
                                              template1=template1+"<section class='section static image"+counter+"'><div class='container'> <h1>"
                                              template1=template1+wishes[wish].name+"</h1></div></section><section class='section detail'><div class='container'> <p>"+wishes[wish].wish+"</p></div></section>";
                                              photos[counter]=wishes[wish].photopath;
                                              counter++;

                                        }
                                        template1=template1+"</body><script src='/javascripts/fallingsnow_v6.js'></script><style>";
                                        counter=1;
                                        for(x in photos)
                                        {
                                           template1=template1+".section.static.image"+counter+"{background-image:url('"+photos[x]+"');}";
                                           counter++;
                                        }
                                         template1+="</style></html>";

                                          fileCreator(userwishid,template1);
                                      
                                      
                              }

                           });


                           };
                             
                       for(user in users)
                          {
                           var template1="<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'><title>Make a Wish</title><style></style><link rel='stylesheet' href='/stylesheets/theme.css'></link> </head><body><div id='snowflakeContainer'><p class='snowflake'>*</p></div><div class='heading'><h1>Happy birthday "+users[user].celebName+"</h1></div>";
                           wishCreator(users[user].wishid,template1); 
                         }
                        }
                        else
                        {
                          console.log("No users to show! No file added to server! Date-"+(new Date(Date.now())));
                        }
                     });
                });
}
catch(err)
{

  console.log("Exception in scheduling "+err);
}

module.exports = router;
