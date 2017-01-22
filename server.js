var express	=	require("express");
var multer	=	require('multer');
var fs = require('fs');

var app	=	express();

var Clarifai = require('clarifai');
var clarifai_app = new Clarifai.App(
    'CrJS4jQSyV6qWixZuShUq8zLOwrIIz2yFDex87jV',
    '5QxnJDzgJlNlp0DgTP68oVaZ1SGRkipN9AT4OKjV'
  );




var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single("userPhoto");


app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/photo',function(req,res){
	

	upload(req,res,function(err) {
		if(err) {

			return res.end("Error uploading file.");
		}
		console.log('file location and name: ', req.file.destination +'/' +req.file.filename);
		
		var filePath = req.file.destination +'/' +req.file.filename;
		// send the buffer to claifai api to recognize, return the token

		fs.readFile(filePath, function(err, original_data){
			var base64Image = original_data.toString('base64');

			clarifai_app.models.predict("church", {base64: base64Image}).then(
				function(response) {
					var itemName = response.data.outputs[0].data.concepts[0];
					
					var str = itemName.name;
					console.log(str);
					var adjustedName = itemName.name[0].toUpperCase();
					
					for (var i = 1, len = str.length; i < len; i++) {
						  if (i > 0 && str.charAt(i-1) == ' ') {
							  adjustedName += str[i].toUpperCase();
						  }
						  else {
							  adjustedName += str[i];
						  }
					}
					console.log(adjustedName);

					

					/*
						{ id: 'florence cathedral',
						name: 'florence cathedral',
						app_id: 'b84c6efb058441fca1c27d8e8df429a8',
						value: 0.3502867 }

					*/
					
				//fetch (itemName.name callback()) // fetch wiki contents
				


			},
			function(err) {
				console.error(err);
			});	
    
		});


		
		
		
		// delete the file from the middleware
		//fs.unlinkSync(filePath);
		
		res.end("File is uploaded");
	});
});


// serves static files 
app.get(/^(.+)$/, function(req, res){ 
     res.sendFile( __dirname +"/uploads/"+ req.params[0]); 
});


app.listen(3000,function(){
    console.log("Working on port 3000");
});
