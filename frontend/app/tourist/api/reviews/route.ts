import { NextRequest } from 'next/server'
import { ReviewSchema } from '@/lib/backend/utils/validation'
import { ApiResponse, handleError } from '@/lib/backend/middleware/errorHandler'
import { db } from '@/lib/backend/services/database'
import { verifyToken } from '@/lib/backend/middleware/auth'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return ApiResponse.error('Unauthorized', 401)
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return ApiResponse.error('Invalid token', 401)
    }

    const body = await req.json()
    const { rating, comment, guideId, cabId, packageId } = body

    // Validate review data
    ReviewSchema.parse({ rating, comment })

    const review = await db.createReview({
      userId: user.userId,
      rating,
      comment,
      guideId,
      cabId,
      packageId,
    })

    return ApiResponse.created(review, 'Review submitted successfully')
  } catch (error) {
    return handleError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const guideId = searchParams.get('guideId')

    if (!guideId) {
      return ApiResponse.error('guideId parameter required', 400)
    }

    const reviews = await db.getReviewsByGuideId(guideId)

    return ApiResponse.success(reviews, 'Reviews retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}
