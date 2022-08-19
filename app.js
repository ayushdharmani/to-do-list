const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();



let workItems =[];
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ayush:Dharmani123@cluster0.t8gff.mongodb.net/todolistDB", {useNewUrlParser: true},{useUnifiedTopology: true});

const itemsSchema ={
    name: String
};

const Item =mongoose.model("Item", itemsSchema);

const item1  = new Item({
    name: "Welcome to your todolist"
});

const item2  = new Item({
    name: "Hit the button"
});

const item3  = new Item({
    name: "How are you??"
});

const defaultItems = [item1,item2,item3];




app.get("/", function(req, res)
{
    Item.find({}, function(err, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err)
            {
            if(err)
            {
                console.log(err);
            }else{
                console.log("Success");
            }
            });
            res.redirect("/");
        }else{
            res.render("list", {
                ListTitle: "Today", newListItems: foundItems
            });
        }
        
    });
 
});

app.post("/", function(req, res)
{
    const itemName = req.body.item;
    const listname = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listname == "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listname}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listname);
        })
    }

});

app.post("/delete",function(req,res)
{
    const checkedItemId=req.body.checkbox;
    const listName =req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err)
            {
                console.log("Successfull");
                res.redirect("/");
            }
    });
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+ listName);
            }
        });
    }
   
});

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            }else
            {
                res.render("list", {ListTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});

app.post("/work",function(req,res)
{
    let item = req.body.item;
    workItems.push(item);
    res.redirect("/work");
});
app.listen(process.env.PORT || 3000, function()
{
    console.log("Server Started");
});