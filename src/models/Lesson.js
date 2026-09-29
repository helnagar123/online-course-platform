import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    content: {
      type: String,
      trim: true
    },

    videoUrl: {
      type: String,
      trim: true,
      default: null
    },

    duration: {
      type: Number,
      min: 0,
      default: 0
    },

    order: {
      type: Number,
      required: true,
      min: 1
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

lessonSchema.index({ course: 1, order: 1 }, { unique: true });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;