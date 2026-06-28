import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React dev frontend can talk to it directly if proxy isn't used
app.use(cors());

// Body parser
app.use(express.json());

// Mount central API router
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Garage ERP API Server is running.' });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Garage ERP Server listening on PORT ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`=========================================`);
});
