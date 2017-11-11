exports.Room = function (room,io) {
  
  // console.log(io.nameSpace);
  this.name = room.name;
  this.pwd = room.password;
  this.check ;
  this.online = 0;
  this.handleConnection=(socket,user)=>{
    this.online++;
    socket.on('disconnect',()=>{
      this.online--;
      console.log('disconnect',this.online);
    })
    console.log('connect:',this.online);
  };

  io.of('/'+this.name).on('connection',this.handleConnection)

};


exports.RoomList = {

}
