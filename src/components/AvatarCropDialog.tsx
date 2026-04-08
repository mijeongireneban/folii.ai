'use client'

import { useEffect, useRef, useState } from 'react'

// Square avatar crop dialog. User pans with pointer drag and zooms with the
// slider; we render a circular crop frame and export a 512x512 JPEG blob.

const OUTPUT_SIZE = 512
const FRAME_SIZE = 280

export function AvatarCropDialog({
  file,
  onCancel,
  onConfirm,
}: {
  file: File
  onCancel: () => void
  onConfirm: (cropped: File) => void
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [minScale, setMinScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const [saving, setSaving] = useState(false)

  // Load file → object URL → HTMLImageElement.
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgUrl(url)
    const i = new Image()
    i.onload = () => {
      const min = FRAME_SIZE / Math.min(i.naturalWidth, i.naturalHeight)
      setMinScale(min)
      setScale(min)
      setOffset({ x: 0, y: 0 })
      setImg(i)
    }
    i.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Clamp offset so the image always covers the frame.
  function clamp(next: { x: number; y: number }, s: number) {
    if (!img) return next
    const w = img.naturalWidth * s
    const h = img.naturalHeight * s
    const maxX = Math.max(0, (w - FRAME_SIZE) / 2)
    const maxY = Math.max(0, (h - FRAME_SIZE) / 2)
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    setOffset(
      clamp(
        { x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y },
        scale,
      ),
    )
  }
  function onPointerUp() {
    dragRef.current = null
  }

  function onScaleChange(next: number) {
    setScale(next)
    setOffset((prev) => clamp(prev, next))
  }

  async function handleConfirm() {
    if (!img) return
    setSaving(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      // Source rect in natural pixels: the FRAME_SIZE window centered on the
      // image, shifted by -offset, divided by current scale.
      const srcSize = FRAME_SIZE / scale
      const srcX = img.naturalWidth / 2 - offset.x / scale - srcSize / 2
      const srcY = img.naturalHeight / 2 - offset.y / scale - srcSize / 2
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcSize,
        srcSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      )
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.92),
      )
      if (!blob) return
      const ext = 'jpg'
      const base = file.name.replace(/\.[^.]+$/, '') || 'avatar'
      const cropped = new File([blob], `${base}.${ext}`, { type: 'image/jpeg' })
      onConfirm(cropped)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onCancel()
      }}
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 360,
          color: '#fff',
          fontFamily: 'inherit',
        }}
      >
        <h3
          style={{
            margin: 0,
            marginBottom: 4,
            fontSize: 17,
            fontWeight: 500,
          }}
        >
          Adjust your photo
        </h3>
        <p style={{ margin: 0, marginBottom: 16, fontSize: 13, color: '#8a8a8a' }}>
          Drag to reposition. Use the slider to zoom.
        </p>

        <div
          style={{
            position: 'relative',
            width: FRAME_SIZE,
            height: FRAME_SIZE,
            margin: '0 auto',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#000',
            touchAction: 'none',
            cursor: dragRef.current ? 'grabbing' : 'grab',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {imgUrl && img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: img.naturalWidth * scale,
                height: img.naturalHeight * scale,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                userSelect: 'none',
                pointerEvents: 'none',
                maxWidth: 'none',
              }}
            />
          )}
        </div>

        <input
          type="range"
          min={minScale}
          max={minScale * 4}
          step={0.001}
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          style={{ width: '100%', marginTop: 20, accentColor: '#0099ff' }}
          aria-label="Zoom"
        />

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 20,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#e5e5e5',
              borderRadius: 100,
              padding: '8px 18px',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !img}
            style={{
              background: '#0099ff',
              border: 'none',
              color: '#fff',
              borderRadius: 100,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
