import { Request, Response, NextFunction } from "express";
import Blog from "../model/blog";
import ErrorHandler from "../utils/ErrorHandler";
import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import sendToken from "../utils/jwtToken";

// Create blog
const createBlog = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, title, content, image } = req.body;
      var blogImage: any;
      if (image && image != "") {
        blogImage = await cloudinary.uploader.upload(image, {
          folder: "blogImages",
        });
      }

      //   console log the blogImage
      console.log(blogImage);
      const blog = {
        userId: userId,
        title: title,
        content: content,
        image: {
          public_id:
            blogImage && blogImage.public_id ? blogImage.public_id : "",
          url: blogImage && blogImage.secure_url ? blogImage.secure_url : "",
        },
      };
      try {
        const newBlog = await Blog.create(blog);
        console.log(newBlog);
        res.status(201).json({
          success: true,
          message: "New blog has been created successfully",
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  }
);

// Update the blog
const editBlog = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sending the userId as a request to authorise the user in editing
      const userId = (req as any).user.id;
      const blog: any = await Blog.findById(req.params.id);

      if (blog?.userId != userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorised to modify this content",
        });
      }
      const { title, content } = req.body;
      blog.userId = blog.userId;
      blog.title = title != "" ? title : blog.title;
      blog.content = content != "" ? content : blog.content;

      await blog.save();
      res.status(201).json({
        success: true,
        blog,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Delete the blog
const deleteBlog = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const blog: any = await Blog.findById(req.params.id);

      if (blog?.userId != userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorised to modify this content",
        });
      }
      await Blog.findByIdAndDelete(req.params.id);
      res.status(200).json({
        status: true,
        message: "Blog deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all blogs
const getAllBlog = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blog = await Blog.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        blog,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export { createBlog, editBlog, deleteBlog, getAllBlog };
