var restify = require('restify');
var builder = require('botbuilder');
var session = require('client-sessions');
var https = require('https');

var data = "";

choose_cat = function(gender, type){
	console.log(gender);
	console.log(type);
	    if (gender == "Women" && type == "Atheletic"){
		    category = "5438_1045804_1045806_1228540"
        }else if (gender == "Women" && type == "Casual"){
            category = "5438_1045804_1045806_1228545"
        }else if (gender == "Women" && type == "Formal"){
            category = "5438_1045804_1045806_1228546"
        }else if (gender == "Women" && type == ""){
            category = "5438_1045804_1045806"
        }else if (gender == "Men" && type == "Atheletic"){
            category = "5438_1045804_1045807_1228548"
        }else if (gender == "Men" && type == "Casual"){
            category = "5438_1045804_1045807_1228552"
        }else if (gender == "Men" && type == "Formal"){
            category = "5438_1045804_1045807_1228553"
        }else if (gender == "Men" && type == ""){
            category = "5438_1045804_1045807"
        }else{
		    category = "5438_1045804"}
	return category;
}

capitalize = function(str) {
	if (str != null && str.length > 0 && (str.charAt(str.length-1)=='s')||(str.charAt(str.length-1)=='S')){
	str = str.substring(0, str.length-1);
	}
    str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	return str;
}




// Create bot and add dialogs
var connector = new builder.ChatConnector({ appId: '6f2d84e4-edc5-45c3-9757-dc540a0090d0', appSecret: 'nuNX47d7dzPc02nfkOYyd79' });

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/c592677c-d9ec-435d-bada-77008d9fc147?subscription-key=412111898d6f49a0b22467676f123ecb&verbose=true&q=');
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

// Handling the Greeting intent. 
intents.matches('ShoeSearch', function (session, args, next) {
	console.log ('in shoesearch intent ');
	var search = session.search;
	var shoe = builder.EntityRecognizer.findEntity(args.entities, 'Shoe');
	var gender = builder.EntityRecognizer.findEntity(args.entities, 'Gender');
	var brand = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_brand');
	var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	search = {
		shoe: shoe ? shoe.entity : "",
		gender: gender ? capitalize(gender.entity) : "",
		brand: brand ? capitalize(brand.entity) : "",
		color: color ? capitalize(color.entity) : "",
		type: type ? capitalize(type.entity) : "",
		size: size ? size.entity : "",
		data: "",
		//category: ""
		}
	//search.category = choose_cat(search.gender,search.type);
	session.send('Hello there! I am the shoe search bot. You are looking for %s %s %s %s for %s of size %s',search.brand,search.type,search.color,search.shoe,search.gender,search.size);		
    
	 callingApi = function(callback){
	     var options = {
            host: 'api.walmartlabs.com',
            path: "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+choose_cat(search.gender,search.type) +"&facet=on&facet.filter=gender:"+ search.gender +"&facet.filter=color:"+ search.color +"&facet.filter=brand:"+ search.brand +"&facet.filter=shoe_size:"+ search.size +"&format=json&start=1&numItems=10", 
            method: 'GET'   
         };
         //this is the call
         var request = https.get(options, function(res){
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
    function show_output() {callingApi(function(data){
	if(data.items != null) {
	console.log(data.items[0].name);
	session.send(data.items[0].name);
	[ function(session) {      
        var msg = new builder.Message(session)
            .attachments([
                new builder.HeroCard(session)
                    .title(data.items[0].name)
                    .images([ builder.CardImage.create(session, data.items[0].thumbnailImage) ])
					.tap(builder.CardAction.openUrl(session, data.items[0].productUrl)),
                new builder.HeroCard(session)
                    .title(data.items[1].name)
                    .images([ builder.CardImage.create(session, data.items[1].thumbnailImage) ])
					.tap(builder.CardAction.openUrl(session, data.items[1].productUrl)),
			    new builder.HeroCard(session)
                    .title(data.items[2].name)
                    .images([ builder.CardImage.create(session, data.items[2].thumbnailImage) ])
					.tap(builder.CardAction.openUrl(session, data.items[2].productUrl))
            ]);
        session.send(msg);
    }]
	}else {session.send("Try again, no product exists");}
	})};
	show_output();
	while(search.gender==""||search.type==""||search.color==""||search.size==""){
		if(search.gender==""){
		    [function (session, results) {
            builder.Prompts.choice(session, "Please select the gender?",["Men","Women"]);
		    search.gender = captilize(results.respose.entity);
		    show_output();
            }]
		} else if (search.type==""){
		   [function (session, results) {
            builder.Prompts.choice(session, "Please select the type of shoe?",["Formal","Atheletic", "Casual"]);
		    search.type = captilize(results.respose.entity);
		    show_output();
            }]
		} else if (search.color==""){
		   [function (session, results) {
            builder.Prompts.choice(session, "Please select the color of shoe?",["Black","Blue","Brown","White","Red"]);
		    search.color = captilize(results.respose.entity);
		    show_output();
            }]
		} else if (search.size==""){
		   [function (session, results) {
            builder.Prompts.choice(session, "Please select the size of shoe?",["7","8","9","10","11"]);
		    search.color = captilize(results.respose.entity);
		    show_output();
            }]
		}
	}
	session.end();
});

// Handling unrecognized conversations.
intents.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");			
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.port || 5001, function () {
    console.log('%s listening to %s', server.name, server.url); 
});