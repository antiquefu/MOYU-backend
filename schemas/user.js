const mongoose = require('mongoose');
const crypto = require('crypto');
function getSalt(){
  let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let salt = ''
  while (salt.length<32) {
    salt+=$chars.charAt(Math.floor(Math.random()*$chars.length))
  }
  return salt
};

function getSecret(pwd,salt){
  let saltPwd=pwd+':'+salt;
  return crypto.createHash('md5').update(saltPwd).digest('hex')
}
// meta =>元信息，  无法获取，无法更改
// info =>用户信息，可以获取，可以更改
// prop =>用户属性，可以获取，无法更改
// 常用信息不分类



let UserSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true,
    set:function(pwd){
      return crypto.createHash('md5').update(pwd+':'+this.meta.salt).digest('hex')
    },
  },
  info:{
    nickname:String,
    avatar:String,
    email:String,
  },
  prop:{
    level:{
      type:Number,
      default:1
    },
    exp:{
      type:Array,
      default:[0,1]
    }
  },
  meta:{
    createAt:{
      type:Date,
      default:Date.now()
    },
    level:{
      type:Number,
      default:1
    },
    salt:{
      type:String,
      default:getSalt()
    },
    authority:{
      type:Number,
      default:0
    }
  },
});

UserSchema.methods.gainExp=function(num){
  this.prop.exp[0]+=num;
  while (this.prop.exp[0]>=this.prop.exp[1]) {
    this.prop.exp[0]-=this.prop.exp[1];
    this.prop.exp[1]*=2;
    this.prop.level+=1;
  }
  // console.log('gainexp');
  return this
};

UserSchema.methods.getInfo = function(){
  return {
    username:this.username,
    password:this.password,
    info:this.info,
    prop:this.prop
  }
},

UserSchema.methods.checkPwd = function(p){
  let saved = this.password
  return saved === getSecret(p,this.meta.salt)
};

UserSchema.statics ={
  findID:function(id,cb){
    return this.findOne({_id:id}).exec(cb)
  },
  findName:function(name,cb){
    return this.findOne({signname:name}).exec(cb)
  }
};

module.exports = UserSchema
