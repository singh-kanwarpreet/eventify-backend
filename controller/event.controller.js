const Event = require("../models/Event");
const registerationModel = require("../models/Registration");

const eventCreate = async (req, res) => {

  try {
    const {
      imageUrl,
      title,
      description,
      dateTime,
      endTime,
      location,
      mode,
      capacity,
      eligibilityRules, 
    } = req.body;

    const existingEvent = await Event.findOne({
      organizerId: req.user._id,
      title: title,
    });
    if (existingEvent) {
      return res
        .status(400)
        .json({ message: "You have already created an event with this title." });
    }
    const event = await Event.create({
      title,
      description,
      dateTime,
      endTime,
      location,
      mode,
      capacity,
      status: "UPCOMING",           
      organizerId: req.user._id,    
      eligibilityRules: eligibilityRules || { minAge: 0, maxAge: 100 },
      imageUrl,                     
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventGetAll = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventUserRegister = async(req,res)=>{
  const {eventId}=req.params;
  try{
    const registeration=await registerationModel.create({
      userId:req.user._id,
      eventId
    });
    res.status(201).json({
      message:"Registration successful",
      registeration
    });
    const event=await Event.findById(eventId);
    if(event){
      event.availableSeats -= 1;
      await event.save();
    }
  }catch(error){
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { eventCreate, eventGetAll, eventUserRegister };
