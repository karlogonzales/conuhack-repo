var express	=	require("express");
var multer	=	require('multer');
var fs = require('fs');
var app	=	express();


var storage = multer.memoryStorage()
var upload = multer({ storage: storage }).single("userPhoto");


app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/photo',function(req,res){
	
	upload(req,res,function(err) {
		if(err) {
			return res.end("Error uploading file.");
		}
		console.log('Should be the buffer:', req.file.buffer)
		
		// send the buffer to claifai api to recognize
		



		res.end("File is uploaded");
	});
});

app.listen(3000,function(){
    console.log("Working on port 3000");
});
