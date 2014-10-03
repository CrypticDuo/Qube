var User = require('./user.js');
var ObjectId = require('mongodb').ObjectID;
var database = {
	createPlaylist : function(userID, pname, callback){
		User.find({
				oauthID: userID,
				playlist: {
					"$elemMatch":{
						name:pname
					}
				}
			}, function(err, result){
			if(err){
				console.log("ERROR : " + err);
				callback ({status:"Fail", msg:"User not found"});return;
			}
			console.log("RESULT : " + result);
			if(!result.length()){
				User.update(
					{
						oauthID: userID,
					},
					{
						"$push":
						{
							playlist: {
								name: pname,
								videos: []
							}
						}
					},function(err,result){
					if(err){
						console.log(err);
						callback({status:"Fail", msg:"Could not add playlist"});return;
					}
				});
				callback({status:"Success"});return;
			}
			else{
				callback({status:"Fail", msg:"Playlist already exists"});return;
			}
		});
	}
};

module.exports = database;
