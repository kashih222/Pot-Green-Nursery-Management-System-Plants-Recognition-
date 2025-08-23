const express = require('express');
const registerUserRouter = express.Router();
const { registerUserInsert } = require('../../Controllers/Admin/userRegisterController');

registerUserRouter.post("/insert", registerUserInsert);

module.exports = registerUserRouter;
