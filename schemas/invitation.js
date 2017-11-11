const mongoose = require('mongoose');

function getSalt(l){
  let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let salt = ''
  while (salt.length<l) {
    salt+=$chars.charAt(Math.floor(Math.random()*$chars.length))
  }
  return salt
};
let InvitationSchema = new mongoose.Schema(
  {
    body:{
      type:String,
      default:getSalt(6)
    },
    creator:String,
    used:{
      check:{type:Boolean,default:false},
      by:{type:String,default:''}
    }
  }
)

InvitationSchema.methods.usedBy = function(user){
  this.used.check = true;
  this.used.by = user;
  return user;
}
InvitationSchema.methods.deActive = function(){
  this.used.check = false;
  this.used.by = '';
  return user;
}
module.exports = InvitationSchema;
