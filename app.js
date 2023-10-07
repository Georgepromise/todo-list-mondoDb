//jshint esversion:6
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import _ from 'lodash';

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-promise:EoYmd1NQLtUCtEpr@cluster0.gchhwnl.mongodb.net/todolistDB", {useNewUrlParser: true});

const ItemSchema = {
  name: String
};

const Item = mongoose.model("item", ItemSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to aff a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [ItemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
 
  Item.find({}).then(function(foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function () {
        console.log("Successfully saved default items to DB");
        }).catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  // List.findOne({name: customListName}, function(err, foundList){
  //   if (!err){
  //     if (!foundList){
  //       console.log("Doesn't exist!");
  //     } else {
  //       console.log("Exists!");
  //     }
  //   }
  // });

  List.findOne({
    name: customListName})
  .then((foundList) => {
    if (!foundList) {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }

    if (foundList) {
      //Show an existing file

      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  })
  .catch((err) => console.log(err));

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
    
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });

    }
  });

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(function () {
        console.log("Successfully removed");
    })
    .catch(function (err) {
        console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then((foundList) => {
        res.redirect("/" + listName);      
    });
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
