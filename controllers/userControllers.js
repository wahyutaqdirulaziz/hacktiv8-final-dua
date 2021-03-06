const bcrypt = require("bcryptjs");
const { User } = require("./../models");
const jwt = require("jsonwebtoken");
const env = require('dotenv').config();

class userController {
  static createUser = (req, res) => {
    let { email, full_name, username, profile_image_url, age, phone_number } =
      req.body;
    let hash = bcrypt.hashSync(req.body.password, 10);
    let input = {
      email: email,
      full_name: full_name,
      username: username,
      password: hash,
      profile_image_url: profile_image_url,
      age: age,
      phone_number: phone_number,
    };
  
    User.create(input)
      .then((data) => {
        res.status(201).json(data);
      })
      .catch((err) => {
        let errCode = 500;
        if (err.name.includes("DatabaseError")) {
          console.log(err);
          errCode = 400;
        }
        res.status(errCode).json(err);
      });
  };

  static signin(req, res) {
    return User
        .findOne({
            where: { email: req.body.email }
        }).then(user => {
            if (!user) {
                return res.status(404).send({
                    auth: false,
                    email: req.body.email,
                    accessToken: null,
                    message: "Error",
                    errors: "User Not Found."
                });
            }

            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) {
                return res.status(401).send({
                    auth: false,
                    email: req.body.email,
                    accessToken: null,
                    message: "Error",
                    errors: "Invalid Password!"
                });
            }

            var token = jwt.sign({
                email: user.email,id : user.id
            }, process.env.SECRET);

            res.status(200).send({
                token: token,
            });
        }).catch(err => {
            res.status(500).send({
                auth: false,
                id: req.body.id,
                accessToken: null,
                message: "Error",
                errors: err
            })
        });
};

  static editUser = (req, res) => {
    let id = req.params.userId;
    let { body } = req;
    User.update(
      {
        email: body.email,
        full_name: body.full_name,
        username: body.username,
        profile_img_url: body.profile_img_url,
        age: body.age,
        phone_number: body.phone_number,
      },
      {
        where: {
          id: id,
        },
        returning: true,
      }
    )
      .then(() => {
        return User.findByPk(id);
      })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ msg: "User tidak ditemukan" });
      });
  };

  static deleteUser = (req, res) => {
    let id = req.params.userId;
    User.destroy({
      where: {
        id: id,
      },
    })
      .then((data) => {
        if (data > 0) {
          res.status(200).json({msg: "User berhasil dihapus!"});
        } else {
          res.status(404).json({ msg: "User tidak ditemukan" });
        }
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  };
}

module.exports = userController;
