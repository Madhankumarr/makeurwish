var mongoose=require('mongoose');
module.exports=mongoose.model('wishes',{
username:String,
name:String,
wishid:String,
wish:String,
photopath:String,
timeStamp:String
});