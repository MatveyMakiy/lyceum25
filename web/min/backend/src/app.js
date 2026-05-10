import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import postsRoutes from './routes/posts.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

app.use('/api', authRoutes);
app.use('/api', groupsRoutes);
app.use('/api', postsRoutes);
app.use('/api', usersRoutes);

export default app;
