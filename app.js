//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//establish connection to db
mongoose.connect("mongodb://localhost:27017/toDoDB",{useNewUrlParser:true,useUnifiedTopology: true});

//create a new schema
const itemsSchema = {
name:String
};

const Item = mongoose.model("Item",itemsSchema);

//create new document
const item1 = new Item({
name: "Welcome to your ro do list"
});

const item2 = new Item({
name: "Hit the + button to add items"
});

const item3 = new Item({
name: "Hit the - button to delete items"
});

const defaultItems = [item1,item2,item3];
const foundItems =[];
const listSchema = {
name: String,
items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){
let day = date();

//find all items in database
Item.find({},function(err,foundItems){ //foundItems stores what db returns
if(err){
console.log(err);
}
else{
 if(foundItems.length == 0){
  Item.insertMany(defaultItems,function(err){
   if(err){
    console.log(err);
   }
   else{
    console.log("Succefully save");
   }
  });
  res.redirect("/");
 }
  else{
  res.render("index",{listTitle:day, newListItems:foundItems});
  }
}
});

});

app.get("/:customListName",function(req,res){
const customListName = req.params.customListName;
const list = new List({
name : customListNames,
items:defaultItems
});
list.save();

});

app.post("/",function(req,res){
const itemName = req.body.newItem 
const item = new Item ({
name : itemName
});
item.save()
res.redirect("/");
/*if(req.body.list == "Work"){
workItems.push(item);
res.redirect("/work");
}
else{
items.push(item);
res.redirect("/");
}*/


});

app.post("/delete",function(req,res){
const checkItemId = req.body.checkbox

Item.findByIdAndRemove(checkItemId,function(err){
if(err){
console.log(err);
}
else{
console.log("Succefully deleted");
res.redirect("/");
}
});

});


app.get("/work",function(req,res){
res.render("index",{listTitle:"Work List",newListItems: workItems});
});

app.listen(3000,function(){
console.log("running on server 3000");
});

