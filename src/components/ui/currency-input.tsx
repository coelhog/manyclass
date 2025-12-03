import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value?: number | string
  onChange?: (value: number) => void
}

export function CurrencyInput({
  className,
  value,
  onChange,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      if (!isNaN(numValue)) {
        setDisplayValue(formatCurrency(numValue))
      } else {
        setDisplayValue('')
      }
    } else {
      setDisplayValue('')
    }
  }, [value])

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value

    // Remove non-digits
    const digits = rawValue.replace(/\D/g, '')

    if (!digits) {
      setDisplayValue('')
      if (onChange) onChange(0)
      return
    }

    const numberValue = parseInt(digits) / 100
    setDisplayValue(formatCurrency(numberValue))

    if (onChange) {
      onChange(numberValue)
    }
  }

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      placeholder="R$ 0,00"
      className={cn('font-mono', className)}
    />
  )
}
