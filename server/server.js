import express from 'express';

import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
