import mongoose, { Schema, Document } from "mongoose";
import Product from "./product";

interface Image {
    public_id: string;
    url: string;
}

interface blogInterface extends Document {
    userId: string;
    title: string;
    content: string;
    image: Image;
    createdAt: Date;
}

const blogSchema: Schema<blogInterface> = new Schema ({
    userId: {
        type: String,
        required: [true, "UserId of the content is neccessary!"]
    },
    title: {
        type: String,
        required: [true, "Please enter the blog title!"],
    },
    content: {
        type: String,
        required: [true, "Please enter the blog content"]
    },
    image: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
})

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;