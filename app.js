//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

var items =[]
var workItems = []

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.get("/",function(req,res){
let day = date();
res.render("index",{listTitle:day, newListItems:items});

});

app.post("/",function(req,res){
var item = req.body.newItem 
if(req.body.list == "Work"){
workItems.push(item);
res.redirect("/work");
}
else{
items.push(item);
res.redirect("/");
}


});

app.get("/work",function(req,res){
res.render("index",{listTitle:"Work List",newListItems: workItems});
});

app.listen(3000,function(){
console.log("running on server 3000");
});

