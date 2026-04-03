import { NextRequest } from 'next/server'
import { LoginSchema } from '@/lib/backend/utils/validation'
import { ApiResponse, handleError } from '@/lib/backend/middleware/errorHandler'
import { db } from '@/lib/backend/services/database'
import { createToken } from '@/lib/backend/middleware/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = LoginSchema.parse(body)

    const user = await db.getUserByEmail(validated.email)
    
    if (!user) {
      return ApiResponse.error('User not found', 404)
    }

    // In production, compare hashed passwords
    if (user.password !== validated.password) {
      return ApiResponse.error('Invalid credentials', 401)
    }

    const token = createToken(user.id, user.email)

    return ApiResponse.success(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      'Login successful'
    )
  } catch (error) {
    return handleError(error)
  }
}
