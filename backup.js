var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

var FRONTEND_URL = 'https://helloworldbot12.azurewebsites.net' || 'https://localhost:5000';

promptThis = function(session){ 
        if(session.userData.gender==""){
			builder.Prompts.choice(session, "Please select the gender.",['Men','Women']);
		}else if(session.userData.type==""){
			builder.Prompts.choice(session, "Please select the type of shoe.",['Dress','Casual','Athletic']);
		}else if(session.userData.brand==""){
			session.beginDialog('/Brand');
		}else if(session.userData.color==""){
			builder.Prompts.choice(session, "Please select the color.",session.userData.colors);
		}else if(session.userData.size==""){
			builder.Prompts.choice(session, "Please select the size.",session.userData.sizes);
		}
}

deleteSpace = function(string){
	var i = 1;
	while(i>0){
    i = string.indexOf(' ');
    if(i>0){
    string = string.substring(0, i) + string.substring(i+1, string.length);
    }
	}
	return string
}

removeSpace = function(string){
    var i = string.indexOf(' ');
    if(i>0){
    string = string.substring(0, i) + "%20" + string.substring(i+1, string.length);
    }
    var j = string.indexOf('\'');
	if(j>0){
		string = string.substring(0, j) + "%27" + string.substring(j+1, string.length);
	}
    return string;
}

choose_cat = function(gender, type){
	    if (gender == "Women" && type == "Athletic"){
		    category = "5438_1045804_1045806_1228540"
	    }else if (gender == "Women" && type == "Casual"){
		    category = "5438_1045804_1045806_1228545"
	    }else if (gender == "Women" && ((type == "Formal")||(type == "Dress"))){
		    category = "5438_1045804_1045806_1228546"
	    }else if (gender == "Women" && type == ""){
		    category = "5438_1045804_1045806"
	    }else if (gender == "Men" && type == "Athletic"){
		    category = "5438_1045804_1045807_1228548"
	    }else if (gender == "Men" &&  type == "Casual"){
		    category = "5438_1045804_1045807_1228552"
	    }else if (gender == "Men" && ((type == "Formal")||(type == "Dress"))){
		    category = "5438_1045804_1045807_1228553"
	    }else if (gender == "Men" && type == ""){
		    category = "5438_1045804_1045807"
	    }else{
		    category = "5438_1045804"}
	return category;
}

capitalize = function(str) {
    if(str != "dress"){
	if (str !== null && str.length > 0 && (str.charAt(str.length-1)=='s')||(str.charAt(str.length-1)=='S')){
	str = str.substring(0, str.length-1);
	}}
	str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	return str;
}
showoutput = function(session,data){
	session.sendTyping();
	var i=0;
	var card = [];
	if(!data.items){
		session.send("Try another search. No product exists.")
		session.endDialog();
	}else{
		while(data.items[i]){
		card[i] =  new builder.HeroCard(session)
		               .title(data.items[i].name)
					   .subtitle(data.items[i].salePrice + '$')
				       .images([
					       builder.CardImage.create(session, data.items[i].thumbnailImage) 
				       ])
				       .buttons([
					       builder.CardAction.openUrl(session, data.items[i].productUrl,"Buy Now"),
						  // builder.CardAction.openUrl(session, data.items[i].addToCartUrl, "Add to Cart"),
				       ])
				       .tap(builder.CardAction.openUrl(session, data.items[i].productUrl))
				i++;
				}
		if(data.items[9] !== undefined){	
		card[i] = new builder.HeroCard(session)
                      .subtitle('Want to see Similar kind of shoes? Click below')
                      .buttons([
					       builder.CardAction.imBack(session, "Show more", "Show more"),
				       ])
		}
		session.userData.colors = colorsArray(session, data);
		session.userData.brands = brandsArray(session, data);
		session.userData.sizes = sizesArray(session, data);
		var msg = new builder.Message(session)
				.attachmentLayout(builder.AttachmentLayout.carousel)
				.attachments(card);
				session.send(msg);
	}			
}

