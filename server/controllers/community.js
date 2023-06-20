const Community = require("../models/Community.model");
const CommunityRequest = require("../models/CommunityRequest.model");
const User = require("../models/User.model");
const Room = require("../models/Room.model");

async function createCommunity(req, res, next) {
  try {
    const { name, description } = req.body;
    const owner = req.user.id;

    const newCommunity = new Community({ name, description, owner });
    await newCommunity.save();

    await User.findByIdAndUpdate(
      owner,
      {
        community: newCommunity._id,
      },
      { new: true } // return the updated document
    );

    const admin = owner;

    try {
      await Room.create({
        name,
        admin,
        members: [admin],
        isCommunity: newCommunity._id,
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

    const community = await Community.find({ _id: communityId });
    res.json(community);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

async function updateCommunityById(req, res, next) {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      res.status(404).json({
        message: "Community not found!",
      });
      return;
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || community.name,
        image: req.body.image || community.image,
        description: req.body.description || community.description,
      },
      { new: true } // return the updated document
    );

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
      user: userId,
      community: communityId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const joinRequest = new CommunityRequest({
      user: userId,
      community: communityId,
    });
    await joinRequest.save();

    res.status(201).json(joinRequest);
  } catch (err) {
    next(err);
  }
}

async function handleJoinRequest(req, res, next) {
  try {
    const requestId = req.params.requestId;
    const action = req.body.action;

    const request = await CommunityRequest.findById(requestId).populate(
      "user community"
    );
    const room = await Room.findOne({ isCommunity: request.community._id });
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.community.owner.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to manage this community" });
    }

    if (action === "accept") {
      console.log(request);
      request.status = "accepted";
      request.community.members.push(request.user);
      await User.findByIdAndUpdate(
        request.user._id,
        {
          community: request.community._id
        },
        { new: true } // return the updated document
      );
      room.members.push(request.user._id);
      await request.community.save();
      await room.save();
    } else if (action === "reject") {
      request.status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await request.save();
    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
}

async function getJoinRequests(req, res, next) {
  try {
    const communityId = req.params.communityId;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.owner.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to manage this community" });
    }

    const joinRequests = await CommunityRequest.find({
      community: communityId,
      status: "pending",
    }).populate("user");

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
