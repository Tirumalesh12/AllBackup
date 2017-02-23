import urllib
import urllib.parse
import urllib.request
import json
import os
import requests

from urllib.parse import urlencode

from flask import Flask
from flask import request
from flask import make_response

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    req = request.get_json(silent=True, force=True)

    print("Request:")
    print(json.dumps(req, indent=4))

    res = makeWebhookResult(req)

    res = json.dumps(res, indent=4)
    print(res)
    r = make_response(res)
    r.headers['Content-Type'] = 'application/json'
    return r
def makeWebhookResult(req):
    if req.get("result").get("action") == "welcome":
        card_content = []
        total_brand = []
        total_color = []
        speech = "welcome"
        b = {
          "title": "WELCOME to WALMART Shop, Which category you are looking for:",
          "imageUrl": "http://www.elmonteexaminer.com/wp-content/uploads/2015/09/walmart.jpg",
          "buttons": [
            {
              "text": "Women's shoes",
              "postback": "Women's shoes"
            },
            {
              "text": "Men's shoes",
              "postback": "Men'ss shoes"
            }
          ],
          "type": 1
        }
        
    elif req.get("result").get("action") == "showitem":
        itemid = req['result']['parameters']['number-integer']
        final_url = "http://api.walmartlabs.com/v1/items/" + itemid + "?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json"
        data_read = urllib.request.urlopen(final_url).read()
        data_decode = data_read.decode('utf-8')
        json_data = json.loads(data_decode)
        total_color = []
        total_brand = []
        card_content = []
        speech = "here is your item"
        b = {
          "title": json_data['name'],
          "subtitle": "$" + str(json_data['salePrice']),
          "imageUrl": json_data['thumbnailImage'],
          "buttons": [
            {
              "text": "add to the cart",
              "postback": "add " + str(json_data['itemId']) + " cart"
            },
            {
              "text": "show more like this",
              "postback": "show more"
            }
          ],
          "type": 1
        }
    elif req.get("result").get("action") == "addcart":
        itemid = req['result']['parameters']['number-integer']
        addcartvalues(itemid)
        #final_url = "http://api.walmartlabs.com/v1/items/" + itemid + "?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json"
        #data_read = urllib.request.urlopen(final_url).read()
        #data_decode = data_read.decode('utf-8')
        #json_data = json.loads(data_decode)
        total_color = []
        total_brand = []
        card_content = []
        speech = "here is your item"
        b = {
            "title": "your item is added to the cart :",
            "replies": [
              "show cart",
              "Main Menu"
            ],
            "type": 2
        }
    elif req.get("result").get("action") == "showcart":
        headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
        getcart = requests.get('https://api.api.ai/v1/entities/cart' , headers = headers)
        json_data = getcart.json()
        cartlist = json_data['entries']
        cartlist_len = len(cartlist)
        total_color = []
        total_brand = []
        #card_content = makelistcart(cartlist)
        card_content = []
        #cartelement = [a]
        speech = "here is your item"
        #b = {
        #    "title": "ITEMS:PRICE: $ 156",
        #    "replies": [
        #      "check out all items",
        #      "Main Menu"
        #    ],
        #    "type": 2
        #}
        b = {
          "payload": {
            "facebook": {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "list",
                  "elements": makelistcart(cartlist),
                  "buttons": [
                    {
                      "title": "$" + str(sum(makecartvalue(cartlist))) + " check out",
                      "type": "postback",
                      "payload": "check out all items"
                    }
                  ]
                }
              }
            }
          },
          "type": 4
        }
    elif req.get("result").get("action") == "deletecart":
        itemid = req['result']['parameters']['number-integer']
        headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
        getcart = requests.get('https://api.api.ai/v1/entities/cart' , headers = headers)
        json_data = getcart.json()
        cartlist = json_data['entries']
        cartlist_len = len(cartlist)
        total_color = []
        total_brand = []
        card_content = []
        removecartvalues(itemid)
        #a = {}
        speech = "you have " + str(cartlist_len - 1) + " items left in your cart :"
        b = {
            "title": "you have " + str(cartlist_len - 1) + " items left in your cart :",
            "replies": [
              "show cart",
              "Main Menu"
            ],
            "type": 2
        }
    elif req.get("result").get("action") == "checkoutsteps1":
        #headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
        #getcart = requests.get('https://api.api.ai/v1/entities/cart' , headers = headers)
        #json_data = getcart.json()
        #cartlist = json_data['entries']
        #cartlist_len = len(cartlist)
        total_color = []
        total_brand = []
        a = {
              "type": 0,
              "speech": " Here is your profile detail:\n\n Name: Mr. Stephane Crozatier \n Email: coolstephane@abc.xyz \n Contact: 9876543210"
        }
        card_content = [a]
        speech = "OK, Mr. Stephane Crozatier , check out\n "
        b = {
            "title": "okk, we found two saved address, \nplease pick any one for delivery",
            "replies": [
              "Home address",
              "Work address"
            ],
            "type": 2
        }
    elif req.get("result").get("action") == "checkoutsteps2shipping":
        #headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
        #getcart = requests.get('https://api.api.ai/v1/entities/cart' , headers = headers)
        #json_data = getcart.json()
        #cartlist = json_data['entries']
        #cartlist_len = len(cartlist)
        total_color = []
        total_brand = []
        card_content = []
        speech = "OK, Mr. Stephane Crozatier , check out\n "
        b = {
            "title": "select shipping method",
            "replies": [
              "Fedex ( next day delivery) - $ 5",
              "USPS   ( 2-3 day delivery) - $ 3"
            ],
            "type": 2
        }
    elif req.get("result").get("action") == "checkoutsteps3payment":
        #headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
        #getcart = requests.get('https://api.api.ai/v1/entities/cart' , headers = headers)
        #json_data = getcart.json()
        #cartlist = json_data['entries']
        #cartlist_len = len(cartlist)
        total_color = []
        total_brand = []
        card_content = []
        speech = "OK, Mr. Stephane Crozatier , pay\n "
        b = {
              "type": 0,
              "speech": " For payment , select security no. for\ncard VISA 1234 "
        }
    elif req.get("result").get("action") == "checkoutsteps4receipt":
        headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
        getcart = requests.get('https://api.api.ai/v1/entities/cart' , headers = headers)
        json_data = getcart.json()
        cartlist = json_data['entries']
        cartlist_len = len(cartlist)
        total_color = []
        total_brand = []
        a = {
              "type": 0,
              "speech": "Paymet is Successfull!!\nCheck your order receipt order below:"
        }
        card_content = [a]
        speech = "OK, Mr. Stephane Crozatier , here is your receipt "
        b = {
          "payload": {
            "facebook": {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "receipt",
                  "recipient_name": "Stephane Crozatier",
                  "order_number": "12345678902",
                  "currency": "USD",
                  "payment_method": "Visa 1234",
                  "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                  "timestamp": "1428444852",
                  "elements": makelistreceipt(cartlist),
                  "address": {
                    "street_1": "1 Hacker Way",
                    "street_2": "",
                    "city": "Menlo Park",
                    "postal_code": "94025",
                    "state": "CA",
                    "country": "US"
                  },
                  "summary": {
                    "subtotal": sum(makecartvalue(cartlist)),
                    "shipping_cost": 4.95,
                    "total_tax": 6.19,
                    "total_cost": sum(makecartvalue(cartlist)) - 18.85
                  },
                  "adjustments": [
                    {
                      "name": "New Customer Discount",
                      "amount": 20
                    },
                    {
                      "name": "$10 Off Coupon",
                      "amount": 10
                    }
                  ]
                }
              }
            }
          },
          "type": 4
        }
        k = {
          "payload": {
            "facebook": {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "receipt",
                  "recipient_name": "Stephane Crozatier",
                  "order_number": "12345678902",
                  "currency": "USD",
                  "payment_method": "Visa 2345",
                  "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                  "timestamp": "1428444852",
                  "elements": [
                    {
                      "title": "Classic White T-Shirt",
                      "subtitle": "100% Soft and Luxurious Cotton",
                      "quantity": 2,
                      "price": 50,
                      "currency": "USD",
                      "image_url": "https://i5.walmartimages.com/asr/766f6e74-95d6-4889-a5d8-f4f0e8cbf138_1.2ec53fa910b6266127439b8d23c4136f.jpeg?odnHeight=100&odnWidth=100&odnBg=FFFFFF"
                    },
                    {
                      "title": "Classic Gray T-Shirt",
                      "subtitle": "100% Soft and Luxurious Cotton",
                      "quantity": 1,
                      "price": 25,
                      "currency": "USD",
                      "image_url": "https://i5.walmartimages.com/asr/766f6e74-95d6-4889-a5d8-f4f0e8cbf138_1.2ec53fa910b6266127439b8d23c4136f.jpeg?odnHeight=100&odnWidth=100&odnBg=FFFFFF"
                    }
                  ],
                  "address": {
                    "street_1": "1 Hacker Way",
                    "street_2": "",
                    "city": "Menlo Park",
                    "postal_code": "94025",
                    "state": "CA",
                    "country": "US"
                  },
                  "summary": {
                    "subtotal": 75,
                    "shipping_cost": 4.95,
                    "total_tax": 6.19,
                    "total_cost": 56.14
                  },
                  "adjustments": [
                    {
                      "name": "New Customer Discount",
                      "amount": 20
                    },
                    {
                      "name": "$10 Off Coupon",
                      "amount": 10
                    }
                  ]
                }
              }
            }
          },
          "type": 4
        }
    elif req.get("result").get("action") == "showoption":
        size = req['result']['parameters']['size']
        gender1 = req['result']['parameters']['gender']
        brand =  req['result']['parameters']['brand']
        color = req['result']['parameters']['color']
        type = req['result']['parameters']['type']
        changeparameter = req['result']['parameters']['changeparameter']
        retailer = "Walmart"
        action = req['result']['action']
        gender = ""
        if gender1 == "Men":
            gender = "Men"
        elif gender1 == "Women":
            gender = "Women"
        else:
            gender = ""
        brand_f = ""
        if brand == "any brand":
            brand_f = ""
        elif brand == "":
            brand_f = ""
        else:
            brand_f = urllib.parse.quote_plus(brand)
        color_f = ""
        if color == "any color":
            color_f = ""
        elif color == "":
            color_f = ""
        else:
            color_f = urllib.parse.quote_plus(color)
        category = ""
        if gender == "Women" and type == "Atheletic":
            category = "5438_1045804_1045806_1228540"
        elif gender == "Women" and type == "Casual":
            category = "5438_1045804_1045806_1228545"
        elif gender == "Women" and type == "Formal":
            category = "5438_1045804_1045806_1228546"
        elif gender == "Women" and type == "":
            category = "5438_1045804_1045806"
        elif gender == "Men" and type == "Atheletic":
            category = "5438_1045804_1045807_1228548"
        elif gender == "Men" and type == "Casual":
            category = "5438_1045804_1045807_1228552"
        elif gender == "Men" and type == "Formal":
            category = "5438_1045804_1045807_1228553"
        elif gender == "Men" and type == "":
            category = "5438_1045804_1045807"
        else:
            category = "5438_1045804"

        if retailer == "Walmart":
            final_url = "http://api.walmartlabs.com/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId=" + category + "&facet=on&facet.filter=gender:" + gender +"&facet.filter=color:" + color_f + "&facet.filter=brand:" + brand_f + "&facet.filter=shoe_size:" + size + "&format=json&start=1&numItems=10"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            facet_data = json_data['facets']
            brand_index = [i for i,x in enumerate(facet_data) if x['name'] == 'brand'][0]
            total_brand = facet_data[brand_index]['facetValues']
            #brand1 = facet_data[brand_index]['facetValues'][0]['name']
            #brand2 = facet_data[brand_index]['facetValues'][1]['name']
            #brand3 = facet_data[brand_index]['facetValues'][2]['name']
            color_index = [i for i,x in enumerate(facet_data) if x['name'] == 'color'][0]
            total_color = facet_data[color_index]['facetValues']
            #color2 = facet_data[color_index]['facetValues'][1]['name']
            #color3 = facet_data[color_index]['facetValues'][2]['name']
            #items = json_data['items']
            card_content = []
            total_results = 0
        else:
            final_url = "http://svcs.ebay.com/services/search/FindingService/v1?operation-name=findItemsAdvanced&service-version=1.13.0&global-id=EBAY-US&categoryId=" + "93427" + "&sortOrde=BestMatch&aspectFilter(0).aspectName=Brand&aspectFilter(0).aspectValueName=" + brand_f + "&aspectFilter(1).aspectName=Color&aspectFilter(1).aspectValueName=" + color + "&aspectFilter(2).aspectName=US+Shoe+Size+%28Men%27s%29&aspectFilter(2).aspectValueName=" + size + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&itemFilter(1).name=MinPrice&itemFilter(1).value=0&itemFilter(2).name=MaxPrice&itemFilter(2).value=9999999&itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true&paginationInput.entriesPerPage=10&paginationInput.pageNumber=1&descriptionSearch=false&security-appname=anshukan-mybot-PRD-a45f0c763-f70377ab&response-data-format=json"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            card_content = []
            total_results = 0
        speech = "we recommend you to buy " + gender + "!!" + color + "!" + "size" + " size " + brand + "!!!" + type + " please look at image"
        if changeparameter == "color":
            b = {
              "title": "please select the color:",
              "replies": makeentityvalues(total_color,'color'),
              "type": 2
            }
        elif changeparameter == "brand":
            b = {
              "title": "please select the brand:",
              "replies": makeentityvalues(total_brand,'brand'),
              "type": 2
            }
        elif changeparameter == "size":
            b = {
              "title": "please select the size:",
              "replies": [
              "7",
              "8",
              "9",
              "10"
              ],
              "type": 2
            }
        else:
            b = {
              "title": "In which category you want to make changes:",
              "replies": [
              "brand",
              "color",
              "size"
              ],
              "type": 2
            }
    elif req.get("result").get("action") == "dontshow":
        size = req['result']['parameters']['size']
        shoe = req['result']['parameters']['shoe']
        gender1 = req['result']['parameters']['gender']
        brand =  req['result']['parameters']['brand']
        color = req['result']['parameters']['color']
        type = req['result']['parameters']['type']
        retailer = 'Walmart'
        action = req['result']['action']
        page_number = 1
        fo = open("foo.txt","w")
        fo.write(str(page_number));
        fo.close()
        gender = ""
        if gender1 == "Men":
            gender = "Men"
        elif gender1 == "Women":
            gender = "Women"
        else:
            gender = ""
        brand_f = ""
        if brand == "any brand":
            brand_f = ""
        elif brand == "":
            brand_f = ""
        else:
            brand_f = urllib.parse.quote_plus(brand)
        color_f = ""
        if color == "any color":
            color_f = ""
        elif color == "":
            color_f = ""
        else:
            color_f = urllib.parse.quote_plus(color)

        category_id = ""
        if gender == "Women" and type == "Atheletic":
            category_id = "95672"
        elif gender == "Women" and type == "Casual":
            category_id = "62107"
        elif gender == "Women" and type == "Formal":
            category_id = "45333"
        elif gender == "Women" and type == "":
            category_id = "3034"
        elif gender == "Men" and type == "Atheletic":
            category_id = "15709"
        elif gender == "Men" and type == "Casual":
            category_id = "24087"
        elif gender == "Men" and type == "Formal":
            category_id = "53120"
        elif gender == "Men" and type == "":
            category_id = "93427"
        else:
            category_id = "93427"

        category = ""
        if gender == "Women" and type == "Atheletic":
            category = "5438_1045804_1045806_1228540"
        elif gender == "Women" and type == "Casual":
            category = "5438_1045804_1045806_1228545"
        elif gender == "Women" and type == "Formal":
            category = "5438_1045804_1045806_1228546"
        elif gender == "Women" and type == "":
            category = "5438_1045804_1045806"
        elif gender == "Men" and type == "Atheletic":
            category = "5438_1045804_1045807_1228548"
        elif gender == "Men" and type == "Casual":
            category = "5438_1045804_1045807_1228552"
        elif gender == "Men" and type == "Formal":
            category = "5438_1045804_1045807_1228553"
        elif gender == "Men" and type == "":
            category = "5438_1045804_1045807"
        else:
            category = "5438_1045804"

        if retailer == "Walmart":
            final_url = "http://api.walmartlabs.com/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId=" + category + "&facet=on&facet.filter=gender:" + gender +"&facet.filter=color:" + color_f + "&facet.filter=brand:" + brand_f + "&facet.filter=shoe_size:" + "" + "&format=json&start=1&numItems=20"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            facet_data = json_data['facets']
            brand_index = [i for i,x in enumerate(facet_data) if x['name'] == 'brand'][0]
            total_brand = facet_data[brand_index]['facetValues']
            #brand1 = facet_data[brand_index]['facetValues'][0]['name']
            #brand2 = facet_data[brand_index]['facetValues'][1]['name']
            #brand3 = facet_data[brand_index]['facetValues'][2]['name']
            #addentityvalues(makeentityvalues(total_brand),'brand')
            color_index = [i for i,x in enumerate(facet_data) if x['name'] == 'color'][0]
            total_color = facet_data[color_index]['facetValues']
            #color1 = facet_data[color_index]['facetValues'][0]['name']
            #color2 = facet_data[color_index]['facetValues'][1]['name']
            #color3 = facet_data[color_index]['facetValues'][2]['name']
            #items = json_data['items']
            #addentityvalues(makeentityvalues(total_color),'color')
            #total_results = json_data['totalResults']
            card_content = []
            total_results = 0
        
        else:
            final_url = "http://svcs.ebay.com/services/search/FindingService/v1?operation-name=findItemsAdvanced&service-version=1.13.0&global-id=EBAY-US&categoryId=" + category_id + "&sortOrde=BestMatch&aspectFilter(0).aspectName=Brand&aspectFilter(0).aspectValueName=" + brand_f + "&aspectFilter(1).aspectName=Color&aspectFilter(1).aspectValueName=" + color + "&aspectFilter(2).aspectName=US+Shoe+Size+%28Men%27s%29&aspectFilter(2).aspectValueName=" + size + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&itemFilter(1).name=MinPrice&itemFilter(1).value=0&itemFilter(2).name=MaxPrice&itemFilter(2).value=9999999&itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true&paginationInput.entriesPerPage=10&paginationInput.pageNumber=1&descriptionSearch=false&security-appname=anshukan-mybot-PRD-a45f0c763-f70377ab&response-data-format=json"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            card_content = []
            total_results = 0
        speech = "we recommend you to buy " + gender + "!!" + color + "!" + "size" + " size " + brand + "!!!" + type + " please look at image"		
        if shoe == "":
            b = {
              "title": "sorry , I didn't get you ,what you exactly looking for :",
              "replies": [
              "Men's shoes",
              "Women's shoes"
              ],
              "type": 2
            }
        elif gender == "":
            b = {
              "title": "please select the gender:",
              "replies": [
              "Men",
              "Women"
              ],
              "type": 2
            }
        elif type == "":
            b = {
              "title": "unable to recognize, please select from the following category:",
              "replies": [
              "Atheletic",
              "Casual",
              "Formal"
              ],
              "type": 2
            }
        elif color == "":
            b = {
              "title": "unable to recognize youe choice ,please select from the following color:",
              "replies": makeentityvalues(total_color,'color'),
              "type": 2
            }
        elif brand == "":
            b = {
              "title": "unable to recognize youe choice ,please select from the following color:",
              "replies": makeentityvalues(total_brand,'brand'),
              "type": 2
            }
        elif size == "":
            b = {
              "title": "Sise you entered is not correct or not recogizable ,please select the size:",
              "replies": [
              "8",
              "9",
              "10"
              ],
              "type": 2
            }
        else:
            b = {
              "title": "unable to recognize your choice ,let's narrow it down:",
              "replies": [
              "refine search",
              "Main menu",
              "Men's shoes",
              "Women's shoes"
              ],
              "type": 2
            }
    elif req.get("result").get("action") != "showoutagain":
        size = req['result']['parameters']['size']
        gender1 = req['result']['parameters']['gender']
        brand =  req['result']['parameters']['brand']
        color = req['result']['parameters']['color']
        type = req['result']['parameters']['type']
        retailer = "Walmart"
        action = req['result']['action']
        page_number = 1
        fo = open("foo.txt","w")
        fo.write(str(page_number));
        fo.close()
        gender = ""
        if gender1 == "Men":
            gender = "Men"
        elif gender1 == "Women":
            gender = "Women"
        else:
            gender = ""
        brand_f = ""
        if brand == "any brand":
            brand_f = ""
        elif brand == "":
            brand_f = ""
        else:
            brand_f = urllib.parse.quote_plus(brand)
        color_f = ""
        if color == "any color":
            color_f = ""
        elif color == "":
            color_f = ""
        else:
            color_f = urllib.parse.quote_plus(color)
        category = ""
        if gender == "Women" and type == "Atheletic":
            category = "5438_1045804_1045806_1228540"
        elif gender == "Women" and type == "Casual":
            category = "5438_1045804_1045806_1228545"
        elif gender == "Women" and type == "Formal":
            category = "5438_1045804_1045806_1228546"
        elif gender == "Women" and type == "":
            category = "5438_1045804_1045806"
        elif gender == "Men" and type == "Atheletic":
            category = "5438_1045804_1045807_1228548"
        elif gender == "Men" and type == "Casual":
            category = "5438_1045804_1045807_1228552"
        elif gender == "Men" and type == "Formal":
            category = "5438_1045804_1045807_1228553"
        elif gender == "Men" and type == "":
            category = "5438_1045804_1045807"
        else:
            category = "5438_1045804"

        if retailer == "Walmart":
            final_url = "http://api.walmartlabs.com/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId=" + category + "&facet=on&facet.filter=gender:" + gender +"&facet.filter=color:" + color_f + "&facet.filter=brand:" + brand_f + "&facet.filter=shoe_size:" + "" + "&format=json&start=1&numItems=10"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            facet_data = json_data['facets']
            brand_index = [i for i,x in enumerate(facet_data) if x['name'] == 'brand'][0]
            total_brand = facet_data[brand_index]['facetValues']
            #brand1 = facet_data[brand_index]['facetValues'][0]['name']
            #brand2 = facet_data[brand_index]['facetValues'][1]['name']
            #brand3 = facet_data[brand_index]['facetValues'][2]['name']
            color_index = [i for i,x in enumerate(facet_data) if x['name'] == 'color'][0]
            total_color = facet_data[color_index]['facetValues']
            #color2 = facet_data[color_index]['facetValues'][1]['name']
            #color3 = facet_data[color_index]['facetValues'][2]['name']
            #items = json_data['items']
            total_results = json_data['totalResults']
            if total_results == 0:
                card_content = []
            elif total_results <= 8:
                card_content = makelistwalmart(json_data['items'],num = total_results)
            else:
                card_content = makelistwalmart(json_data['items'],num = 8)
        else:
            final_url = "http://svcs.ebay.com/services/search/FindingService/v1?operation-name=findItemsAdvanced&service-version=1.13.0&global-id=EBAY-US&categoryId=" + "93427" + "&sortOrde=BestMatch&aspectFilter(0).aspectName=Brand&aspectFilter(0).aspectValueName=" + brand_f + "&aspectFilter(1).aspectName=Color&aspectFilter(1).aspectValueName=" + color + "&aspectFilter(2).aspectName=US+Shoe+Size+%28Men%27s%29&aspectFilter(2).aspectValueName=" + size + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&itemFilter(1).name=MinPrice&itemFilter(1).value=0&itemFilter(2).name=MaxPrice&itemFilter(2).value=9999999&itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true&paginationInput.entriesPerPage=10&paginationInput.pageNumber=1&descriptionSearch=false&security-appname=anshukan-mybot-PRD-a45f0c763-f70377ab&response-data-format=json"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            card_content = []
            total_results = 0
        speech = "we recommend you to buy " + gender + "!!" + color + "!" + "size" + " size " + brand + "!!!" + type + " please look at image"
        a = {
          "title": "SHOW MORE",
          "subtitle": "CLICK THE BUTTON TO SHOW MORE ITEMS",
          "imageUrl": "",
          "buttons": [
            {
              "text": "show more",
              "postback": "show more"
            }
          ],
          "type": 1
        }
        if gender == "":
            b = {
              "title": "please select the gender:",
              "replies": [
              "Men",
              "Women"
              ],
              "type": 2
            }
        elif type == "":
            b = {
              "title": "please select the category:",
              "replies": [
              "Atheletic",
              "Casual",
              "Formal"
              ],
              "type": 2
            }
        elif total_results == 0 and action == "ebaykeywordsearch":
            b = {
              "title": "no matching result found ,please search again:",
              "replies": [
              ""
              ],
              "type": 2
            }
        elif total_results == 0 and action == "ebaykeywordsearchtype":
            b = {
              "title": "no matching result found for selected type ,please search again:",
              "replies": [
              ""
              ],
              "type": 2
            }
        elif color == "":
            b = {
              "title": "please select the color:",
              "replies": makeentityvalues(total_color,'color'),
              "type": 2
            }
        elif total_results == 0 and action == "ebaykeywordsearch2":
            b = {
              "title": "no result found for selected color ,please try another colour:",
              "replies": makeentityvalues(total_color,'color'),
              "type": 2
            }
        elif brand == "":
            b = {
              "title": "please select the brand:",
              "replies": makeentityvalues(total_brand,'brand'),
              "type": 2
            }
        elif total_results == 0 and action == "ebaykeywordsearch3":
            b = {
              "title": "No results found for entered brand ,please try another:",
              "replies": makeentityvalues(total_brand,'brand'),
              "type": 2
            }
        elif size == "":
            b = {
              "title": "please select the size:",
              "replies": [
              "8",
              "9",
              "10"
              ],
              "type": 2
            }
        elif total_results == 0 and action == "ebaykeywordsearch4":
            b = {
              "title": "NO result found for selected size : Please try another size",
              "replies": [
              "8",
              "9",
              "10"
              ],
              "type": 2
            }
        else:
            b = {
              "title": "do you want to make changes in your search or want more result like above:",
              "replies": [
              "refine search",
              "showmore"
              ],
              "type": 2
            }
    else:
        size = req['result']['parameters']['size']
        gender = req['result']['parameters']['gender']
        brand =  req['result']['parameters']['brand']
        color = req['result']['parameters']['color']
        type = req['result']['parameters']['type']
        retailer = "Walmart"
        fo = open("foo.txt","r+")
        page_no = fo.read(10);
        fo.close()
        fo = open("foo.txt","w")
        fo.write(str(int(page_no)+1));
        fo.close()
        brand_f = ""
        if brand == "any brand":
            brand_f = ""
        elif brand == "":
            brand_f = ""
        else:
            brand_f = urllib.parse.quote_plus(brand)
        color_f = ""
        if color == "any color":
            color_f = ""
        elif color == "":
            color_f = ""
        else:
            color_f = urllib.parse.quote_plus(color)

        category = ""
        if gender == "Women" and type == "Atheletic":
            category = "5438_1045804_1045806_1228540"
        elif gender == "Women" and type == "Casual":
            category = "5438_1045804_1045806_1228545"
        elif gender == "Women" and type == "Formal":
            category = "5438_1045804_1045806_1228546"
        elif gender == "Women" and type == "":
            category = "5438_1045804_1045806"
        elif gender == "Men" and type == "Atheletic":
            category = "5438_1045804_1045807_1228548"
        elif gender == "Men" and type == "Casual":
            category = "5438_1045804_1045807_1228552"
        elif gender == "Men" and type == "Formal":
            category = "5438_1045804_1045807_1228553"
        elif gender == "Men" and type == "":
            category = "5438_1045804_1045807"
        else:
            category = "5438_1045804"
        if retailer == "Walmart":
            final_url = "http://api.walmartlabs.com/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId=" + category + "&facet=on&facet.filter=gender:" + gender +"&facet.filter=color:" + color_f + "&facet.filter=brand:" + brand_f + "&facet.filter=shoe_size:" + size + "&format=json&start=" + page_no + "1&numItems=10"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            webpage = "http://c.affil.walmart.com/t/api01?l=http%3A%2F%2Fwww.walmart.com%2Fip%2F3M-Peltor-Junior-Earmuff-Black%2F1498%3Faffp1%3D-ByPQBinFWiAoQigU4w3RKPhjtrlGOUVONY8ulvvMN4%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi"
            #items = json_data['items']
            total_results = json_data['totalResults']
            total_color = []
            total_brand = []
            if total_results == 0:
                card_content = []
            elif total_results <= 10:
                card_content = makelistwalmart(json_data['items'],num = total_results)
            else:
                card_content = makelistwalmart(json_data['items'],num = 10)

        else:
            final_url = "http://svcs.ebay.com/services/search/FindingService/v1?operation-name=findItemsAdvanced&service-version=1.13.0&global-id=EBAY-US&categoryId=" + "93427" + "&sortOrde=BestMatch&aspectFilter(0).aspectName=Brand&aspectFilter(0).aspectValueName=" + brand_f + "&aspectFilter(1).aspectName=Color&aspectFilter(1).aspectValueName=" + color + "&aspectFilter(2).aspectName=US+Shoe+Size+%28Men%27s%29&aspectFilter(2).aspectValueName=" + size + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&itemFilter(1).name=MinPrice&itemFilter(1).value=0&itemFilter(2).name=MaxPrice&itemFilter(2).value=9999999&itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true&paginationInput.entriesPerPage=10&paginationInput.pageNumber=" + page_no +"&descriptionSearch=false&security-appname=anshukan-mybot-PRD-a45f0c763-f70377ab&response-data-format=json"
            data_read = urllib.request.urlopen(final_url).read()
            data_decode = data_read.decode('utf-8')
            json_data = json.loads(data_decode)
            card_content = []
            total_results = 0
        speech = "we recommend you to buy " + gender + "!!" + color + "!" + "size" + " size " + brand + "!!!" + type + " please look at image"
        a = {
          "title": "SHOW MORE",
          "subtitle": "CLICK THE BUTTON TO SHOW MORE ITEMS",
          "imageUrl": "",
          "buttons": [
            {
              "text": "show more",
              "postback": "show more"
            }
          ],
          "type": 1
        }
        if total_results != 0:
            b = {
              "title": "you want to make changes or show more like above results :",
              "replies": [
              "change",
              "show more"
              ],
              "type": 2
            }
        else:
            b = {
              "title": "no more matching results ,do You want to make changes in :",
              "replies": [
              "color",
              "brand",
              "size"
              ],
              "type": 2
            }
    addentityvalues(makeentityvalues(total_color,'color'),'color')
    addentityvalues(makeentityvalues(total_brand,'brand'),'brand')
    card_content_final = makefulllist(card_content,b)
    print("Response:")
    print(speech)
    
    return {
        "speech": speech,
        "displayText": speech,
        "messages": card_content_final
        #"data": {},
        #"source": "apiai-onlinestore-shopping"
    }