brandsArray = function(session,data){
    brands = [];	
	var j=0;
	var k=0;
	while(data.facets[j]){
	if(data.facets[j].name == "brand"){
		while((data.facets[j].facetValues[k])&&(k<9)){
			brands[k] = data.facets[j].facetValues[k].name;
			k++;						
			}
		break;
	}
	j++;
	}
	brands.push("Any Brand");
	return brands;
}

sizesArray = function(session,data){
    sizes = [];	
	var j=0;
	var k=0;
	while(data.facets[j]){
	if(data.facets[j].name == "shoe_size"){
		while((data.facets[j].facetValues[k])&&(k<9)){
			sizes[k] = data.facets[j].facetValues[k].name;
			k++;						
			}
		break;
	}
	j++;
	}
	sizes.push("Any Size");
	return sizes;
}

colorsArray = function(session,data){
    colors = [];	
	var j=0;
	var k=0;
	while(data.facets[j]){
	if(data.facets[j].name == "color"){
		while((data.facets[j].facetValues[k])&&(k<9)){
			colors[k] = data.facets[j].facetValues[k].name;
			k++;						
			}
		break;
	}
	j++;
	}
	colors.push("Any Color");
	return colors;
}

callingApi = function(path, callback){
	console.log(path);
	var options = {
		host: 'api.walmartlabs.com',
		path: path,
		method: 'GET'
	};
        //this is the call
	var request = http.request(options, function(res){
		var body = "";
		res.on('data', function(data1) {
			body += data1;
		});
		res.on('end', function() {
			callback(JSON.parse(body));
		})
		res.on('error', function(e) {
			console.log("Got error: " + e.message);
		});
	}).end();
}

// Create bot and add dialogs
var connector = new builder.ChatConnector({appId:"c60ece39-e97b-4f50-ae77-d0ac24f07a4f", appPassword:"tYQdi0sEppKbFwaFUOOKbJ4"});
var bot = new builder.UniversalBot(connector);
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ab8bc42f-9e84-4cf5-96e7-c59a54e552b6?subscription-key=412111898d6f49a0b22467676f123ecb&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

// Handling the Greeting intent. 
dialog.matches('ShoeSearch' , 
    function (session, args, next) {
	console.log ('in shoesearch intent ');
	var shoe = builder.EntityRecognizer.findEntity(args.entities, 'Shoe');
	var gender = builder.EntityRecognizer.findEntity(args.entities, 'Gender');
	var brand = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_brand');
	var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	session.userData = {
		shoe: shoe ? shoe.entity : "",
		gender: gender ? capitalize(gender.entity) : "",
		brand: brand ? brand.entity : "",
		color: color ? capitalize(color.entity) : "",
		type: type ? capitalize(type.entity) : "",
		size: size ? size.entity : "",
		path: "",
		brands: [],
		colors: [],
		sizes: []
	};
	if(session.userData.brand=="nike"){ session.userData.brand = "Nike"; }
	if(session.userData.brand=="puma"){session.userData.brand = "PUMA";}
	if(session.userData.brand=="reebok"){session.userData.brand = "Reebok";}
	if(session.userData.brand=="skechers"){session.userData.brand = "SKECHERS";}
	if(session.userData.brand=="vans"){session.userData.brand = "VANS";}
	if(session.userData.brand=="avia"){session.userData.brand = "Avia";}
	if(session.userData.brand=="asics"){session.userData.brand = "ASICS";}
	if((session.userData.brand=="danskin")||(session.userData.brand== "now")){session.userData.brand = "Danskin Now";}
	if((session.userData.brand=="new")||(session.userData.brand=="balance")){session.userData.brand = "New Balance";}
	if(session.userData.brand=="puma"){session.userData.brand = "PUMA";}
    removeSpace(session.userData.brand);
	session.userData.page = 0;
	if(session.userData.gender == ''){
		session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query="+ session.userData.type+ "shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}else{
	    session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}
	//session.send('Hello there! I am the shoe search bot. You are looking for %s %s %s %s for %s of size %s',session.userData.brand,session.userData.type,session.userData.color,session.userData.shoe,session.userData.gender,session.userData.size);		
	callingApi(session.userData.path, function(data){	
		showoutput(session,data);
		promptThis(session);
		if((session.userData.gender == "")|| (session.userData.type == "")){
		     session.endDialog();
		}else if(session.userData.brand != ""){
		session.endDialog();
	    }	
	})   	
})

