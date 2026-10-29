import express from 'express';

import errorHandler from './middleware/errorHandler.js';
import readingListRoutes from './routes/readingListRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/users/:userId/reading-list', readingListRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

