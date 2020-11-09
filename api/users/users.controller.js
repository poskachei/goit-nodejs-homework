const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const Joi = require('joi');
const { promises: fsPromises } = require('fs');
const path = require('path');
const Avatar = require('avatar-builder');
const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');


const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const UserModel = require("./users.model");

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const TOKEN_SECRET = process.env.TOKEN_SECRET;

class UsersController {

    async getUserСurrent(req,res,next){
        try {
            const user = req.user;
       
            return res.status(200).send({user:{
              email:user.email,
              subscription:user.subscription,
              avatarURL:user.avatarURL
            }})
        } catch (error) {
          next(error)
        }
    }

    async updateUser(req, res, next) {
      try {
        const newAvatarUrl = 'http://localhost:3000/images/' + req.file.filename
        const id = req.user.id;
        req.user.avatarURL = newAvatarUrl;
        const updateContact = await UserModel.findByIdAndUpdate(id, req.user);
  
        if (!updateContact) {
          res.status(400).send({ message: 'Not found' });
        }
        res.status(200).send({ message: 'contact updated' , avatarURL: newAvatarUrl});
      } catch (err) {
        next(err);
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
                  avatarURL: 'http://localhost:3000/images/' + req.file.filename,
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

    async createAvatarURL(req, res, next) {
        if (req.file) {
            return next();
        }
        try {
            const randomNumber = (Math.random() * (100 - 10) + 100).toString();
            const pathFolder = Avatar.Cache.folder("../tmp");
            const avatar = await Avatar.triangleBuilder(randomNumber, { cache: pathFolder });
            await fsPromises.writeFile(pathFolder + '/' + filename, avatar);

        req.file = {
          destination: pathFolder,
          filename,
          path: path.join(pathFolder + '/' + filename),
        };
          next();
        } catch (error) {
          console.log(error);
        }   
    }

    async  minifyImage(req, res, next) {
        try {
            const MINIFIED_DIR = "public/images";

            await imagemin([req.file.destination], {
                destination: MINIFIED_DIR,
                plugins: [
                    imageminJpegtran(),
                    imageminPngquant({
                        quality: [0.6, 0.8]
                    })
                ]
            });
        
        const { filename } = req.file;
        
        req.file = {
            ...req.file,
            path: path.join(MINIFIED_DIR, filename),
            destination: MINIFIED_DIR
        }

        console.log('Finished processing file...');
        } catch(err) {
          console.log(err);
        }

    next();
    }
  
    async verificationUrlToken(req, res, next) {
      try {
        const verificationToken = req.params.verificationToken;
        const userToVerifyted = await UserModel.findOne({ verificationToken });
  
        if (!userToVerifyted) {
          res.status(404).send({ message: 'Not Found ' });
        }
  
        await UsersController.verifyUser(userToVerifyted._id);
  
        res.status(200).send({ message: 'User Verufication Ok' });
      } catch (error) {
        console.log(error);
      }
    }
  
    static async sendMailUser(user) {
      const newTokenUser = await UsersController.saveVerifcationToken(user._id);
  
      const verificationUrl = `http://localhost:3000/auth/verify/${newTokenUser}`;
      try {
        const msg = {
          to: user.email,
          from: process.env.SENDMAILER_USER,
          subject: 'Sending with SendGrid is Fun',
          text: 'and easy to do anywhere, even with Node.js',
          html: `<a href=${verificationUrl}> ${verificationUrl}</a>`,
        };
  
        return sgMail.send(msg);
      } catch (error) {
        console.log(error);
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
    
    static async saveVerifcationToken(userId) {
      const token = uuidv4();
      const { verificationToken } = await UserModel.findByIdAndUpdate(
        userId,
        {
          verificationToken: token,
        },
        { new: true },
      );
  
      return verificationToken;
    }
  
    static async verifyUser(userId) {
      await UserModel.findByIdAndUpdate(userId, {
        status: 'verified',
        verificationToken: null,
      });
  
      return 'success';
    }
 
}



module.exports = new UsersController;