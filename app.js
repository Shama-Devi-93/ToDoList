
//To use express.js require express
const express= require("express");
//To access the elements from html, ejs file require body-parser
const bodyParser= require("body-parser");
const app=express();
const dotenv=require("dotenv");
dotenv.config();
//To create database using mongo inserting mongoose
const mongoose =require("mongoose");

//To handle casing like uppercase,capitalize require lodash
const _=require("lodash");

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));

//Accessing style.css file from public folder
app.use(express.static("public"));

//Conncetion with Mongo Atlas to keep track of database
mongoose.connect(process.env.DB_URI);

//Database Schema
const itemsSchema={
  name: String
};
const Item =mongoose.model("Item",itemsSchema);

 const listSchema={
   name: String,
   items: [itemsSchema]
 }
const List=mongoose.model("List",listSchema);

// var today=new Date();
// var options={
//   weekday:"long",
//   day:"numeric",
//   month:"long"
// };
// var day=today.toLocaleDateString("en-US",options);

//Getting our main route 
app.get("/",function(req,res){ 
  Item.find({},function(err,items){
    res.render("list",{listTitle:"Today",newListItems:items});
  }); 
});


//Creating Route for other lists
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new List
        const list=new List({
          name:customListName
        });
       list.save();
       res.redirect("/"+customListName);
      }else{
      //show an existing list
      res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
    }
  }  
  });
    
})

//posting after clicking add button
app.post("/",function(req,res){
const itemName= req.body.newItem;
const listName=req.body.list;
const item= new Item({
  name:itemName
});
if(listName==="Today"){
  item.save();
  res.redirect("/");
}
else{
List.findOne({name:listName},function(err,foundList){
  foundList.items.push(item);
  foundList.save();
  res.redirect("/"+listName);
})
}
});

//For deleting to-do item from the list
app.post("/delete",function(req,res){
 const checkeditemId= req.body.checkbox;
 const listName=req.body.listName;
 if(listName==="Today"){
  Item.findByIdAndRemove(checkeditemId,function(err){
    if(!err){
      res.redirect("/");
    }
  })
 }
 else{
   List.findOneAndUpdate(
     {name:listName},
     {$pull: {items: {_id:checkeditemId}}},
     function(err,foundList){
       if(!err){
         res.redirect("/"+listName);
       }
     }
     )
 }
})

//Displaying on port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}

app.listen(port,function(){
  console.log("Server is running on port 2000");
});
