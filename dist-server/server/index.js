import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import routes from './routes';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// API Routes
app.use('/api', routes);
// Serve static files from the React app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let distPath = path.join(__dirname, '../dist');
// If in production (running from dist-server/server), the path is one level deeper
if (!fs.existsSync(distPath)) {
    distPath = path.join(__dirname, '../../dist');
}
app.use(express.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
