const { Doctor, Appointment, Profile, Review } = require('../models');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Profile.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({
      status: 'confirmed',
      paymentStatus: 'completed'
    });

    // Get today's appointments
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayAppointments = await Appointment.countDocuments({
      date: { $regex: new RegExp(todayStr, 'i') }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        completedAppointments,
        todayAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get all doctors with their statistics
exports.getDoctorsWithStats = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('name email specialization experience phone profilePicture')
      .lean();

    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        // Get total patients (unique appointments)
        const appointments = await Appointment.find({ 
          doctor: doctor._id 
        }).lean();
        
        const totalPatients = appointments.length;

        // Get total income from completed appointments
        const completedAppointments = await Appointment.find({
          doctor: doctor._id,
          paymentStatus: 'completed'
        }).lean();

        const totalIncome = completedAppointments.reduce(
          (sum, apt) => sum + (parseFloat(apt.amount) || 0), 
          0
        );

        // Get average rating (using overall reviews since Review model doesn't have doctor ref)
        const allReviews = await Review.find({ isActive: true }).lean();
        const avgRating = allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 4.5; // Default rating

        // Get monthly income data (last 6 months)
        const monthlyIncome = await getMonthlyIncome(doctor._id);
        
        // Get patient growth data (last 6 months)
        const patientGrowth = await getPatientGrowth(doctor._id);

        return {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          experience: doctor.experience,
          phone: doctor.phone,
          profileImage: doctor.profilePicture,
          totalPatients,
          totalIncome,
          avgRating: parseFloat(avgRating.toFixed(1)),
          reviewCount: allReviews.length,
          monthlyIncome,
          patientGrowth
        };
      })
    );

    res.status(200).json({
      success: true,
      data: doctorsWithStats
    });
  } catch (error) {
    console.error('Error fetching doctors with stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors statistics',
      error: error.message
    });
  }
};

// Get doctor statistics by ID
exports.getDoctorStats = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get total patients
    const appointments = await Appointment.find({ 
      doctor: doctorId 
    }).lean();
    
    const totalPatients = appointments.length;

    // Get total income
    const completedAppointments = await Appointment.find({
      doctor: doctorId,
      paymentStatus: 'completed'
    }).lean();

    const totalIncome = completedAppointments.reduce(
      (sum, apt) => sum + (parseFloat(apt.amount) || 0), 
      0
    );

    // Get average rating
    const allReviews = await Review.find({ isActive: true }).lean();
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 4.5;

    // Get monthly data
    const monthlyIncome = await getMonthlyIncome(doctorId);
    const patientGrowth = await getPatientGrowth(doctorId);

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          profileImage: doctor.profilePicture
        },
        totalPatients,
        totalIncome,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: allReviews.length,
        monthlyIncome,
        patientGrowth
      }
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor statistics',
      error: error.message
    });
  }
};

// Get recent appointments
exports.getRecentAppointments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('doctor', 'name specialization profilePicture')
      .lean();

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching recent appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent appointments',
      error: error.message
    });
  }
};

// Get financial overview
exports.getFinancialOverview = async (req, res) => {
  try {
    const completedAppointments = await Appointment.find({
      paymentStatus: 'completed'
    }).lean();

    const totalRevenue = completedAppointments.reduce(
      (sum, apt) => sum + (parseFloat(apt.amount) || 0),
      0
    );

    // Get monthly revenue (last 6 months)
    const monthlyRevenue = await getMonthlyRevenue();

    // Get today's revenue
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayAppointments = await Appointment.find({
      paymentStatus: 'completed',
      date: { $regex: new RegExp(todayStr, 'i') }
    }).lean();

    const todayRevenue = todayAppointments.reduce(
      (sum, apt) => sum + (parseFloat(apt.amount) || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        totalCompletedAppointments: completedAppointments.length,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial overview',
      error: error.message
    });
  }
};

// Helper function to get monthly income for a doctor
async function getMonthlyIncome(doctorId) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const monthPadded = month.toString().padStart(2, '0');

    // Match dates in format YYYY-MM or DD-MM-YYYY or similar
    const appointments = await Appointment.find({
      doctor: doctorId,
      paymentStatus: 'completed',
      $or: [
        { date: { $regex: new RegExp(`${year}-${monthPadded}`, 'i') } },
        { date: { $regex: new RegExp(`${monthPadded}-${year}`, 'i') } }
      ]
    }).lean();

    const income = appointments.reduce(
      (sum, apt) => sum + (parseFloat(apt.amount) || 0), 
      0
    );

    monthlyData.push({
      name: months[targetDate.getMonth()],
      income: Math.round(income)
    });
  }

  return monthlyData;
}

