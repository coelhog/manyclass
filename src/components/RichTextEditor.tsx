import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value]) // Only update if value changes externally significantly

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (
    command: string,
    value: string | undefined = undefined,
  ) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden bg-background',
        className,
      )}
    >
      <div className="flex items-center gap-1 p-1 border-b bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('bold')}
          className="h-8 w-8"
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('italic')}
          className="h-8 w-8"
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="h-8 w-8"
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="h-8 w-8"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        className="p-3 min-h-[150px] outline-none focus:bg-accent/5 text-sm leading-relaxed"
        contentEditable
        onInput={handleInput}
        role="textbox"
        aria-multiline="true"
        aria-placeholder={placeholder}
      />
      {/* Placeholder simulation */}
      {!value && (
        <div
          className="absolute top-[50px] left-3 text-muted-foreground pointer-events-none text-sm"
          style={{ display: value ? 'none' : 'block' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}
