require("dotenv").config();
const express = require('express')
const cors = require('cors')
const session = require('express-session')

const DB = require('./db');
const client = require("./elasticClient")
const postsRouter = require("./routes/postsRouter")
const app = express()
// const port = 3000

const auth = require("./middleware/auth")
const productRouter = require("./routes/productRouter")
const userRouter = require("./routes/userRouter")
const orderRouter = require("./routes/orderRouter")

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ secret: 'Your_Secret_Key', resave: true, saveUninitialized: true }))

app.use("/api/products", auth, productRouter);
app.use("/api/orders", auth, orderRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postsRouter);

// client.info()
//     .then(response => console.log(response))
//     .catch(error => console.error(error))

app.listen({ port: process.env.PORT || "8080", host: "0.0.0.0" }, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})