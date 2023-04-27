const User = require("../models/User.model");


async function getUserById(req,res,next){
    try {
        const userId = req.params.id;
        
        const user = await User.find({ _id: userId });
        console.log(user);
        
        res.json(user);
      } catch (er) {
        console.log(er);
        console.log("get isteği hatası:", er);
        next(er);
      }
}

async function getAllUser(req,res){
    try {
        
        const users = await User.find();
        
        
        res.json(users);
      } catch (er) {
        console.log(er);
        console.log("get isteği hatası:", er);
        next(er);
      }
}

async function updateUserById(req,res,next){
  try {
    const updatedUser = await models.user.findByPk(req.params.id);
    updatedUser.update({
      name_surname:req.body.name_surname,
      phone_number:req.body.phone_number,
      image_path:req.body.image_path,
      gender:req.body.gender,
      bio:req.body.bio,
      website:req.body.website
    })
    // updatedUser is the document after update because of new: true
    res.status(200).json({
      message: "User is updated successfully!",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteUser(req, res) {
  try {
    const gonnaDeletedUser = await models.user.findByPk(req.params.id);
    await gonnaDeletedUser.save({
      isActive:  false,
      isDeleted: true
    })
    res.status(200).json({
      message: "User is deleted successfully!",
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteUserPermanent(req, res) {
  try {
    const gonnaDeletedUser = await models.user.findByPk(req.params.id);
    await gonnaDeletedUser.destroy()
    res.status(200).json({
      message: "User is deleted successfully as permanently!",
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports ={
    getUserById,
    getAllUser,
    updateUserById,
    deleteUser,
    deleteUserPermanent
}