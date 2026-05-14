import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import postsRoutes from './routes/posts.routes.js';
import usersRoutes from './routes/users.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import likesRoutes from './routes/likes.routes.js';
import eventsRoutes from './routes/events.routes.js';
import chatsRoutes from './routes/chats.routes.js';

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
app.use('/api', commentsRoutes);
app.use('/api', likesRoutes);
app.use('/api', eventsRoutes);
app.use('/api', chatsRoutes);

export default app;
