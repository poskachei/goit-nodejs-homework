const { Router } = require("express");
const UsersController = require("./users.controller");
const UsersRouter = Router();

UsersRouter.post('/auth/register', UsersController.validateCreatedUser, UsersController.registerNewUser);
UsersRouter.post('/auth/login', UsersController.validateCreatedUser, UsersController.signIn);
UsersRouter.post('/auth/logout', UsersController.authorize, UsersController.logOut);
UsersRouter.get('/users/current', UsersController.authorize, UsersController.getUserСurrent);


module.exports = UsersRouter;