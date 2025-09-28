"use client"

import * as React from "react"
import { Clock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedHour, setSelectedHour] = React.useState<string>("")
  const [selectedMinute, setSelectedMinute] = React.useState<string>("")

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':')
      setSelectedHour(hour || "")
      setSelectedMinute(minute || "")
    }
  }, [value])

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour)
    if (selectedMinute) {
      const newValue = `${hour}:${selectedMinute}`
      onChange?.(newValue)
    }
  }

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute)
    if (selectedHour) {
      const newValue = `${selectedHour}:${minute}`
      onChange?.(newValue)
    }
  }

  const formatDisplayValue = () => {
    if (value) {
      const [hour, minute] = value.split(':')
      const hourNum = parseInt(hour)
      const minuteNum = parseInt(minute)
      const period = hourNum >= 12 ? 'PM' : 'AM'
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
      const displayMinute = minuteNum.toString().padStart(2, '0')
      return `${displayHour}:${displayMinute} ${period}`
    }
    return placeholder
  }

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-between text-left font-normal bg-background border-border hover:bg-accent hover:text-accent-foreground",
          !value && "text-muted-foreground",
          className
        )}
      >
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          {formatDisplayValue()}
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute bottom-full w-80 left-0 right-0 mt-1 z-20 bg-popover border border-border rounded-md shadow-lg p-3">
            <div className="flex gap-4">
              {/* Hours */}
              <div className="flex-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">Hour</div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {hours.map((hour) => {
                    const hourNum = parseInt(hour)
                    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
                    const period = hourNum >= 12 ? 'PM' : 'AM'
                    const isSelected = selectedHour === hour
                    
                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleHourSelect(hour)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {displayHour} {period}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Minutes */}
              <div className="flex-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">Minute</div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {minutes.filter((_, i) => i % 5 === 0).map((minute) => {
                    const isSelected = selectedMinute === minute
                    
                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => handleMinuteSelect(minute)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {minute}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Quick time buttons */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground mb-2">Quick Select</div>
              <div className="flex gap-2 flex-wrap">
                {['00:00', '09:00', '12:00', '15:00', '18:00', '21:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      const [hour, minute] = time.split(':')
                      setSelectedHour(hour)
                      setSelectedMinute(minute)
                      onChange?.(time)
                      setIsOpen(false)
                    }}
                    className="px-2 py-1 text-xs bg-muted hover:bg-accent rounded-md transition-colors"
                  >
                    {(() => {
                      const [hour, minute] = time.split(':')
                      const hourNum = parseInt(hour)
                      const period = hourNum >= 12 ? 'PM' : 'AM'
                      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
                      return `${displayHour}:${minute} ${period}`
                    })()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
