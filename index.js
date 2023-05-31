require("dotenv").config();
const express = require('express')
const cors = require('cors')

const app = express()

const auth = require("./middleware/auth")
const productRouter = require("./routes/productRouter")
const userRouter = require("./routes/userRouter")
const orderRouter = require("./routes/orderRouter")
const indexRouter = require("./routes/indexRouter")

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/products", auth, productRouter);
app.use("/api/orders", auth, orderRouter);
app.use("/api/users", userRouter);
app.use("/api/index", indexRouter);

app.listen({ port: process.env.PORT || "8080", host: "0.0.0.0" }, () => {
    console.log(`Express app listening on port ${process.env.PORT}`)
})