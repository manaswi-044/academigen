export const runtime = 'nodejs'

import { exportLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import { uploadFileToSupabase } from '@/lib/storage/indexedDB'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (exportLimiter) {
    const { success } = await exportLimiter.limit(user.id)
    if (!success) {
      return Response.json(
        { error: 'Limit reached. Try again in 1 hour.' },
        { status: 429 }
      )
    }
  }

  const { documentId, fileBuffer, fileType } = await request.json()

  try {
    const timestamp = Date.now()
    const key = `exports/${user.id}/${documentId}/${timestamp}.${fileType === 'pdf' ? 'pdf' : 'docx'}`
    
    const publicUrl = await uploadFileToSupabase(
      Buffer.from(fileBuffer),
      key,
      fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

    return Response.json({
      status: 'success',
      message: 'File exported successfully',
      url: publicUrl,
      documentId
    })
  } catch (error: any) {
    return Response.json(
      { error: `Export failed: ${error.message}` },
      { status: 500 }
    )
  }
}