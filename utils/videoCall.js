const crypto = require('crypto');

/**
 * Generate a unique video call link for an appointment
 * @param {string} appointmentId - The appointment ID
 * @param {string} doctorId - The doctor ID  
 * @param {string} patientName - The patient name
 * @returns {object} - Object containing video call ID and link
 */
const generateVideoCallLink = (appointmentId, doctorId, patientName) => {
    try {
        // Generate unique video call ID using appointment data
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(16).toString('hex');
        const dataToHash = `${appointmentId}-${doctorId}-${patientName}-${timestamp}`;
        const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
        
        // Create a shorter, more user-friendly video call ID
        const timestampStr = timestamp.toString();
        const videoCallId = `vc-${hash.substring(0, 12)}-${timestampStr.substring(timestampStr.length - 6)}`;
        
        // Generate the video call link (you can customize this domain)
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const videoCallLink = `${baseUrl}/video-call/${videoCallId}`;
        
        console.log('✅ Generated video call link:', {
            videoCallId,
            videoCallLink,
            appointmentId,
            doctorId
        });
        
        return {
            success: true,
            videoCallId,
            videoCallLink,
            generatedAt: new Date()
        };
    } catch (error) {
        console.error('❌ Error generating video call link:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Validate if a video call ID is valid format
 * @param {string} videoCallId - The video call ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
const validateVideoCallId = (videoCallId) => {
    if (!videoCallId || typeof videoCallId !== 'string') {
        return false;
    }
    
    // Check if it matches our format: vc-{12chars}-{6digits}
    const videoCallRegex = /^vc-[a-f0-9]{12}-[0-9]{6}$/;
    return videoCallRegex.test(videoCallId);
};

/**
 * Extract appointment info from video call ID (for verification)
 * @param {string} videoCallId - The video call ID
 * @returns {object} - Extracted info or null if invalid
 */
const extractInfoFromVideoCallId = (videoCallId) => {
    if (!validateVideoCallId(videoCallId)) {
        return null;
    }
    
    try {
        const parts = videoCallId.split('-');
        const hashPart = parts[1]; // 12 character hash
        const timestampPart = parts[2]; // 6 digit timestamp suffix
        
        return {
            hashPart,
            timestampPart,
            isValid: true
        };
    } catch (error) {
        console.error('Error extracting info from video call ID:', error);
        return null;
    }
};

module.exports = {
    generateVideoCallLink,
    validateVideoCallId,
    extractInfoFromVideoCallId
};

