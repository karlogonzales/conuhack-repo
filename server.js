var express	=	require("express");
var multer	=	require('multer');
var fs = require('fs');
var http = require('https');

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
						  if (i > 0 && str.charAt(i-1) == ' ' && i > 0 && str.charAt(i-1) != 'a' && str.charAt(i) != 'l') {
							  adjustedName += str[i].toUpperCase();
						  }
						  else {
							  adjustedName += str[i];
						  }
					}
					console.log(adjustedName);

					var titleParts = adjustedName.split(" ");
					var titleParam = "";
					titleParts.map(function(x) {
						titleParam += x + "+";
					})
					titleParam.slice(0, -1);

					var wiki_url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + titleParam;
					
					http.get(wiki_url, function(response) {
						// Continuously update stream with data
						var body = '';
						response.on('data', function(d) {
							body += d;
						});
						
						response.on('end', function() {

							// Data reception is done, do whatever with it!
							var parsed = body.split("\"extract\":\"");
							//console.log(parsed[1]);
							var final_text = parsed[1].slice(0, -5);

							var final_result = {};
							final_result["place"] = adjustedName;
							final_result["description"] = final_text;
							// delete the file from the middleware
							fs.unlinkSync(filePath);
							res.end(JSON.stringify(final_result));
						});
					});
				},
			// predict function error 
			function(err) {
				console.error(err);
			});	
			
		});
		
	});

	// function fetchWikiInfo (url, callback) {
				
	// 	console.log("enter here");			
	// 	https.get(url, function(response){
						
	// 		response.on("extract", function (chunk) {
	// 			data += chunk.toString();
	// 		});
						
	// 		response.on('end', function() {
	// 			try {
	// 				var parsedData = JSON.parse(data);
	// 				console.log(parsedData);
	// 				callback(parsedData);
	// 			} catch (e) {
	// 				callback("No Wiki information available");
	// 			}
	// 		});

	// 	});
	// }


});


// serves static files 
app.get(/^(.+)$/, function(req, res){ 
     res.sendFile( __dirname +"/uploads/"+ req.params[0]); 
});


app.listen(3000,function(){
    console.log("Working on port 3000");
});
