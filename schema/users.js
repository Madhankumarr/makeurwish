var mongoose=require('mongoose');
module.exports=mongoose.model('users',{
wishid:String,
email:String,
celebName:String,
celebMail:String,
occation:String,
occdate:Date,
timeStamp:String,
friendsMail:Array,
status:String

});