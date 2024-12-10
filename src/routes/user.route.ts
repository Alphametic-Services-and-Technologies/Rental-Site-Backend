import { Router } from 'express';
import userController from '../controllers/user.controller';
import validateDto, { ValidationScope } from '../utils/validateDto';
import { UserSignUpInputModel } from '../inputModels/UserSignUpInputModel';
import { UserLoginInputModel } from '../inputModels/UserLoginInputModel';
import checkAuth from '../middlewares/checkAuth';
import restrictTo from '../middlewares/restrictTo';
import { UserRole } from '../entities/User';
import { UpdateProfileInputModel } from '../inputModels/UpdateProfileInputModel';
import { UpdatePasswordInputModel } from '../inputModels/UpdatePasswordInputModel';
import { ResetPasswordInputModel } from '../inputModels/ResetPasswordInputModel';
import { GetUsersQueryParams } from '../inputModels/GetUsersQueryParams';
import { UpdateUserInputModel } from '../inputModels/UpdateUserInputModel';
import uploadImage from '../middlewares/multer';

const userRouter = Router();

// #region noAuthRoutes
userRouter
  .route('/signup')
  .post(
    uploadImage.single('avatar'),
    validateDto(UserSignUpInputModel),
    userController.registerUser
  );

userRouter
  .route('/login')
  .post(validateDto(UserLoginInputModel), userController.login);

userRouter.route('/forgot-password').post(userController.forgotPassword);

userRouter
  .route('/reset-password/:token')
  .post(validateDto(ResetPasswordInputModel), userController.resetPassword);
// #endregion

userRouter.use(checkAuth);

// #region authRoutes
userRouter
  .route('/me')
  .get(userController.getLoggedInUserDetails)
  .put(
    uploadImage.single('avatar'),
    validateDto(UpdateProfileInputModel),
    userController.updateLoggedInUserDetails
  );

userRouter
  .route('/update-password')
  .patch(validateDto(UpdatePasswordInputModel), userController.updatePassword);
// #endregion

userRouter.use(restrictTo(UserRole.Admin));

// #region adminRoutes
userRouter
  .route('/')
  .get(
    validateDto(GetUsersQueryParams, ValidationScope.Query),
    userController.getUsers
  );

userRouter
  .route('/:id')
  .get(userController.getUser)
  .put(validateDto(UpdateUserInputModel), userController.updateUser)
  .delete(userController.archiveUser);
//#endregion

export default userRouter;
