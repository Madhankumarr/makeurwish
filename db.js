var mongoose=require('mongoose');

function connectdb()
{
	mongoose.connect('mongodb://madhan:madan@ds053160.mongolab.com:53160/makeawish');
	console.log("Connected to Database");
	module.exports=mongoose.connection;

}
try
{
		connectdb();		
}
catch(err)
{
	console.log("Database connection error: "+err);
	console.log("Trying to reconnect..");
	
}
