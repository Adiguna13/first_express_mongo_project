const path = require("path");
const express = require("express");
//untuk override methode yang ada dalam form
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const app = express();
const ErrorHandler = require("./ErrorHandler");

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
//express mengambil data yang dirimkan melalui body request
app.use(express.urlencoded({ extended: true }));
//override atau menggantikan method pada form
app.use(methodOverride("_method"));

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/products", async (req, res) => {
  const { category } = req.query;
  if (category) {
    const products = await Product.find({ category });
    res.render("products/index", { products, category });
  } else {
    const products = await Product.find({});
    res.render("products/index", { products, category: "All" });
  }
});

app.get(
  "/products/create",
  wrapAsync((req, res) => {
    res.render("products/create");
  })
);

app.post(
  "/products",
  wrapAsync(async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.redirect(`/products/${product._id}`);
  })
);

app.get(
  "/products/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render("products/show", { product });
  })
);

app.get(
  "/products/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render("products/edit", { product });
  })
);

app.put(
  "/products/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      runValidator: true,
    });
    res.redirect(`/products/${product._id}`);
  })
);

app.delete(
  "/products/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    res.redirect(`/products`);
  })
);

app.use((err, req, res, next) => {
  console.dir(err);
  if (err.name === "ValidationError") {
    err.status = 400;
    err.message = Object.values(err.errors).map((item) => item.message);
  }
  if (err.name === "CastError") {
    err.status = 404;
    err.message = "Product Not Found";
  }
  next(err);
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log(`Shop App listening on http://127.0.0.1:3000`);
});
