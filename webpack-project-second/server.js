let express = require('express');

let app = express();

app.get('/s', (req, res) => {
	res.json({name: '刘小夕'});
});

app.listen();