def removecartvalues(itemid = ''):
    headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
    data1 = [itemid]
    requests.delete('https://api.api.ai/v1/entities/cart/entries?v=20150910', headers=headers, data=str(data1))
    return
def addcartvalues(itemid = ''):
    headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
    data1 = [{"value": itemid,"synonyms": [itemid]}]
    requests.post('https://api.api.ai/v1/entities/cart/entries?v=20150910', headers=headers, data=str(data1))
    return
def addentityvalues(mylist = [], facet = ''):
    global content2
    headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer cada57da29ca44219abbe79ae9e89dff',}
    for i in range(len(mylist)):
        content2 = []
        data1 = {"value": mylist[i],"synonyms": [mylist[i], mylist[i].title(), mylist[i].upper(), mylist[i].lower()]}
        content2.append(data1)
        requests.post('https://api.api.ai/v1/entities/'+ facet +'/entries?v=20150910', headers=headers, data=str(content2))
    return
def makeentityvalues(mylist = [], facet = ''):
    global content1
    num = len(mylist)
    if num >= 3:
        num = 3
    content1 = []
    for i in range(num):
        content1.append(mylist[i]['name'])
    content1.append("any"+" "+facet)
    return content1
def makelistwalmart(mylist = [], *, num):
    global content
    content = []
    for i in range(num):
        a = {
          "title": mylist[i]['name'],
          "subtitle": "$" + str(mylist[i]['salePrice']),
          "imageUrl": mylist[i]['thumbnailImage'],
          "buttons": [
            {
              "text": "show item",
              "postback": "show " + str(mylist[i]['itemId']) + " item"
            },
            {
              "text": "show more like this",
              "postback": "show more"
            }
          ],
          "type": 1
        }
        content.append(a)
    return content
