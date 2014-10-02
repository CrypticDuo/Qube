var User = require('./user.js');
var ObjectId = require('mongodb').ObjectID;
var database = {
	createPlaylist : function(userID, pname){
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
				return {status:"Fail", msg:"User not found"};
			}
			console.log("RESULT : " + result);
			if(!result.length){
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
						return {status:"Fail", msg:"Could not add playlist"};
					}
				});
				return {status:"Success"};
			}
			else{
				return {status:"Fail", msg:"Playlist already exists"};
			}
		});
	}
};

module.exports = database;
