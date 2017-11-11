let app = require('express')();
const secret = require('./secret');
const http = require('http');
let server = http.Server(app);
let io = require('socket.io')(server,{
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser').urlencoded({ extended: false });
let jwt = require('jwt-simple');

let mongoose = require('mongoose');
mongoose.promise = global.promise;
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {return val}
  if (port >= 0) {return port;}
  return false;
}
mongoose.connect(secret.mongodb,{useMongoClient: true})
// const Room = require('./SocketIO/Room').Room;
let roomList = {}

// TODO: 重写io连接函数
// TODO: 添加初次进入已存在房间时,读取房间信息功能


io.on('connection',(socket)=>{
  var socketInfo = {};
  socket.on('disconnect',()=>{
    if (socketInfo.room&&socketInfo.user) {
      let userArray = roomList[socketInfo.room];
      let [userName,userID] = socketInfo.user;
      let {user,room} = socketInfo;
      let userIndex = userArray.indexOf(socketInfo.user);
          userArray.splice(userIndex,1);
      socket.to(socketInfo.room).emit('user change',roomList[socketInfo.room])
    }
  })

  socket.on('join room',({rName,uName},cb)=>{
    socket.join(rName);
    let user = [uName,socket.id]
    if (!roomList[rName]) {
      roomList[rName] = [user]
    }else {
      roomList[rName].push(user)
    };
    socketInfo.user = user;
    socketInfo.room = rName;
    socket.to(rName).emit('user change',roomList[rName])
    cb(roomList[rName],socket.id)
  })

  socket.to(socketInfo.room).on('userSend',(msgobj)=>{
    if (socketInfo.room) {
      socket.broadcast.to(socketInfo.room).emit('receive',msgobj)
    }
  })
})

app.use(bodyParser);

app.set('jwtTokenSecret', '123456');

app.use(cookieParser());

let allower = ["http://catchfishbackend.chinacloudsites.cn","http://localhost:8080","http://catchfish.chinacloudsites.cn","http://antique-fu.com","http://www.antique-fu.com"];
let allowCrossDomain = function(req, res, next) {
    if (allower.indexOf(req.headers.origin)!=-1) {
      res.header('Access-Control-Allow-Origin',req.headers.origin);
    };
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials','true');
    next();
};
app.use(allowCrossDomain);

var User = require('./routes/user');
var Test = require('./routes/test');

app.use('/user',User);
app.use('/test',Test);

var port = normalizePort(process.env.PORT || '3000');
server.listen(port,()=>{
  console.log('app start');
})
