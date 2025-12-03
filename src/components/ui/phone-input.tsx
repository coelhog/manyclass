import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

// Countries with DDI and flag emoji
const countries = [
  { label: 'Brasil', value: '+55', flag: '🇧🇷', mask: '(99) 99999-9999' },
  { label: 'Estados Unidos', value: '+1', flag: '🇺🇸', mask: '(999) 999-9999' },
  { label: 'Portugal', value: '+351', flag: '🇵🇹', mask: '999 999 999' },
  { label: 'Argentina', value: '+54', flag: '🇦🇷', mask: '9 99 9999-9999' },
  { label: 'Reino Unido', value: '+44', flag: '🇬🇧', mask: '99999 999999' },
  { label: 'Espanha', value: '+34', flag: '🇪🇸', mask: '999 99 99 99' },
  { label: 'França', value: '+33', flag: '🇫🇷', mask: '9 99 99 99 99' },
  { label: 'Alemanha', value: '+49', flag: '🇩🇪', mask: '9999 999999' },
]

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value?: string
  onChange?: (value: string) => void
}

export function PhoneInput({
  className,
  value = '',
  onChange,
  ...props
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedCountry, setSelectedCountry] = React.useState(countries[0]) // Default Brazil
  const [phoneNumber, setPhoneNumber] = React.useState('')

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      // Try to find country code
      const country = countries.find((c) => value.startsWith(c.value))
      if (country) {
        setSelectedCountry(country)
        setPhoneNumber(value.replace(country.value, '').trim())
      } else {
        setPhoneNumber(value)
      }
    } else {
      setPhoneNumber('')
    }
  }, [value])

  const applyMask = (val: string, mask: string) => {
    // Simple masking logic: replace 9 with digits, keep others
    // Removing non-digits from value
    const digits = val.replace(/\D/g, '')
    let masked = ''
    let digitIndex = 0

    for (let i = 0; i < mask.length; i++) {
      if (digitIndex >= digits.length) break
      if (mask[i] === '9') {
        masked += digits[digitIndex]
        digitIndex++
      } else {
        masked += mask[i]
      }
    }
    return masked
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Remove current mask format to get raw digits if user is deleting
    // Better approach: strip non-digits, then re-apply mask
    const digits = rawValue.replace(/\D/g, '')

    const maskedValue = applyMask(digits, selectedCountry.mask)
    setPhoneNumber(maskedValue)

    if (onChange) {
      onChange(`${selectedCountry.value} ${maskedValue}`)
    }
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[110px] justify-between px-2"
          >
            <span className="text-lg mr-1">{selectedCountry.flag}</span>
            {selectedCountry.value}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Buscar país..." />
            <CommandList>
              <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.value}
                    value={country.label}
                    onSelect={() => {
                      setSelectedCountry(country)
                      // Re-apply mask to current number with new country
                      const digits = phoneNumber.replace(/\D/g, '')
                      const newMasked = applyMask(digits, country.mask)
                      setPhoneNumber(newMasked)
                      if (onChange) onChange(`${country.value} ${newMasked}`)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCountry.value === country.value
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <span className="text-lg mr-2">{country.flag}</span>
                    <span className="flex-1">{country.label}</span>
                    <span className="text-muted-foreground">
                      {country.value}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        {...props}
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={selectedCountry.mask.replace(/9/g, '0')}
        className="flex-1"
      />
    </div>
  )
}
