const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDirectory = path.join(__dirname, '../uploads/resumes');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const generatedName = `resume-${Date.now()}-${crypto.randomUUID()}${extension}`;
    cb(null, generatedName);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeTypeAllowed = allowedMimeTypes.has(file.mimetype);
  const extensionAllowed = allowedExtensions.has(extension);

  if (!mimeTypeAllowed || !extensionAllowed) {
    return cb(
      new Error(
        'Invalid resume format. Only PDF, DOC and DOCX files are allowed.'
      )
    );
  }

  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = {
  uploadResume,
  uploadDirectory,
};
