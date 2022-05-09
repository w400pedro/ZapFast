const { Router } = require('express');
const routes = Router();

const { UserController } = require('../controllers/user-controller');

const UserMasterController = new UserController();

routes.get('/logout', UserMasterController.UserLogout);

routes.get('/', UserMasterController.ShowGroupsMain);

routes.get('/:id', UserMasterController.ShowGroupsMain);

routes.post('/login', UserMasterController.UserLogin);

routes.post('/register', UserMasterController.UserRegister);

module.exports = routes;







