const Review = require('../models/review');

const create = async (req, res) => {
  try {
    const { name, title, description, rating, avatarUrl } = req.body;
    if (!name || !title || !description || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({
      name,
      title,
      description,
      rating: parsedRating,
      avatarUrl: avatarUrl || ''
    });
    return res.status(201).json(review);
  } catch (err) {
    console.error('Failed to create review', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const list = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const reviews = await Review.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    return res.json(reviews);
  } catch (err) {
    console.error('Failed to list reviews', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { create, list };


