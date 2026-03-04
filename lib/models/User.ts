import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
} from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User: Model<UserDocument> =
  models.User || model<UserDocument>("User", userSchema);
