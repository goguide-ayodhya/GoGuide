import { Schema, model, Document, Types } from "mongoose";

export interface IDriverWallet extends Document {
  driverId: Types.ObjectId;
  totalEarned: number; // Total earnings from rides
  adminCommissionGenerated: number; // Total admin commission from driver's earnings
  adminCommissionPaid: number; // How much driver has paid to admin
  pendingAdminCommission: number; // How much driver still owes admin
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DriverWalletSchema = new Schema<IDriverWallet>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      unique: true,
      index: true,
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    adminCommissionGenerated: {
      type: Number,
      default: 0,
      min: 0,
    },
    adminCommissionPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAdminCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure pendingAdminCommission doesn't go negative
DriverWalletSchema.pre("save", function (next) {
  // pendingAdminCommission should never exceed totalCommissionGenerated - paid
  const maxPending = Math.max(0, this.adminCommissionGenerated - this.adminCommissionPaid);
  if (this.pendingAdminCommission > maxPending) {
    this.pendingAdminCommission = maxPending;
  }
  if (this.pendingAdminCommission < 0) {
    this.pendingAdminCommission = 0;
  }
  this.lastUpdatedAt = new Date();
  next();
});

export const DriverWallet = model<IDriverWallet>("DriverWallet", DriverWalletSchema);
