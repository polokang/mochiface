import mongoose, { Document, Schema } from 'mongoose'

export interface IGeneration extends Document {
  userId: mongoose.Types.ObjectId
  originalImage: string
  generatedImage: string
  style: string
  creditsUsed: number
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

const GenerationSchema = new Schema<IGeneration>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalImage: {
    type: String,
    required: true,
  },
  generatedImage: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    required: true,
    enum: ['anime', 'realistic', 'cartoon', 'oil_painting', 'watercolor', 'sketch'],
  },
  creditsUsed: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
})

// 索引
GenerationSchema.index({ userId: 1 })
GenerationSchema.index({ createdAt: -1 })
GenerationSchema.index({ status: 1 })

export default mongoose.models.Generation || mongoose.model<IGeneration>('Generation', GenerationSchema)
