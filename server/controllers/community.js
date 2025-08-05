const Community = require("../models/Community.model");
const CommunityRequest = require("../models/CommunityRequest.model");
const User = require("../models/User.model");
const Room = require("../models/Room.model");

async function createCommunity(req, res, next) {
  try {
    const { name, description } = req.body;
    const owner = req.user.id;

    const newCommunity = await Community.create({ name, description, ownerId: owner });

    await User.update(
      { communityId: newCommunity.id },
      { where: { id: owner } }
    );

    const admin = owner;

    try {
      await Room.create({
        name,
        adminId: admin,
        communityId: newCommunity.id,
      });
      return res.status(201).json(newCommunity);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create a room" });
    }
  } catch (err) {
    next(err);
  }
}

async function getCommunityById(req, res, next) {
  try {
    const communityId = req.params.id;

    const community = await Community.findByPk(communityId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'image']
        }
      ]
    });
    res.json(community);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

async function updateCommunityById(req, res, next) {
  try {
    const community = await Community.findByPk(req.params.id);
    if (!community) {
      res.status(404).json({
        message: "Community not found!",
      });
      return;
    }

    const updatedCommunity = await community.update({
      name: req.body.name || community.name,
      image: req.body.image || community.image,
      description: req.body.description || community.description,
    });

    res.status(200).json({
      message: "User is updated successfully!",
      updatedCommunity,
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function sendJoinRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const communityId = req.params.communityId;

    const existingRequest = await CommunityRequest.findOne({
      where: {
        userId: userId,
        communityId: communityId,
      }
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const joinRequest = await CommunityRequest.create({
      userId: userId,
      communityId: communityId,
    });

    res.status(201).json(joinRequest);
  } catch (err) {
    next(err);
  }
}

async function handleJoinRequest(req, res, next) {
  try {
    const requestId = req.params.requestId;
    const action = req.body.action;

    const request = await CommunityRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'ownerId']
        }
      ]
    });
    const room = await Room.findOne({ 
      where: { communityId: request.community.id }
    });
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.community.ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to manage this community" });
    }

    if (action === "accept") {
      console.log(request);
      await request.update({ status: "accepted" });
      await User.update(
        { communityId: request.community.id },
        { where: { id: request.user.id } }
      );
      // Add user to room through UserRoom association\n      const { UserRoom } = require('../models');\n      await UserRoom.create({\n        userId: request.user.id,\n        roomId: room.id\n      });
    } else if (action === "reject") {
      await request.update({ status: "rejected" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
}

async function getJoinRequests(req, res, next) {
  try {
    const {communityId} = req.params;
    console.log(communityId);
    const community = await Community.findByPk(communityId);
    console.log(community);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to manage this community" });
    }

    const joinRequests = await CommunityRequest.findAll({
      where: {
        communityId: communityId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'image']
        }
      ]
    });

    res.status(200).json(joinRequests);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateCommunityById,
  createCommunity,
  sendJoinRequest,
  handleJoinRequest,
  getJoinRequests,
  getCommunityById,
};
