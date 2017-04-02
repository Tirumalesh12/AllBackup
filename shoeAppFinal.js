var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var sess = require('client-sessions')
sess.maincart = [];
sess.number = 0;

WishMe = function(){
	var currentTime = new Date();
	var currentOffset = currentTime.getTimezoneOffset();
	var ISTOffset = 330;   // IST offset UTC +5:30 
	var myDate = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    if (myDate.getHours()>4 && myDate.getHours() < 12 ){ 
    return "Good Morning!"
	} else if (myDate.getHours() >= 12 && myDate.getHours() < 16 ) { 
	return "Good Afternoon!"; 
	} else if ( myDate.getHours() >= 16 && myDate.getHours() <= 22 ) { 
	return "Good Evening!";
	}else {
		return "I guess it is very late now, Anyway"
	} 
};

promptThis = function(session){ 
        if(session.userData.gender==""){
			builder.Prompts.choice(session, "Please select the gender.",['Men','Women']);
		}else if(session.userData.type==""){
			builder.Prompts.choice(session, "It is very important to dress according to the occasion or the work you do. So what kind of shoe are you looking for?",['Dress','Casual','Athletic']);
		}else if(session.userData.size==""){
			builder.Prompts.choice(session, "What is the size you are looking for?",session.userData.sizes);
		}else if(session.userData.brand==""){
			session.beginDialog('/Brand');
		}else if(session.userData.color==""){
			builder.Prompts.choice(session, "Please select the color.",session.userData.colors);
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

addCart = function(session, data){	
	sess.maincart[sess.number] = { "title"    : data.name,
					               "subtitle" : data.salePrice + '$',
					               "image_url": data.thumbnailImage ,
								   "buttons":[
                                             {
                                                "type":"postback",
												"payload": data.salePrice + " removeitem",
                                                "title":"Remove item"
                                             }  ]
	               }
  	session.userData.cartItem = sess.maincart;
	sess.number += 1;
	session.send("This item is been added to cart");
}

showItem = function(session, data){
	session.send("Sure, Have a look here");
	var item = new builder.Message(session)
				.attachments([
				new builder.HeroCard(session)
		               .title(data.name)
					   .subtitle(data.salePrice + '$, Customer Rating: '+data.customerRating+ ', Stock: '+data.stock )
				       .images([
					      builder.CardImage.create(session, data.largeImage),
				         ])
				       .buttons([
					       builder.CardAction.postBack(session, "additem "+ parseInt(data.itemId) +" to cart","Add to Cart"),
						   builder.CardAction.postBack(session, "Show more", "Show more"),
						])
				       ]);
	session.send(item);
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
					       builder.CardAction.postBack(session, "showitem  "+ parseInt(data.items[i].itemId),"Show item"),
						   builder.CardAction.postBack(session, "showitem  "+ parseInt(data.items[i].itemId),"Show item")
				       ])
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
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/42a438e9-722e-4f2b-933b-02f3f862f57c?subscription-key=ef7d814726e342358583d833f37aaf9a&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

// Handling Greeting intent.
dialog.matches('Greeting', function (session, args) {
	console.log ('in greeting intent');	
	var username = session.message;
	session.send("Hello " +username.address.user.name+ ". " +WishMe());
	if(session.userData.cartItem !== undefined){
	sess.maincart = session.userData.cartItem ;
	sess.number = session.userData.cartItem.length;
	}
	session.send("Welcome to the Walmart Digital Shoe Bot!!!. What are you looking for today?");
	session.userData = {
		shoe:  "",
		gender:"",
		brand: "",
		color: "",
		type:  "",
		size:  "",
		path:  "",
		num:   0,
		subtotal: 0.0,
		shipping: 0.0,
		tax: 0.0,
		total: 0.0,
		brands: [],
		colors: [],
		sizes: [],
		cartItem: []
	};
	session.endDialog();
});

// Handling the ShoeSearch intent. 
dialog.matches('ShoeSearch', function (session, args, next) {
	if(session.userData.shoe !== undefined){session.dialogData = session.userData;}
	else {
		session.dialogData = {
			shoe:  "",
			gender:"",
			brand: "",
			color: "",
			type:  "",
			size:  ""
		}
	}
	console.log ('in shoesearch intent ');
	var shoe = builder.EntityRecognizer.findEntity(args.entities, 'Shoe');
	var gender = builder.EntityRecognizer.findEntity(args.entities, 'Gender');
	var brand = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_brand');
	var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	session.userData = {
		shoe  : shoe   ? shoe.entity               : session.dialogData.shoe ,
		gender: gender ? capitalize(gender.entity) : session.dialogData.gender,
		brand : brand  ? brand.entity              : session.dialogData.brand,
		color : color  ? capitalize(color.entity)  : session.dialogData.color,
		type  : type   ? capitalize(type.entity)   : session.dialogData.type,
		size  : size   ? size.entity               : session.dialogData.size,
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
	if(session.userData.cartItem !== undefined){
	sess.maincart = session.userData.cartItem;
	sess.number = session.userData.cartItem.length;
	}
	if(session.userData.cartItem === undefined){
	session.userData.cartItem = sess.maincart;
	}
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
		if((session.userData.gender == "")|| (session.userData.type == "")){
			 promptThis(session);
			 session.endDialog();
		}else if ((session.userData.brand == "")&&(session.userData.color == "")){
		session.send("Do you have any certain brand or color in mind? Please mention. ");
		session.endDialog();
	    }else {
			promptThis(session);
			session.endDialog();
		}	
	})   	
})

