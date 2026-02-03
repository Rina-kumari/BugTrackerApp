import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import routes from './routes/indexRoute.js'

dotenv.config({ quiet: true });

const app =express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET","POST","DELETE","PUT"],
    allowedHeaders: ["Content-Type","Authorization"],
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
    res.status(200).json({
        message: "Welcome to Task Management API",
    });
});

app.use("/api-v1", routes);

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({message: "Internal server error"});
});

app.use((req,res)=>{
    res.status(404).json({message: "Not found"});
});

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
})