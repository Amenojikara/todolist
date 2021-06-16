//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");

const date = require(__dirname + "/date.js");

const app = express();

mongoose.connect("mongodb+srv://admin-ayan:prakarti@cluster0.sdynv.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

//schema to store items 
const itemSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Eat Food"
});

const item2=new Item({
  name:"drink milk"
});

const item3=new Item({
  name:"go jogging"
});

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List=new mongoose.model("List",listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const day = date.getDate();


app.get("/", function(req, res) {

  Item.find((err,Items)=>{
    
    if(Items.length==0){
      Item.insertMany(defaultItems,(err)=>{
        if(err){
          console.log("errors");
        }
        else{
          console.log("success");
        }
       });
       res.redirect("/");
    }
    else{
      
      res.render("list", {listTitle: day, newListItems: Items});    

    }  
  });

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const newitem=new Item({
    name:itemName
  });
  if(listName==day){
    newitem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});



app.post("/delete",(req,res)=>{
  const itemId=req.body.check;
  const listName=req.body.listName;
  if(listName==day){
    Item.deleteOne({_id:req.body.check},(err)=>{
      if(err){
        console.log("error in delete");
      }
    });
    res.redirect("/");
  }
  else{
    //finds and updates
    //pull finds and deletes a record returns updated array
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,result){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});


app.get("/:category",function(req,res){
  var typeOfList=req.params.category;
  // access req.category
  List.findOne({name:typeOfList},(err,result)=>{
    if(!result){
      const newList=new List({
        name:typeOfList,
        items:defaultItems
      });
      newList.save();
      res.redirect("/"+typeOfList);
    }
    else{
      // show existing list
      res.render("list",{listTitle:result.name,newListItems:result.items});
    }
  });
  
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
