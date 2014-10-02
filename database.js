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
				// wrong with finding
				console.log("ERROR : " + err);
			}
			console.log("RESULT : " + result);
			// if user with the specified query doesn't exist
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
						//updating fails
						console.log(err);
					}
					else{
                        console.log("***** ADDED A PLAYLIST *****");
					}
				});
			}
		});
	}
};

module.exports = database;
