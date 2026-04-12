import { ImageResponse } from 'next/og'
import { loadPublishedSite } from '../_lib'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const data = await loadPublishedSite(username)

  if (!data) {
    return new Response('Not found', { status: 404 })
  }

  const { name, tagline, bio } = data.content
  const initials =
    data.content.avatar_initials ||
    name
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

  // Truncate bio for the card
  const shortBio = bio.length > 120 ? bio.slice(0, 117) + '...' : bio

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: '#000',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#1a1a1a',
              border: '2px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 600,
              color: '#a6a6a6',
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-1.5px' }}>
              {name}
            </div>
            <div style={{ fontSize: 20, color: '#0099ff' }}>
              {tagline}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: '#a6a6a6',
            maxWidth: 900,
          }}
        >
          {shortBio}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 'auto',
            paddingTop: 40,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500, color: '#666' }}>
            folii.ai/{username}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
