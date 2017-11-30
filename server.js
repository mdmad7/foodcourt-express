import express from 'express';
import bodyParser from 'body-parser';

const server = express();
const PORT = 4000;

server.listen(PORT, () => console.log(`API Running on localhost:${PORT}`));
