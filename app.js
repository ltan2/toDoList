//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
  secret: 'little secret secrets',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

//establish connection to db
mongoose.connect("mongodb+srv://admin:Pooh123@cluster0.78n71.mongodb.net/toDoDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true,useFindAndModify: false,useCreateIndex: true});

//create a userSchema
const userSchema = new mongoose.Schema({
email : String,
password: String,
userName : String
});

//create a new schema
const itemsSchema = {
name:String
};

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Item = mongoose.model("Item",itemsSchema);

//create new document
const item1 = new Item({
name: "Welcome to your to do list"
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
res.render("home");
});

app.get("/login",function(req,res){
res.render("login");
});

app.post("/login",function(req,res){

const user = new User({
username: req.body.username,
password: req.body.pasword,
userName : req.body.userN
});
const name = req.body.userN;

req.login(user,function(err){
if(err){
console.log(err);
}
else{
passport.authenticate("local")(req,res,function(){
res.redirect("/list?Name=" + name);
});
}

});
});

app.get("/list",function(req,res){
let day = date();
const listName = req.query.Name;
if(req.isAuthenticated()){

List.findOne({name: listName},function(err,foundList){
if(!err){
 if(!foundList){
 //create new list
 const list = new List({
  name : listName,
  items :defaultItems
  });
 list.save();
 res.redirect("/list?Name=" + listName);

 }
 else{
  res.render("index",{listTitle:day, newListItems:foundList.items,listOwner:listName});
 }
 
}

});
}
});

app.get("/register",function(req,res){
res.render("register");
});
 
app.post("/register",function(req,res){
const userName = req.body.userN;
User.register({username: req.body.username, name: userName}, req.body.password, function(err,user){
if(err){
console.log(err);
res.redirect("/register");
}
else{
passport.authenticate("local")(req,res,function(){
res.redirect("/list?Name=" + userName);
});
}

});
});

app.post("/add",function(req,res){
const itemName = req.body.newItem;
const listName = req.body.listName;

if(req.isAuthenticated()){
const item = new Item ({
name : itemName
});

let day = date();

 List.findOne({name:listName},function(err,foundList){
 if(err){
 console.log(err);
 }
 else{
 foundList.items.push(item);
 foundList.save();
 res.redirect("/list?Name=" + listName );
 }
 });

}

});

app.post("/delete",function(req,res){
const checkItemId = req.body.checkbox;
const listName = req.body.listName;

let day = date();
if(req.isAuthenticated()){

List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkItemId}}},function(err,foundList){
  if(!err){
   res.redirect("/list?Name=" + listName);
   }
 });

}
});

app.get("/logout",function(req,res){
req.logout();
res.redirect("/");
});


let port = process.env.PORT;
if(port == null || port == ""){
port = 3000;
}


app.listen(port,function(){

console.log("server started succesfully");
});