def makelistcart(mylist = []):
    global content
    c = {
         "title": "MY CART",
         "image_url": "https://i5.walmartimages.com/asr/eedc46b9-3de5-49d7-b04b-4895d2059bda_1.d9e1798a528be4bb856fc10e4b36ce5d.jpeg?odnHeight=100&odnWidth=100&odnBg=FFFFFF",
         "subtitle": "ITEMS:" + str(len(mylist)),
         "buttons": [
           {
             "title": "CART",
             "type": "postback",
             "payload": "show cart"
           }
        ]
    }
    content = [c]
    for i in range(len(mylist)):
        getitemdata = requests.get('http://api.walmartlabs.com/v1/items/' + mylist[i]['value'] + '?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json')
        getjsondata = getitemdata.json()
        #a = {
        #  "title": getjsondata['name'],
        #  "subtitle": "$" + str(getjsondata['salePrice']),
        #  "imageUrl": getjsondata['thumbnailImage'],
        #  "buttons": [
        #    {
        #      "text": "remove from the cart",
        #      "postback": "remove " + str(getjsondata['itemId']) + " cart"
        #    }
        #  ],
        #  "type": 1
        #}
        a = {
            "title": getjsondata['name'],
            "image_url": getjsondata['thumbnailImage'],
            "subtitle": "$" + str(getjsondata['salePrice']),
            "buttons": [
              {
                "title": "remove ",
                "type": "postback",
                "payload": "remove " + str(getjsondata['itemId']) + " cart"
              }
            ]
        }
        content.append(a)
    return content
