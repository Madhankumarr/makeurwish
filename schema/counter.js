var mongoose=require('mongoose');
module.exports=mongoose.model('counter',{
counterid:String,
counterval:Number
});