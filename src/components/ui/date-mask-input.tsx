import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateMaskInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value?: string // Expected YYYY-MM-DD or ISO
  onChange?: (value: string) => void // Returns YYYY-MM-DD
}

export function DateMaskInput({
  className,
  value,
  onChange,
  ...props
}: DateMaskInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  React.useEffect(() => {
    if (value) {
      // Try to parse YYYY-MM-DD to DD/MM/YYYY
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          const day = String(date.getUTCDate()).padStart(2, '0')
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const year = date.getUTCFullYear()
          setDisplayValue(`${day}/${month}/${year}`)
        } else {
          // Maybe plain string
          setDisplayValue(value)
        }
      } catch (e) {
        setDisplayValue(value)
      }
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value

    // Allow only numbers and slash
    input = input.replace(/[^\d]/g, '')

    // Masking DD/MM/YYYY
    let formatted = ''
    if (input.length > 0) {
      formatted = input.substring(0, 2)
    }
    if (input.length >= 3) {
      formatted += '/' + input.substring(2, 4)
    }
    if (input.length >= 5) {
      formatted += '/' + input.substring(4, 8)
    }

    setDisplayValue(formatted)

    // Convert to YYYY-MM-DD if valid
    if (input.length === 8) {
      // DDMMYYYY
      const day = input.substring(0, 2)
      const month = input.substring(2, 4)
      const year = input.substring(4, 8)

      // Basic validation
      const numDay = parseInt(day)
      const numMonth = parseInt(month)
      const numYear = parseInt(year)

      if (
        numDay > 0 &&
        numDay <= 31 &&
        numMonth > 0 &&
        numMonth <= 12 &&
        numYear > 1900
      ) {
        if (onChange) onChange(`${year}-${month}-${day}`)
      }
    } else if (input.length === 0 && onChange) {
      onChange('')
    }
  }

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      placeholder="DD/MM/AAAA"
      maxLength={10}
      className={cn('font-mono', className)}
    />
  )
}
