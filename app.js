const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require('dotenv/config');

const userRoute = require('./routes/UserRoute');
const auth = require('./routes/Auth');
const profileRoute = require('./routes/ProfileRoute');
const postRoute = require('./routes/PostRoute');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(userRoute);
app.use(auth);
app.use(profileRoute);
app.use(postRoute);

mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true ,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
mongoose.connection.on('connected',()=>{
    console.log('DB Connected');
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening in http://localhost:${PORT}`));

