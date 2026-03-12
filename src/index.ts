import express from "express";
import userRouter from "./routes/user.route";
import transactionRouter from "./routes/transaction.route" 

const app = express();

app.use(express.json()); 
app.use("/api/user", userRouter); 
app.use("/api/transaction", transactionRouter); 


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;


