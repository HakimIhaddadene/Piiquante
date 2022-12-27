const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'pictures');
    },
    filename: (req, file, callback) => {
        // Remplacement des espaces par des tirets
        const name = file.originalname.split(' ').join('-');        
        const extension = MIME_TYPES[file.mimetype];
        // Ajout d'un timestamp
        callback(null, `${name}${Date.now()}.${extension}`);
    }
});

module.exports = multer({storage: storage}).single('image');