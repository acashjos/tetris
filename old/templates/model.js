
module.exports=function(name){
	return{
	
	destination: './server/models',
	filename: name+'.model.js',

	template: 

			 `

		var mongoose = require('mongoose'),

		    Schema = mongoose.Schema;

		var `+name+`Schema = new Schema({

		});
		/*
		`+name+`Schema.pre("save", function(next) { 
		    this.last_updated_on = new Date(); 
		    next(); 
		});
		*/

		`+name+`Schema.set('toJSON', {
		    getters: true,
		    virtuals: true
		});

		mongoose.model('`+name+`', `+name+`Schema);
		`
	}

}