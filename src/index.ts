import express from "express";
import userRouter from "./routes/user.route";
import transactionRouter from "./routes/transaction.route" 
import cors from "cors";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "deployed link"],
  credentials: true,
}));

app.use(express.json());

app.use(express.json()); 
app.use("/api/user", userRouter); 
app.use("/api/transaction", transactionRouter);
app 


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.get('/', (req, res) => {
    res.json({
      message: "Alvative API is running"
    });
});

// app.use(cors({
//   origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
//   credentials: true,
// }));

export default app;


