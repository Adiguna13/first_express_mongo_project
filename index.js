const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const app = express();

/** Models */
const Product = require("./models/product");

mongoose
  .connect("mongodb://127.0.0.1:27017/shop_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/products", async (req, res) => {
  const products = await Product.find({});
  res.render("products/index", { products });
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const products = await Product.findById(id);
  res.render("products/show", { products });
});

app.listen(3000, () => {
  console.log(`Shop App listening on http://127.0.0.1:3000`);
});
