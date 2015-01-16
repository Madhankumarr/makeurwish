(function(){
	var app=angular.module('myapp',[]);
app.controller('logincontroller',function($http,$scope){

	this.credentials={
		userName:null,
		password:null
	};
    this.status=false;
  
    

	this.validUser=function(){
		 console.log("called");

         $http.post("/home", {
                 fname: this.credentials.userName,
                pass: this.credentials.password
            }).success(function (data, status, headers, config) {               
                 
                if(data.status=='true')
                { 
                    $scope.message=data.message;   
                    $scope.status=true;
                    document.forms.namedItem('loginForm').reset();   
                }
                else
                {
                    window.location ="/userhome";
                }
    
            }).error(function (data, status, headers, config) {

               $scope.message="Something went wrong. Please try again"; 
                console.log("error"+data);

                if(data.message=='true')
                {
                    $scope.status=true;
                    document.forms.namedItem('loginForm').reset();
                    console.log('Server error');

                }
    
            });
       	
	};

  document.getElementById

});
    
    
app.controller('homecontroller',function($scope,$http){

  $scope.status=false;
     
  this.submitForm=function() {

 var fd= new FormData(document.forms.namedItem("wishForm"));
    console.log(fd);


                  var name= document.getElementById('pic');
                 var alpha=name.files[0];
                console.log(alpha.name);
                 var fmdata= new FormData();
                 fmdata.append('file',alpha);

                 $http.post('http://makeurwish.tk/fileupload.php', fmdata, {
                        withCredentials: true,
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity,
                        enctype:'multipart/form-data'
                    }).success( function(mydata) {
                            console.log(mydata);
                                    $scope.message = mydata.status;
                                    $scope.status=true;

                                    fd.append('photopath',mydata.filename);
                                   if(mydata.upload==1) 
                                   {
                                        $http.post('upload', fd, {
                                            withCredentials: true,
                                            headers: {'Content-Type': undefined },
                                            transformRequest: angular.identity,
                                            enctype:'multipart/form-data'
                                        }).success( function(data) {
                                                console.log(data);
                                                        $scope.message = data.status;
                                                        $scope.status=true;

                                            })
                                           .error(function(data, status, headers, config) {
                                                console.log("error");
                                                 $scope.message = data.status;
                                                  $scope.status=true;
                                                 
                                      } );
                                    }

                                    document.forms.namedItem("wishForm").reset();
                                    images.innerHTML="";
                                    fileinfo.innerHTML="";
                    
                        })
                       .error(function(data, status, headers, config) {
                            console.log("error");
                             $scope.message = data;
                              $scope.status=true;
                              document.forms.namedItem("wishForm").reset();
                              images.innerHTML="";
                              fileinfo.innerHTML="";
                  } );

    
       
	
};

});

 app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);
 

 app.controller('SignupController',function($scope,$http){
     
     
       var emails=[];
       var friend=  document.getElementById('friend');
       $scope.buttonShow=true;
       var addUserButton="<input type='button' id='addUser' ng-click='signup.addUser()' style='margin-bottom:10px' value='Want your friends to wish?' class='btn btn-primary'/>";
      $scope.status=false;
     function validateEmail(email) { 
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
    } 
    function myKeyPress(e){

                var keynum;

                if(window.event){ // IE					
                    keynum = e.keyCode;
                }
                else
                    if(e.which){ // Netscape/Firefox/Opera					
                        keynum = e.which;
                     }
                return keynum;
     }
    function myTest(keynum,res)
    {
         
         if (keynum==32 && res==true)
        {
            return true;
        }
        else
          return false;
    }


  this.addUser=function() {
      $scope.buttonShow=false;
      friend.innerHTML="<h4>Friend's Mail Ids</h4><div id='emailbox' class='form-control' contenteditable='false' style='height:auto;min-height:34px'><div id='emailval'  contenteditable='true' placeholder='Friend&apos;s email' style='min-width: 10px;min-height: 10px;'></div></div>";
      $scope.status=false;
    var  mailbox=document.getElementById('emailbox');
    var emailval=document.getElementById('emailval');
    var test=false;
    var val="";
        emailval.addEventListener('keypress',function(event){
        val=emailval.innerText || emailval.textContent;
        console.log(val);
        test=validateEmail(val.trimLeft());
        console.log(test);
        if(myTest(myKeyPress(event),test)==true)
        {
            
            emails.push(val.trim().toLowerCase());
            block1=document.createElement('span');
            block2=document.createElement('span');
            block2.addEventListener('click',function(event)
             {
                var parent=event.target.parentElement;
                var grandParent=parent.parentElement;
                grandParent.removeChild(parent);
                console.log(parent.innerText);
                index= emails.indexOf(parent.textContent.trim());
                emails.splice(index,1);
                console.log(emails.length);


            });
            block1.setAttribute('contenteditable','false');
            block1.setAttribute('class','emailblock');
            block1.innerHTML=val;
            block2.setAttribute('class','emailclosemark');
            block3=document.createElement('span');
            block3.appendChild(block1);
            block3.appendChild(block2);
       
            mailbox.insertBefore(block3,emailval);
             emailval.innerHTML="";
            console.log(emails);
        }                              
      });    
  };

this.signupUser=function(){

     var emailval=document.getElementById('emailval');
     if(emailval!=null)
     {
          var val=emailval.innerText || emailval.textContent;
          if (validateEmail(val))
          {
            emails.push(val.trim().toLowerCase());
            console.log(emails);
          }
      }
    var fd= {
     email:this.email,
    celebName: this.celebName,
    celebEmail:this.celebEmail,
    date:this.date,
    occation:this.occation,
     emails:emails
    };
    console.log(fd);
       $http.post('signup', fd, {
    }).success( function(data) {
            console.log(data);  
        $scope.message =data.status;
        $scope.status=true;
        document.forms.namedItem("signUpForm").reset();
        friend.innerHTML="";   
        $scope.buttonShow=true;
        })
       .error(function(data, status, headers, config) {
            console.log("error");
             $scope.message = "Network Error. Please Try again later";
              $scope.status=true;

        } );
};
    
 });
    

})();