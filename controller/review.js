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
    const { limit = 20, includeInactive = 'false' } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    return res.json(reviews);
  } catch (err) {
    console.error('Failed to list reviews', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, description, rating, avatarUrl } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (rating !== undefined) {
      const parsed = Number(rating);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updateFields.rating = parsed;
    }
    const updated = await Review.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Review not found' });
    return res.json(updated);
  } catch (err) {
    console.error('Failed to update review', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be boolean' });
    }
    const updated = await Review.findByIdAndUpdate(id, { $set: { isActive } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Review not found' });
    return res.json(updated);
  } catch (err) {
    console.error('Failed to toggle review', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { create, list, update, toggleActive };


