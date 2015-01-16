var mongoose=require('mongoose');
module.exports=mongoose.model('files',{
wishid:String,
fileName:String,
content:String,
route:String,
timeStamp:String
});