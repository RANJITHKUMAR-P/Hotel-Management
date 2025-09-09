import cors from "cors";

// Allow exact domains
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://hotel-management-puce-tau.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
