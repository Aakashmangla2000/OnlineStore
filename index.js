require("dotenv").config();
const express = require('express')
const cors = require('cors')
const session = require('express-session')

const DB = require('./db');

const app = express()
const port = 3000

const auth = require("./middleware/auth")
const productRouter = require("./routes/productRouter")
const userRouter = require("./routes/userRouter")
const orderRouter = require("./routes/orderRouter")

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ secret: 'Your_Secret_Key', resave: true, saveUninitialized: true }))

app.use("/api/products", productRouter);
app.use("/api/orders", auth, orderRouter);
app.use("/api/users", userRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})