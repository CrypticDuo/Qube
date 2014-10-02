var User = require('./user.js');
var ObjectId = require('mongodb').ObjectID;
var database = {
	createPlaylist : function(userID, pname){
		User.find(
			{
				oauthID: userID,
				playlist: {
					"$elemMatch":{
						name:pname
					}
				}
			}, function(err, user){
			if(err){
				// wrong with finding
				console.log(err);
			}
			console.log(user);
			// if user with the specified query doesn't exist
			if(user.length() == 0){
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
					},function(err,user){
					if(err){
						//updating fails
						console.log(err);
					}
					else{
                        console.log("adding new playlist ...");
					}
				});
			}
		});
	},
	listAllPlaylist : function(userID){
		User.find(
			{
				oauthID: userID
			}, function(err, user){
				if(err){
					console.log(err);
				}
				// if user with the specified query doesn't exist
				return user;
		});
	},
	addVideoToPlaylist : function(userID, pname, vid){
		User.update(
			{
				oauthID : 12345,
				"playlist.name":pname
			},
			{
				"$push" : {
					"playlist.$.videos" : vid
				}
			}, function(err, user){
				if(err){
					console.log(err);
				})
		});
};

module.exports = database;
