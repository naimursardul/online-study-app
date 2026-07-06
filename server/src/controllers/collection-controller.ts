import { Request, Response } from "express";
import { SavedQuestion } from "../models/saved-question-model";
import Collection from "../models/collection-model";

// GET all collections of logged-in user
export async function getCollections(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const collections = await Collection.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// CREATE new collection (folder only, no question yet)
export async function createCollection(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      res
        .status(200)
        .json({ success: false, message: "Collection name is required" });
      return;
    }

    const collection = await Collection.create({
      userId,
      name: name.trim(),
    });

    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// RENAME collection
export async function renameCollection(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      res
        .status(200)
        .json({ success: false, message: "Collection name is required" });
      return;
    }

    const collection = await Collection.findOneAndUpdate(
      { _id: id, userId },
      { name: name.trim() },
      { new: true },
    );

    if (!collection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }

    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// DELETE collection (also delete all saved questions inside it)
export async function deleteCollection(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const collection = await Collection.findOneAndDelete({ _id: id, userId });

    if (!collection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }

    // clean up: remove all saved questions that belonged to this collection
    await SavedQuestion.deleteMany({ collectionId: id, userId });

    res.status(200).json({ success: true, message: "Collection deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
