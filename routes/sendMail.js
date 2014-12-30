var nodemailer=require('nodemailer');
var smtpTransport=nodemailer.createTransport({
service:"gmail",
auth:{
user:"cherrybrowncabs@gmail.com",
pass:"cherrycabs"
}
});
module.exports=function(info)
{

  try
  {
  var mailOptions={
  		from:null,
  		to:null,
  		subject:null,
  		text:null,
  		html:null

  };
  for(var prop in mailOptions)
  {
  	if(mailOptions[prop]!='undefined')
  	{
  		mailOptions[prop]=info[prop];

  	}
  } 
  var functions={
  		getInfo:function(){
  			return mailOptions; 
  		},
  		sendMail:function()
  		{
  			setTimeout(smtpTransport.sendMail(mailOptions,function(error,res)
  				{
  					if(error){
  						console.log("Error sending mail "+info.to+' '+error);
  						return({status:'failure'});

  					}
  					else
  					{
  						console.log("Mail sent: "+info.to);
  						return({status:'success'});
  					}
  				}),2000);
  		}

  };

  return functions;
}
catch(err)
{

  console.log('Error in sendMail module '+err);
}

}