const { Router } = require("express");
const UsersController = require("./users.controller");
const UsersRouter = Router();
const upload = require("../storage");

UsersRouter.post('/users/register', UsersController.validateCreatedUser, upload.single('avatar'), UsersController.createAvatarURL, UsersController.minifyImage, UsersController.registerNewUser);
UsersRouter.post('/users/login', UsersController.validateCreatedUser, UsersController.signIn);
UsersRouter.post('/users/logout', UsersController.authorize, UsersController.logOut);
UsersRouter.get('/users/current', UsersController.authorize, UsersController.getUserСurrent);
UsersRouter.patch('/user/avatar', UsersController.authorize, upload.single('avatar'), UsersController.minifyImage, UsersController.updateUser)


module.exports = UsersRouter;