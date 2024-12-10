import multer from 'multer';
import AppError from '../utils/AppError';
import httpStatus from 'http-status';
import { v4 as uuidV4 } from 'uuid';

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, process.env.USER_IMAGES_STORAGE_PATH!);
  },
  filename(req, file, callback) {
    const extension = file.mimetype.split('/')[1];

    let imageId;

    if (req.user) {
      imageId = req.user.id;
    } else {
      imageId = uuidV4();
    }

    const imageName = `user-${imageId}-${Date.now()}.${extension}`;

    callback(null, imageName);
  },
});

const uploadImage = multer({
  storage,
  fileFilter(_req, file, callback) {
    if (file.mimetype.startsWith('image')) {
      callback(null, true);
    } else {
      callback(new AppError('File is not an image', httpStatus.BAD_REQUEST));
    }
  },
});

export default uploadImage;
