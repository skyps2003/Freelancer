const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create cvs directory if it doesn't exist
const cvsDir = './uploads/cvs';
if (!fs.existsSync(cvsDir)) {
    fs.mkdirSync(cvsDir, { recursive: true });
}

// Set storage engine for CVs
const storage = multer.diskStorage({
    destination: cvsDir,
    filename: function (req, file, cb) {
        cb(null, 'cv-' + Date.now() + '-' + file.originalname);
    }
});

// Init upload for CVs
const uploadCV = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type - only PDF allowed
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = file.mimetype === 'application/pdf';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Solo se permiten archivos PDF para CVs');
    }
}

module.exports = uploadCV;
