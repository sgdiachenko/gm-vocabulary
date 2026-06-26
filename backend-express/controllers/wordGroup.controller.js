import WordGroup from '../models/wordGroup.model.js';

export const getUserGroups = async (req, res) => {
  try {
    const groups = await WordGroup
      .find({ userId: req.user.id })
      .populate('words');
    return res.json(groups);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getSharedGroups = async (req, res) => {
  try {
    const groups = await WordGroup
      .find({
        isShared: true,
        userId: { $ne: req.user.id }
      })
      .populate('words');
    return res.json(groups);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const groups = await WordGroup
      .findOne({ _id: req.params.id })
      .populate('words');
    return res.json(groups);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addGroup = async (req, res) => {
  try {
    const group = new WordGroup({
      ...req.body,
      userId: req.user.id,
    });
    await group.save();
    return res.status(201).json(group);

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const addGroups = async (req, res) => {
  try {
    const groups = await WordGroup.insertMany(req.body.map(group => ({
      ...group,
      userId: req.user.id
    })));

    return res.status(201).json(groups);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await WordGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    WordGroup.updateOne({ _id: req.params.id, userId: req.user.id }, req.body).then(result => {
      if (result.modifiedCount > 0) {
        return res.status(200).json();
      }
      return res.status(401).json({ message: 'No permission to update another user collection' });
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const group = await WordGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    WordGroup.deleteOne({ _id: req.params.id, userId: req.user.id }).then(result => {
      if (result.deletedCount > 0) {
        return res.status(200).json();
      }
      return res.status(401).json({ message: 'No permission to delete another user collection' });
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

