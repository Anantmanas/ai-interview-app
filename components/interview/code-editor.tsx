'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string | number
}

const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
]

export function CodeEditor({ value, onChange, language = 'python', height = 300 }: CodeEditorProps) {
  const [currentLang, setCurrentLang] = useState(language)

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Language:</label>
        <Select value={currentLang} onValueChange={setCurrentLang}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="border rounded-lg overflow-hidden"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <Editor
          height="100%"
          language={currentLang}
          value={value}
          onChange={(val) => onChange(val || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
          loading={<div className="p-4 text-sm text-muted-foreground animate-pulse">Loading Monaco Editor...</div>}
        />
      </div>
    </div>
  )
}
