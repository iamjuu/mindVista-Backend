const { v4: uuidv4 } = require("uuid");
module.exports={

VideoCallLink:(req,res)=>{
      try {
        const uniqueId = uuidv4();
        const videoCallLink = `https://your-video-call-platform.com/call/${uniqueId}`;
        res.status(200).json({ videoCallLink });
      } catch (error) {
        res.status(500).json({ message: "Error generating video call link" });
      }


    }

}