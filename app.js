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
mongoose.connect("mongodb+srv://admin:Pooh123@cluster0.78n71.mongodb.net/toDoDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true,useFindAndModify: false});

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

//create a model
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

List.findOne({name:customListName},function(err,foundList){
if(!err){
  if(!foundList){
  //create new list
  const list = new List({
  name : customListName,
  items :defaultItems
  });
  list.save();
  res.redirect("/"+ customListName);
  }
  else{
  res.render("index",{listTitle: foundList.name, newListItems:foundList.items});
  }
}

});
});

app.post("/",function(req,res){
const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item ({
name : itemName
});

//console.log(itemName);
let day = date();

if(listName == encodeURIComponent(day)){
 item.save();
 res.redirect("/");
}
else{
 List.findOne({name:listName},function(err,foundList){
 if(err){
 console.log(err);
 }
 else{
 foundList.items.push(item);
 foundList.save();
 res.redirect("/" + listName);
 }
 });
}


});

app.post("/delete",function(req,res){
const checkItemId = req.body.checkbox;
const listName = req.body.listName;
let day = date();

if(listName == encodeURIComponent(day)){
Item.findByIdAndRemove(checkItemId,function(err){
  if(err){
   console.log(err);
   }
   else{
   console.log("Succefully deleted");
   res.redirect("/");
   }
});
}

else{
List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkItemId}}},function(err,foundList){
  if(!err){
   res.redirect("/" + listName);
   }
 });
}

});

let port = process.env.PORT;
if(port == null || port == ""){
port = 3000;
}

app.listen(port,function(){
console.log("server started succesfully");
});

