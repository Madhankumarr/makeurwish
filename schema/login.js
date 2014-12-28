var mongoose=require('mongoose');
module.exports=mongoose.model('login',{
username:String,
password:String,
wishid:String,
status:Number
});