const express = require('express');
const secret = require('../secret');
const router = express.Router();
const User = require('../models/user.js');
const Inv = require('../models/invitation.js');
const jwt = require('jwt-simple');
const moment = require('moment');
router.post('/sign',function(req,res){
  console.log(req.body);
  let jsonStr = '';
  req.on('data',function(chunk){
    jsonStr+=chunk;
  });
  req.on('end',function(){
    let body = JSON.parse(jsonStr);
    if (body) {
      let {type,username,password} = body;
      if (type==='signUp') {//登录
        User.findOne({username:username},function(err,user){
          if (err) {
            res.json({state:0,text:'$errFindUser'})
            return
          }
          if (!user) {
            res.json({state:0,text:"$noUser"})
          }else {
            if (user.checkPwd(password)) {
              let expires = moment().add(7,'days').valueOf();
              let token = jwt.encode({
                iss:user.username,
                exp:expires,
              },secret.jwtTokenSecret)
              res.json({state:1,text:'ok',main:user,token:token}) //登录成功
            }else {
              res.json({state:0,text:'$errPwd'})
            }
          }
        })
    } else if(type==='signIn'){                //注册
        User.findOne({username:username},(err,user)=>{
          if (!user&&!err) {
            let invCode = body.invitation;
            Inv.findOne({body:invCode},(err,$inv)=>{
              if (!err&&$inv) {
                if (!$inv.used.check) {
                  let nu = new User({
                    username:username,
                    password:password
                  })
                  nu.save(err=>{
                    if (err) {
                      res.json({state:0,text:'$errSaveUser'})
                    }else {
                      $inv.usedBy(nu.username);
                      $inv.save(err=>{
                        if (!err) {
                          let expires = moment().add(7,'days').valueOf();
                          let token = jwt.encode({
                            iss:nu.username,
                            exp:expires,
                          },'123456')
                          res.json({state:1,main:nu,token:token})
                        }else {
                          res.json({state:0,text:'$errSaveInvCode'})
                        }
                      })
                    }
                  })
                }else {
                  res.json({state:0,text:"$invCodeOccupied"})
                }
              }else {
                res.json({staet:0,text:'$errInvCode'})
              }
            })
          }else {
            console.log(user,err);
            res.json({state:0,text:'$userOccupied'})
          }
        })
      }
    }else {
      res.json({state:0,text:'$noJson'})
    }
  })
})
module.exports = router;
