const path = require('path');

const express = require('express')

const app = express();

const router = express.Router();


router.use(express.static(path.resolve(__dirname, 'dist'), {
	extensions : ['html']
}))

app.use(router);

app.listen(8000);


