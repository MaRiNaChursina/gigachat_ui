import { useEffect, useMemo, useRef, useState } from 'react'
import type { MessageImage } from '../../types/message'
import { Button } from '../ui/Button'
import cls from './InputArea.module.css'

const MAX_IMAGE_BYTES = 1_500_000 // ~1.5 MB для payload после base64.
const MAX_IMAGE_SIDE = 1280

export type InputAreaProps = {
  isLoading: boolean
  onSend: (payload: { text: string; image?: MessageImage }) => void
  onStop: () => void
}

export function InputArea({ isLoading, onSend, onStop }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState('')
  const [image, setImage] = useState<MessageImage | undefined>(undefined)
  const [imageError, setImageError] = useState<string | null>(null)
  const canSend = useMemo(() => value.trim().length > 0 || Boolean(image), [value, image])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = 'auto'

    const style = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(style.lineHeight || '20') || 20
    const paddingY =
      (Number.parseFloat(style.paddingTop || '0') || 0) +
      (Number.parseFloat(style.paddingBottom || '0') || 0)
    const borderY =
      (Number.parseFloat(style.borderTopWidth || '0') || 0) +
      (Number.parseFloat(style.borderBottomWidth || '0') || 0)
    const maxHeight = lineHeight * 5 + paddingY + borderY

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }, [value])

  const submit = () => {
    if (!canSend || isLoading) return
    onSend({ text: value.trim(), image })
    setValue('')
    setImage(undefined)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const dataUrlBytes = (dataUrl: string) => Math.floor((dataUrl.length * 3) / 4)

  const loadImageElement = async (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Не удалось прочитать изображение'))
      }
      img.src = url
    })

  const compressImage = async (file: File) => {
    const img = await loadImageElement(file)
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas недоступен')
    ctx.drawImage(img, 0, 0, w, h)

    let quality = 0.86
    let out = canvas.toDataURL('image/jpeg', quality)
    while (dataUrlBytes(out) > MAX_IMAGE_BYTES && quality > 0.45) {
      quality -= 0.08
      out = canvas.toDataURL('image/jpeg', quality)
    }
    return out
  }

  const handlePickImage = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setImageError(null)
    try {
      const dataUrl = await compressImage(file)
      if (dataUrlBytes(dataUrl) > MAX_IMAGE_BYTES) {
        setImage(undefined)
        setImageError('Изображение слишком большое. Выберите файл меньше или с меньшим разрешением.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      setImage({ dataUrl, mimeType: 'image/jpeg', name: file.name })
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Не удалось обработать изображение')
      setImage(undefined)
      setImageError(err.message)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cls.root}>
      <div className={cls.box}>
        <div className={cls.textareaWrap}>
          {image ? (
            <div className={cls.preview}>
              <img src={image.dataUrl} alt={image.name || 'preview'} className={cls.previewImage} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Удалить изображение"
                onClick={() => {
                  setImage(undefined)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                Удалить изображение
              </Button>
            </div>
          ) : null}
          {imageError ? <div className={cls.imageError}>{imageError}</div> : null}
          <textarea
            ref={textareaRef}
            className={cls.textarea}
            rows={1}
            value={value}
            placeholder="Напишите сообщение…"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <div className={cls.actionsRow}>
            <p className={cls.hint}>Enter — отправить, Shift+Enter — перенос строки</p>
            <input
              ref={fileInputRef}
              className={cls.fileInput}
              type="file"
              accept="image/*"
              onChange={(e) => void handlePickImage(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="ghost"
              iconOnly
              title="Прикрепить изображение"
              onClick={() => fileInputRef.current?.click()}
            >
              🖼
            </Button>
          </div>
        </div>

        <div className={cls.sideButtons}>
          {isLoading ? (
            <Button type="button" variant="ghost" onClick={onStop} title="Остановить генерацию">
              Стоп
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled={!canSend}
              onClick={submit}
            >
              Отправить
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