dialog.matches('Gender', function (session, args) {
	var gender = builder.EntityRecognizer.findEntity(args.entities, 'Gender');
	session.userData.gender = gender ? capitalize(gender.entity) : "",
	session.userData.page = 0;
	session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	callingApi(session.userData.path, function(data){	
	showoutput(session,data);
	promptThis(session);
	if(session.userData.type == ""){
		     session.endDialog();
	}else if(session.userData.brand != ""){
		session.endDialog();
	}
	})
})


dialog.matches('Type', function (session, args) {
	var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	session.userData.type = type ? capitalize(type.entity) : "",
	session.userData.page = 0;
	session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	callingApi(session.userData.path, function(data){	
	showoutput(session,data);
	promptThis(session);
	if(session.userData.brand != ""){
		session.endDialog();
	}
	})
})

dialog.matches('Color', function (session, args, results) {
	console.log("in color intent");
	var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	session.userData.color = color ? capitalize(color.entity) : "";
	session.userData.page = 0;
	session.send("Cool. You have got a good taste.")
	if(session.userData.color == "Any"){
			session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}else {
	        session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}
	callingApi(session.userData.path, function(data){	
	showoutput(session,data);
	promptThis(session);
	    session.endDialog();
	})
})

dialog.matches('Size', function (session, args, results) {
	console.log("in size intent");
	var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	session.userData.size = size ? deleteSpace(size.entity) : "";
	session.userData.page = 0;
	session.send("Wow, Let me see what we have got");
	if(session.userData.size == "any"){
			session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:&format=json&start=1&numItems=10";
	}else {
	        session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}
	callingApi(session.userData.path, function(data){	
	showoutput(session,data);
	if(!data.items){
		session.endDialog();
	}else if(data.items[9] === undefined){
		session.send("End of Results");
		session.endDialog();
			    }
	promptThis(session);
	session.endDialog();
	})
})

dialog.matches('Show more', function (session, args) {
	session.userData.page += 1;
	session.send("Sure, These are some more similar kind of shoes");
	        if(session.userData.size == "any"){
				if(session.userData.color == "any"){
					session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:&format=json&start=" +session.userData.page+ "1&numItems=10";
			    }else {
			          session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:&format=json&start=" +session.userData.page+ "1&numItems=10";
			    }
			}else if(session.userData.color == "any"){
					session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=" +session.userData.page+ "1&numItems=10";
			}else {
			session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start="+ session.userData.page +"1&numItems=10";
			}
			callingApi(session.userData.path, function(data){
				showoutput(session,data);
				if(!data.items){
		            session.endDialog();
	            }else if(data.items[9] === undefined){
					session.send("End of Results");
					session.endDialog();
			    }
				promptThis(session);
				session.endDialog();
			})
})