def makelistreceipt(mylist = []):
    global content
    content = []
    for i in range(len(mylist)):
        getitemdata = requests.get('http://api.walmartlabs.com/v1/items/' + mylist[i]['value'] + '?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json')
        getjsondata = getitemdata.json()
        #a = {
        #  "title": getjsondata['name'],
        #  "subtitle": "$" + str(getjsondata['salePrice']),
        #  "imageUrl": getjsondata['thumbnailImage'],
        #  "buttons": [
        #    {
        #      "text": "remove from the cart",
        #      "postback": "remove " + str(getjsondata['itemId']) + " cart"
        #    }
        #  ],
        #  "type": 1
        #}
        a = {
                      "title": getjsondata['name'],
                      "subtitle": " 4.5 rating ",
                      "quantity": 1,
                      "price": getjsondata['salePrice'],
                      "currency": "USD",
                      "image_url": getjsondata['thumbnailImage']
        }
        content.append(a)
    return content
def makecartvalue(mylist = []):
    global content
    content = []
    for i in range(len(mylist)):
        getitemdata = requests.get('http://api.walmartlabs.com/v1/items/' + mylist[i]['value'] + '?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json')
        getjsondata = getitemdata.json()
        a = getjsondata['salePrice']
        content.append(a)
    return content
def makefulllist(mylist2 = [],mylist3 = []):
    mylist2.append(mylist3)
    return mylist2
    
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))

    print ("Starting app on port %d")

    app.run(debug=True, port=port, host='0.0.0.0')