const Appointment = require('../models/appoiment');

module.exports={

    // profile get 
    profileGet: async (req, res) => {
        try {
            const email = req.body.lemail || req.query.lemail;
            console.log('[profileGet] Requested profile for email:', email);
            if (!email) {
                console.log('[profileGet] No email provided');
                return res.status(400).json({ message: 'Email (lemail) is required.' });
            }
            const user = await Appointment.findOne({ email });
            if (!user) {
                console.log('[profileGet] No user found for email:', email);
                return res.status(404).json({ message: 'User not found.' });
            }
            // Map DB fields to frontend fields
            const profile = {
                name: user.name,
                age: user.age,
                designation: user.designation || '',
                location: user.location,
                image: user.image || '',
                phone: user.number,
                lemail: user.email
            };
            console.log('[profileGet] Profile found:', profile);
            return res.status(200).json({ profile });
        } catch (error) {
            console.error('[profileGet] Error:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // profile update 
    profileUpdate: async (req, res) => {
        try {
            const { name, age, designation, location, image, phone, email } = req.body;
            console.log('[profileUpdate] Update request for email:', email);
            if (!email) {
                console.log('[profileUpdate] No email provided');
                return res.status(400).json({ message: 'Email (lemail) is required.' });
            }
            const updateFields = {
                name,
                age,
                location,
                number: phone,
            };
            // Only add fields if provided
            if (designation !== undefined) updateFields.designation = designation;
            if (image !== undefined) updateFields.image = image;
            const updatedUser = await Appointment.findOneAndUpdate(
                { email: email },
                { $set: updateFields },
                { new: true }
            );
            if (!updatedUser) {
                console.log('[profileUpdate] No user found for email:', email);
                return res.status(404).json({ message: 'User not found.' });
            }
            console.log('[profileUpdate] Profile updated:', updateFields);
            return res.status(200).json({ message: 'Profile updated successfully.', profile: updatedUser });
        } catch (error) {
            console.error('[profileUpdate] Error:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }
}