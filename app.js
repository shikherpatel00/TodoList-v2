//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shikherpatel:venomsnake@cluster0.tdyyabw.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema={
  name: String
};

const Item=mongoose.model("Item", itemSchema);

const item1=new Item({
  name: "Welcome to your Todolist!"
});
const item2=new Item({
  name: "Hit the + button to add a new item."
});
const item3=new Item({
  name: "<-- Hit this button to delete an item."
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name: String,
  items:[itemSchema]
}
const List=mongoose.model("List", listSchema);

async function getItems(){
  const Items = await Item.find({});
  return Items;
}

app.get("/", function(req, res) {

  getItems().then(function(foundItems){
    if(foundItems.length === 0){
        Item.insertMany(defaultItems).then(function(){
          console.log("Successfully added items");
        }).catch(function(err){
          console.log(err);
        });
        res.redirect("/");
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })
});

app.get("/:customRoute",function(req,res){
  const customListName =  _.capitalize(req.params.customRoute);

  List.findOne({name: customListName}).then(function(foundList){
    
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }
    else{
      res.render("list",{listTitle: foundList.name , newListItems:foundList.items})
    }
  }).catch(function(err){
    console.log(err);
  });
  


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item=new Item({
    name: itemName
  });

  if(listName==="Today")
    {
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      }).catch(function(err){
        console.log(err);
      });
    }
});

app.post("/delete", function(req, res){
  const checkedID=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndDelete(checkedID).then(function(){
      console.log("Successfully deleted");
    }).catch(function(err){
      console.log(err);
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedID}}}).then(function(foundList){
      res.redirect("/"+listName);
    });
  }

})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
