var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
      mongoose.promise = global.promise;
      db =mongoose.connection;

let dbstate = 'initiating'
db.on('error',function(){
  dbstate = 'error'
});
db.once('open',function(){;
  dbstate = 'ok'
})

router.get('/', function(req, res, next) {
  res.json({
    dbState:dbstate,
    serverState:'ok'
  })
});

module.exports = router;
