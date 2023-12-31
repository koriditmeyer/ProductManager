import { Router } from "express";
import upload from "../middlewares/multer.js"; // external middleware -- upload file
import cm from "../routers/cart.router.js";

export const webRouter = Router();
import {EventEmitter} from "events"
var ee = new EventEmitter();

webRouter.post("/uploads", upload.single("image"), (req, res) => {
  res.json({
    file: req.file,
  });
});

webRouter.get("/cart", async (req, res) => {
  /* Fetch Cart Data */
  try {
    const cid = 3; // example of cart id
    const cartResponse = await fetch(`http://localhost:8080/api/carts/${cid}`);
    /* Extract the Error Message from API Response and stop execution of program */
    if (!cartResponse.ok) {
      const errorResponse = await cartResponse.json();
      throw new Error(errorResponse.message); // Use the error message from the API
    }

    const cart = await cartResponse.json();

    /* Fetch Products Data Contained in Cart */

    const cartProductsPromises = cart.products.map(async (cart) => {
      const productResponse = await fetch(
        `http://localhost:8080/api/products/${cart.product}`
      );
      const productDetails = await productResponse.json();
      return {
        ...productDetails,
        quantity: cart.quantity,
      };
    });

    const cartProducts = await Promise.all(cartProductsPromises); // !Await all the promises from the map need to ask why need to use this

    /* Render view with combined data */

    res.render("cart", {
      title: "My Cart",
      cartProducts: cartProducts,
      cid: cid,
    });
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

webRouter.get("/", async (req, res) => {
  /* Fetch Cart Data */
  try {
    /* Fetch all Products Data  */
    const productResponse = await fetch(`http://localhost:8080/api/products/`);
    const products = await productResponse.json();
    res.render("home", { title: "My Products", products: products });
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

webRouter.get("/product/add", async (req, res) => {
  /* Fetch Cart Data */
  try {
    res.render("addProduct", { title: "Add a Product" });
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

webRouter.get("/product/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  /* Fetch Cart Data */
  try {
    /* Fetch all Products Data  */
    const productResponse = await fetch(
      `http://localhost:8080/api/products/${id}`
    );
    /* Extract the Error Message from API Response and stop execution of program */
    if (!productResponse.ok) {
      const errorResponse = await productResponse.json();
      throw new Error(errorResponse.message); // Use the error message from the API
    }
    const product = await productResponse.json();
    res.render("productDetail", { product: product });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("error", { error: error.message });
  }
});

webRouter.get("/chat", async (req, res) => {
  /* Fetch Cart Data */
  res.render("chat", { script: "./chat" });
});

webRouter.get("/realTimeProducts", async (req, res) => {
  try {
    const productResponse = await fetch(`http://localhost:8080/api/products/`);
    const products = await productResponse.json();
    req["io"].emit("products", products);
    res.render("realTimeProducts", {
      script: "./realTimeProducts",
      title: "My Products"
    });
    /* Fetch all Products Data  */
    ee.on('internal-api-product-post',async (event)=>{
      const productResponse = await fetch(`http://localhost:8080/api/products/`);
      const products = await productResponse.json();
      req["io"].emit("products", products);
    })
    //req["io"].emit("products", products);
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});
