const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const Joi = require('joi');

const UserModel = require("./users.model");

require('dotenv').config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;

class UsersController {

    async getUserСurrent(req,res,next){
      try {
          const user = req.user;
       
          return res.status(200).send({user:{
              email:user.email,
              subscription:user.subscription
          }})
      } catch (error) {
        next(error)
      }
    }

    async registerNewUser(req, res, next) {
        try {
            const {email, password} = req.body;
            const createdUser = await UserModel.findOne({ email });

            if (createdUser) {
              return res.status(409).send({ message: "Error: Email in use" });
            }

            const hashPassword = await bcrypt.hash(password, 6);

            await UserModel.create({email, password: hashPassword})

            return res.status(201).send({
              user: {
                  email,
                  subscription: "free"
              }
          })
        } catch (err) {
          next(err);
        }
    }

    async signIn(req, res, next) {
        try {
            const {email, password} = req.body;
            const user = await UserModel.find({ email });
            const hashPassword = await bcrypt.compare(password, user.password)

            if (!user || !hashPassword) {
              return res.status(401).send({ message: "Email or password is wrong" });
            }

            const token = await jwt.sign({id: user.id, email: user.email}, TOKEN_SECRET, { expiresIn: '1h' });
            const updatedUser = await UserModel.findByIdAndUpdate(user.id, { token }, { new: true });


            return res.status(200).send(UsersController.validateUserResponse([updatedUser]))
        } catch (err) {
          next(err);
        }
    }

    async logOut(req, res, nexy) {
        try {           
            const id = req.user.id;
            await UserModel.findByIdAndUpdate(id, { token: null }, { new: true })
            return res.status(204).end()
        } catch (err) {
          next(err);
        }
    }

    async authorize(req, res, next) {
      try {
          const authorizationHeader = req.get('Authorization') || '';

          let token;
          if (authorizationHeader) {
              token = authorizationHeader.split(' ')[1];
          }

          let userId;
          try {
              userId = jwt.verify(token, process.env.TOKEN_SECRET).id;
          } catch (err) {
              console.log(err)
          }

          const user = await UserModel.findById(userId)
          if (!user || user.token !== token) {
              return res.status(401).send({
                  message: "Not authorized"
              })
          }

          req.user = user;

          next()

      } catch (err) {
        next(err)
      }
  }

    validateCreatedUser(req, res, next) {
      const rulesSchema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }); 

      UsersController.checkErrorValidation(rulesSchema, req, res ,next);
    }

    static validateUserResponse(users) {
      return users.map(({token, email, subscription}) => {
        return {
          token,
          user: {
            email,
            subscription
          }
        }  
      })
    }

    static checkErrorValidation(schema, req, res, next) {
      const { error } = schema.validate(req.body);
      if (error) {
          return res.status(400).send({ message: "Ошибка от Joi или другой валидационной библиотеки" });
      }
      next();
  }

}

module.exports = new UsersController;