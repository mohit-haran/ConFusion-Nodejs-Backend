const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req, file , cb) =>{
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) =>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|PNG|JPEG|GIF)$/)){
        return cb(new Error('You can upload only image files!'), false);
    }
    else {
        cb(null, true);
    }
};

const upload = multer({storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req,res)=>{
    res.statusCode = 403;
    res.send('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('image'), (req,res) =>{

    res.setHeader('Content-Type','application/json');
    res.status(200).json(req.file);

})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res)=>{
    res.statusCode = 403;
    res.send('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res)=>{
    res.statusCode = 403;
    res.send('DELETE operation not supported on /imageUpload');
})

module.exports = uploadRouter;