dialog.matches('Property Show', function (session, args, next) {
	var property = builder.EntityRecognizer.findEntity(args.entities, 'Property');
	if((property.entity == "brand") || (property.entity == "brands")){
		session.send("Ok, Let me show you what all brands available ")
		session.beginDialog('/Brand');
	}else {
		session.send("We have of wide color range of shoes");
		builder.Prompts.choice(session, "Please select the color.",session.userData.colors);
		session.endDialog();
	}	
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
	    session.endDialog();
	})
})

dialog.matches('Size', function (session, args, results) {
	console.log("in size intent");
	var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	session.userData.size = size ? deleteSpace(size.entity) : "";
	session.userData.page = 0;
	session.send("Wow.. ok, I will show you what we have got");
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

dialog.matches('Show Item', function (session, args, results) {
	console.log("in show item intent");
	var itemId = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
	session.userData.itemId = itemId ? itemId.entity : "";
	session.userData.path = "/v1/items/" + session.userData.itemId + "?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json"
	callingApi(session.userData.path, function(data){	
	showItem(session,data);
	if(session.userData.cartItem !== undefined){
	sess.maincart = session.userData.cartItem ;
	sess.number = session.userData.cartItem.length;
	}
	session.endDialog();
	})
})

dialog.matches('Add Cart', function (session, args, results) {
	console.log("in add cart intent");
	var itemId = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
	session.userData.itemId = itemId ? itemId.entity : "";
	session.userData.path = "/v1/items/" + session.userData.itemId + "?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json"
	if(session.userData.cartItem.length > 3){
		session.send("Maximum 3 items can be added in cart once");
		builder.Prompts.choice(session, "Check your cart",['showcart']);
		session.endDailog();
	}else {
		callingApi(session.userData.path, function(data){	
		addCart(session,data);
		builder.Prompts.choice(session, "Select any one option",['Showcart','Continue Shopping']);
		session.endDialog();
		})
	}
})

dialog.matches('Show Cart', function (session, args, results) {
	console.log("in show cart intent");
	if(session.userData.cartItem.length === 0){
		session.userData.cartItem = sess.maincart;
	}
	if(session.userData.cartItem.length == 0) { 
		var message = new builder.Message(session)
		             .attachments([
				      new builder.HeroCard(session)
		                 .title("Your shopping cart is empty")
					     .buttons([
					         builder.CardAction.postBack(session, "Hii","Continue shopping")
						  ])
					])
     	session.send(message);					
	}else {
		var tax = 0.0, tax1 = 0.0,total = 0.0, shipping = 0.0, subtotal = 0.0, subtotal1 = 0.0, i = 0;
		var str = "";
		while(session.userData.cartItem[i]){
			str = session.userData.cartItem[i].subtitle;
			str = str.substring(0, str.length-1);
			subtotal1 += parseFloat(str);
			i++;
			}
			subtotal = parseFloat(subtotal1).toFixed(2);
			if(subtotal <= 35){
				shipping = 5.99;
				}
			tax1 = 0.085 * subtotal;
			tax = parseFloat(0.085 * subtotal).toFixed(2);
			total = parseFloat(subtotal1+tax1+shipping).toFixed(2);
			session.userData = {
				subtotal: subtotal,
				shipping: shipping,
				tax: tax,
				total: total
				}
			sess.maincart[sess.number] = { "title"    : "Total: " +total.toString()+ "$",
					                       "subtitle" : "subtotal: " +subtotal.toString()+ "$ , shipping: " +shipping.toString()+ "$ , tax: " +tax.toString()+ "$",
	                                      }
            session.userData.cartItem = sess.maincart;
			if(session.userData.cartItem.length < 5){
				var message = new builder.Message(session)
                      .sourceEvent({
				        facebook: {
                          "attachment":{
                             "type":"template",
                             "payload":{
                                "template_type":"list",
								 "top_element_style": "compact",
                                "elements":JSON.stringify(session.userData.cartItem, null, 4),
								"buttons": [
                                               {
                                                "type":"postback",
                                                "title":"Check out all items",
                                                "payload":"Check out"
                                             } 
                                ]  
					         }
				         }
			          }
			       })
			    session.send(message);
				}
	}
    session.userData.cartItem.splice(-1,1);	
	session.endDialog();
})

dialog.matches('Remove Cart', function (session, args, results) {
	console.log("in remove item cart intent");
	var num = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
	var arrayNum = num ? num.entity : "";
	var i = 0;
	if(session.userData.cartItem[0] == null){
		session.send("No item in your cart");
	}else{
        while(session.userData.cartItem){
			if(session.userData.cartItem[i].subtitle == (arrayNum+'$')){
				console.log("iffff");
				session.userData.cartItem.splice(i,1);
				sess.maincart.splice(i,1);
				sess.number -= 1;
				session.send("Item removed from the cart");
	            builder.Prompts.choice(session, "Check our cart.",['showcart']);
				break;
			}
			i++;
		}
	}
	session.endDialog();
})
	
dialog.matches('Show more', function (session, args) {
	session.userData.page += 1;
	session.send("Of course, These are some more similar kind of shoes");
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

// Handling unrecognized conversations.
dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");
    session.endDialog();	
});

dialog.matches('Buy', [
    function(session, args){
		console.log("in buy intent");
		session.send(" Here is your profile details: ");
		session.send("Name: Mr. Stephane Crozatier");
		session.send(" Email: coolstephane@abc.xyz ");
		session.send("Contact: 9876543210");
		builder.Prompts.choice(session, "Continue as Stephane",['Continue','Cancel']);
	},
	function(session, results){
		 if (results.response.entity != 'Cancel' ) {
			 session.send("OK, we found two saved addresses");
		     builder.Prompts.choice(session, "Please select one address",['Work address','Home address','Cancel']);
		}else {
			session.endDialog();
		}
	},
	function(session, results){
		 if (results.response.entity != 'Cancel') {
			 session.send("OK Stephane, we will ship it to your %s", results.response.entity);
			 builder.Prompts.choice(session, "select shipping method",["Normal shipping(6-7 days) - normal shipping cost", "Fedex(nextday delivery)- extra $5", "USPS(2-3 days delivery)- extra $3",'Cancel']);
		 }else {
			session.endDialog();
		}
	},
	function(session, results){
		if (results.response.entity != 'Cancel') {
			if(results.response.entity == "Fedex(nextday delivery)- extra $5"){session.userData.shipping += 5;}
			if(results.response.entity == "USPS(2-3 days delivery)- extra $3"){session.userData.shipping += 3;}
			builder.Prompts.choice(session, "Select card for payment",['VISA 1234','Cancel']);
		}else {
			session.endDialog();
		}
	},
	function(session, results){
		if (results.response.entity != 'Cancel') {
		builder.Prompts.number(session, "Give security number of your card VISA 1234");
		}else {
			session.endDialog();
		}
	},
	function(session, results){
		if (results.response) {
		var time = Math.floor(Date.now()/1);
		var timeStamp = time.toString();
		var i = 0, j = 0;
		var receipt= [];
		var str = "";
		var subtotal = [];
		while(session.userData.cartItem[j]){
			str = session.userData.cartItem[j].subtitle;
			str = str.substring(0, str.length-1);
			subtotal[j] = parseFloat(str).toFixed(2);
			j++;
			}
		while(session.userData.cartItem[i]){
			receipt[i] = {
                            "title": session.userData.cartItem[i].title,
                            "quantity":1,
                            "price": subtotal[i],
                            "currency": "USD",
                            "image_url":session.userData.cartItem[i].image_url
                          }
			i++;
			}
		session.send("Payment successfull!!");
		session.send("Please check your reciept");
		var msg = new builder.Message(session)
            .sourceEvent({
                facebook: {
					"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"receipt",
                        "recipient_name":"Stephane Crozatier",
                        "order_number":"12345678902",
                        "currency":"USD",
                        "payment_method":"Visa 1234", 
                        "merchant_name": "Walmart",		
                        "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
                        "timestamp": timeStamp, 
                        "elements": JSON.stringify(receipt, null, 4),
                        "address":{
                          "street_1":"1 Hacker Way",
                          "street_2":"",
                          "city":"Menlo Park",
                          "postal_code":"94025",
                          "state":"CA",
                          "country":"US"
                        },
                        "summary":{
                          "subtotal"      : session.userData.subtotal,
                          "shipping_cost" : session.userData.shipping,
                          "total_tax"     : session.userData.tax,
                          "total_cost"    : session.userData.total
                        },
                        "adjustments":[
                         {
                            "name"  : "New Customer Discount",
                            "amount": 20
                         },
                         {
                            "name"  : "$10 Off Coupon",
                            "amount": 10
                         }
					]
				}
			}
		  }
		});	
		session.send(msg);
		builder.Prompts.text(session, "Thank you for shopping in Walmart");
		}
	},
	function(session, results){
		if (results.response) {
		sess.maincart = [];
		session.userData.cartItem = [];
		session.endDailog();
		}else {
			sess.maincart = [];
			session.userData.cartItem = [];
			session.endDailog();
		}
	}
])

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

dialog.matches('End Conversation', function (session, args) {
	session.send("Thank you for checking in, Hope I helped you.");
	session.send("Come back again");
	session.userData = {
		shoe:  "",
		gender:"",
		brand: "",
		color: "",
		type:  "",
		size:  ""
	};
	session.endDialog();
})


// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.port || 5000, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