// Helper function to get patient growth for a doctor
async function getPatientGrowth(doctorId) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const growthData = [];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const monthPadded = month.toString().padStart(2, '0');

    const patients = await Appointment.countDocuments({
      doctor: doctorId,
      $or: [
        { date: { $regex: new RegExp(`${year}-${monthPadded}`, 'i') } },
        { date: { $regex: new RegExp(`${monthPadded}-${year}`, 'i') } }
      ]
    });

    growthData.push({
      name: months[targetDate.getMonth()],
      patients
    });
  }

  return growthData;
}

// Helper function to get monthly revenue
async function getMonthlyRevenue() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const revenueData = [];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const monthPadded = month.toString().padStart(2, '0');

    const appointments = await Appointment.find({
      paymentStatus: 'completed',
      $or: [
        { date: { $regex: new RegExp(`${year}-${monthPadded}`, 'i') } },
        { date: { $regex: new RegExp(`${monthPadded}-${year}`, 'i') } }
      ]
    }).lean();

    const revenue = appointments.reduce(
      (sum, apt) => sum + (parseFloat(apt.amount) || 0), 
      0
    );

    revenueData.push({
      name: months[targetDate.getMonth()],
      revenue: Math.round(revenue)
    });
  }

  return revenueData;
}

// Get work hour analysis (placeholder - can be expanded based on actual tracking)
exports.getWorkHourAnalysis = async (req, res) => {
  try {
    // This is a placeholder - implement based on your actual work hour tracking system
    const data = {
      totalHours: 38.2,
      activeHours: 28.5,
      pauseHours: 6.5,
      extraHours: 3.2,
      weeklyData: [
        { day: 'Mon', hours: 8.5 },
        { day: 'Tue', hours: 7.8 },
        { day: 'Wed', hours: 8.2 },
        { day: 'Thu', hours: 7.5 },
        { day: 'Fri', hours: 6.2 }
      ]
    };

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching work hour analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work hour analysis',
      error: error.message
    });
  }
};

// Get doctors with work progress
exports.getDoctorsWorkProgress = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('name specialization profilePicture')
      .lean();

    // Get appointment data for each doctor to calculate work hours
    const doctorsWithProgress = await Promise.all(
      doctors.map(async (doctor) => {
        // Get appointments for this doctor
        const appointments = await Appointment.find({ 
          doctor: doctor._id 
        }).lean();

        // Calculate completed appointments percentage
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(
          apt => apt.status === 'confirmed' && apt.paymentStatus === 'completed'
        ).length;

        const progressPercentage = totalAppointments > 0 
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0;

        // Determine status based on progress
        let status = 'In Progress';
        if (progressPercentage >= 100) {
          status = 'Completed';
        } else if (progressPercentage === 0) {
          status = 'Not Started';
        }

        // Get initials for avatar
        const nameParts = doctor.name.split(' ');
        const initials = nameParts.length > 1 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : doctor.name.substring(0, 2).toUpperCase();

        // Assign color based on progress
        let bgColor = 'bg-yellow-200';
        let textColor = 'text-yellow-800';
        if (progressPercentage >= 75) {
          bgColor = 'bg-green-200';
          textColor = 'text-green-800';
        } else if (progressPercentage >= 50) {
          bgColor = 'bg-blue-200';
          textColor = 'text-blue-800';
        } else if (progressPercentage >= 25) {
          bgColor = 'bg-purple-200';
          textColor = 'text-purple-800';
        }

        return {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization || 'Psychologist',
          initials,
          bgColor,
          textColor,
          progressPercentage,
          status,
          profileImage: doctor.profilePicture,
          totalAppointments,
          completedAppointments
        };
      })
    );

    res.status(200).json({
      success: true,
      data: doctorsWithProgress
    });
  } catch (error) {
    console.error('Error fetching doctors work progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors work progress',
      error: error.message
    });
  }
};
