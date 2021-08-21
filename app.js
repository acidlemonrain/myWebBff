const express = require('express')
const app = express() 
const path = require('path');
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const showdown  = require('showdown')
const converter = new showdown.Converter()
app.use(cors({
    "origin": "http://localhost:3000",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('dist'));
app.get('/', (req, res) => {
	res.sendFile('index.html', {
		root: path.join(__dirname, './dist')
	});
});


app.get('/blogs',(req,res)=>{
    const titles = fs.readdirSync(path.join(__dirname,'contents')) 
    res.json(titles)
})

app.get('/blog',(req,res)=>{
    const {id} = req.query
    const data = fs.readFileSync(path.join(__dirname,'contents',id)).toString()
    res.send(converter.makeHtml(data))
})

app.listen(80)