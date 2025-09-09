app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://hotel-management-puce-tau.vercel.app/", // ADD YOUR FRONTEND URL
    "https://hotel-management-*.vercel.app"         // ADD WILDCARD FOR ALL VERCEL SUBDOMAINS
  ],
  credentials: true
}));