dialog.matches('Sample',
  function (session) {
	  session.send("in sample intent");
    var message = new builder.Message(session)
      .sourceEvent({
        facebook: {
           "attachment":{
            "type":"template",			   
            "payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Reebok Men's Yourflex Train 7.0 Lmt Training Shoe",
					"subtitle": "41.11",
					"image_url": "https://i5.walmartimages.com/asr/c2177e90-3024-4096-a602-3f7563f8c2c9_1.96d3442ce0884e313e06ded4787dea21.jpeg?odnHeight=100&odnWidth=100&odnBg=FFFFFF",
					"buttons": [{
						"type": "web_url",
						"url": "http://c.affil.walmart.com/t/api02?l=http%3A%2F%2Fwww.walmart.com%2Fip%2FReebok-YourFlex-Train-7.0-LMT-Men-US-8.5-Black-Cross-Training%2F51844071%3Faffp1%3D-ByPQBinFWiAoQigU4w3RKPhjtrlGOUVONY8ulvvMN4%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi",
						"title": "Show Item",
						"webview_height_ratio": "compact",
					}, {
						"type": "web_url",
						"title": "Add Cart",
						"url": "http://c.affil.walmart.com/t/api02?l=http%3A%2F%2Faffil.walmart.com%2Fcart%2FaddToCart%3Fitems%3D51844071%7C1%26affp1%3D-ByPQBinFWiAoQigU4w3RKPhjtrlGOUVONY8ulvvMN4%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi",
						"webview_height_ratio": "tall",
					}],
				}, {
					"title": "Reebok Men's Yourflex Train 7.0 Lmt Training Shoe",
					"subtitle": "41.11",
					"image_url": "https://i5.walmartimages.com/asr/c2177e90-3024-4096-a602-3f7563f8c2c9_1.96d3442ce0884e313e06ded4787dea21.jpeg?odnHeight=100&odnWidth=100&odnBg=FFFFFF",
					"buttons": [{
						"type": "web_url",
						"url": "http://c.affil.walmart.com/t/api02?l=http%3A%2F%2Fwww.walmart.com%2Fip%2FReebok-YourFlex-Train-7.0-LMT-Men-US-8.5-Black-Cross-Training%2F51844071%3Faffp1%3D-ByPQBinFWiAoQigU4w3RKPhjtrlGOUVONY8ulvvMN4%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi",
						"title": "Show Item",
						"webview_height_ratio": "compact",
					}, {
						"type": "web_url",
						"title": "Add Cart",
						"url": "http://c.affil.walmart.com/t/api02?l=http%3A%2F%2Faffil.walmart.com%2Fcart%2FaddToCart%3Fitems%3D51844071%7C1%26affp1%3D-ByPQBinFWiAoQigU4w3RKPhjtrlGOUVONY8ulvvMN4%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi",
					    "webview_height_ratio": "tall",
					}],
				}]
			},
        }
        }
      });
    session.endDialog(message);
  }
);

// Handling Greeting intent.
dialog.matches('Greeting', function (session, args) {
	console.log ('in greeting intent');	
	session.send("Greetings, Welcome to the Walmart Digital Shoe Bot!!");
    session.send("What are you looking for today?");
	session.endDialog();
});

// Handling unrecognized conversations.
dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");
    session.endDialog();	
});

// Handling the Brand dialog. 
bot.dialog('/Brand', [
	function (session, args) {
		console.log("in brand dialog");
		builder.Prompts.choice(session, "Please select the brand.",session.userData.brands);
	},
	function (session, results) {
		session.userData.brand = results.response.entity;
		session.send("Awesome. Have a look at these.")
		if(session.userData.brand == "Any Brand"){
			session.userData.brand = "";
		}
		session.userData.brand = removeSpace(session.userData.brand);
		session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
		callingApi(session.userData.path, function(data){	
			showoutput(session,data);
			promptThis(session);
			session.endDialog();
		})
	}
]);

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.port || 5000, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

server.get('/authorize', restify.queryParser(), function (req, res, next) {
  if (req.query && req.query.redirect_uri && req.query.username) {
    var username = req.query.username;

    // Here, it would be possible to take username (and perhaps password and other data)
    // and do some verifications with a backend system. The authorization_code query string
    // argument is an arbitrary pass-through value that could be stored as well
    // to enable verifying it once Facebook sends the `Account Linking webhook event`
    // that we handle below. In this case, we are passing the username via the authorization_code
    // since that avoids a need for an external databases in this simple scenario.

    var redirectUri = req.query.redirect_uri + '&authorization_code=' + username;
    return res.redirect(redirectUri, next);
  } else {
    return res.send(400, 'Request did not contain redirect_uri and username in the query string');
  }
});


server.get(/\/static\/?.*/, restify.serveStatic({
  directory: __dirname
}));