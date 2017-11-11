const mongoose = require('mongoose');
let InvitationSchema = require('../schemas/invitation');
let Invitation = mongoose.model('Inv',InvitationSchema);
module.exports = Invitation;
