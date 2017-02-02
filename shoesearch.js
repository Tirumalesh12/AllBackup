var restify = require('restify');
var builder = require('botbuilder');
var session = require('client-sessions');
var https = require('https');

var data = "";

choose_cat = function(gender, type){
	console.log(gender);
	console.log(type);
	    if (gender == "Women" && type == "Athletic"){
		    category = "5438_1045804_1045806_1228540"
        }else if (gender == "Women" && type == "Casual"){
            category = "5438_1045804_1045806_1228545"
        }else if (gender == "Women" && ((type == "Formal")||(type == "Dres"))){
            category = "5438_1045804_1045806_1228546"
        }else if (gender == "Women" && type == ""){
            category = "5438_1045804_1045806"
        }else if (gender == "Men" && type == "Athletic"){
            category = "5438_1045804_1045807_1228548"
        }else if (gender == "Men" &&  type == "Casual"){
            category = "5438_1045804_1045807_1228552"
        }else if (gender == "Men" && ((type == "Formal")||(type == "Dres"))){
            category = "5438_1045804_1045807_1228553"
        }else if (gender == "Men" && type == ""){
            category = "5438_1045804_1045807"
        }else{
		    category = "5438_1045804"}
		console.log(category);
	return category;
}

capitalize = function(str) {
	if (str != null && str.length > 0 && (str.charAt(str.length-1)=='s')||(str.charAt(str.length-1)=='S')){
	str = str.substring(0, str.length-1);
	}
    str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	return str;
}

callingApi = function(path, callback){
	     console.log(path);
	     var options = {
            host: 'api.walmartlabs.com',
            path: path,
			method: 'GET'		
         };
         //this is the call
         var request = https.request(options, function(res){
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

function showoutput(session,data){
var msg = new builder.Message(session)
            .attachments([
                new builder.HeroCard(session)
                    .title(data.items[0].name)
                    .images([ builder.CardImage.create(session, data.items[0].thumbnailImage) ])
					.buttons(builder.CardAction.openUrl(session, data.items[0].productUrl,"Buy Now")),
                new builder.HeroCard(session)
                    .title(data.items[1].name)
                    .images([ builder.CardImage.create(session, data.items[1].thumbnailImage) ])
					.buttons(builder.CardAction.openUrl(session, data.items[1].productUrl,"Buy Now")),
			    new builder.HeroCard(session)
                    .title(data.items[2].name)
                    .images([ builder.CardImage.create(session, data.items[2].thumbnailImage) ])
					.buttons(builder.CardAction.openUrl(session, data.items[2].productUrl,"Buy Now"))
            ]);
        session.send(msg);
}

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: '622a5136-d395-47bf-8b45-8982980fb86b', appSecret: 'knyYLCbEzBe9R4RMrZBvJyC' });

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/ab8bc42f-9e84-4cf5-96e7-c59a54e552b6?subscription-key=412111898d6f49a0b22467676f123ecb&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.add('/', dialog);

// Handling the Greeting intent. 
dialog.matchesAny(['ShoeSearch','Gender','Type','Color','Brand'] , [ 
    function (session, args, next, results) {
	console.log ('in shoesearch intent ');
	var shoe = builder.EntityRecognizer.findEntity(args.entities, 'Shoe');
	var gender = builder.EntityRecognizer.findEntity(args.entities, 'Gender');
	var brand = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_brand');
	var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	session.dialogData = {
		shoe: shoe ? shoe.entity : "",
		gender: gender ? capitalize(gender.entity) : "",
		brand: brand ? capitalize(brand.entity) : "",
		color: color ? capitalize(color.entity) : "",
		type: type ? capitalize(type.entity) : "",
		size: size ? size.entity : "",
		path: "",
		}
	session.send('Hello there! I am the shoe search bot. You are looking for %s %s %s %s for %s of size %s',session.dialogData.brand,session.dialogData.type,session.dialogData.color,session.dialogData.shoe,session.dialogData.gender,session.dialogData.size);		
	session.sendTyping();
	session.dialogData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.dialogData.gender,session.dialogData.type) +"&facet=on&facet.filter=gender:"+ session.dialogData.gender +"&facet.filter=color:"+ session.dialogData.color +"&facet.filter=brand:"+ session.dialogData.brand +"&facet.filter=shoe_size:"+ session.dialogData.size +"&format=json&start=1&numItems=10";
    callingApi(session.dialogData.path, function(data){		
		showoutput(session,data);
		})
		builder.Prompts.choice(session, "Please select the gender?",["Men","Women"]);
    },
	function (session,results) {
		session.dialogData.gender = results.response.entity;
		console.log(session.dialogData.shoe);
		session.send(session.dialogData.gender);
		//search.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(search.gender,search.type) +"&facet=on&facet.filter=gender:"+ search.gender +"&facet.filter=color:"+ search.color +"&facet.filter=brand:"+ search.brand +"&facet.filter=shoe_size:"+ search.size +"&format=json&start=1&numItems=10";
		callingApi(session.dialogData.path,function(data){
			console.log("data.items[0].name");
			console.log(data.items[0].name);
			showoutput(session,data);
		})
	}
]);

// Handling unrecognized conversations.
dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");	
});


// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.on('error', function() { console.log("error"); });
server.listen(process.env.port || 5001, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

/*while(search.gender==""||search.type==""||search.color==""||search.size==""){
		if(search.gender==""){
			
		    [function(session, results) {
            builder.Prompts.choice(session, "Please select the gender?",["Men","Women"]);
		    search.gender = captilize(results.respose.entity);
		    callingApi(function(data){
				show(session);
			})
            }
		]}
	}*/