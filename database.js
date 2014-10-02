var User = require('./user.js');
var ObjectId = require('mongodb').ObjectID;
var database = {
	createPlaylist : function(userID, name){
		User.findById(userID).find(
			{
				_id: ObjectId(userID),
				"playlist.$.name": name
			}, function(err, result){
			if(err){
				// wrong with finding
				console.log(err);
			}
			// if user with the specified query doesn't exist
			if(!result.length){
				User.update(
					{
						_id: ObjectId(userID),
					},
					{
						"$push":
						{
							playlist: {
								name: name,
								videos: []
							}
						}
					},function(err,result){
					if(err){
						//updating fails
						console.log(err);
					}
				});
			}
		});
	}
};

module.exports = database;