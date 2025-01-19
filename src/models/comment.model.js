import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose from "mongoose";
import { Schema } from "mongoose";

const commentSchema = new Schema(
    {

        content : {
            type: String,
            required: true,
        },
        video : {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        ownwer : {
            type: Schema.Types.ObjectId,
            ref: "User",
        }

}, {
    timestamps: true
}

)


commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);