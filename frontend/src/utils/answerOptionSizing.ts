import type { AnswerOption } from "@/types/game"

export const getMaxTextLength = (options: AnswerOption[]) => {
  return Math.max(...options.map(option => option.text.length))
}

export const getDynamicSizing = (options: AnswerOption[]) => {
  const maxLength = getMaxTextLength(options)

  // Base sizing for very short text (1-5 chars)
  if (maxLength <= 10) {
    return {
      fontSize: 'text-2xl sm:text-3xl lg:text-4xl',
      height: 'min-h-[80px] sm:min-h-[90px] lg:min-h-[100px]',
      padding: 'p-4'
    }
  }

  // Medium text (6-20 chars)
  if (maxLength <= 20) {
    return {
      fontSize: 'text-lg sm:text-xl lg:text-2xl',
      height: 'min-h-[70px] sm:min-h-[80px] lg:min-h-[90px]',
      padding: 'p-3'
    }
  }

  // Long text (21-50 chars)
  if (maxLength <= 50) {
    return {
      fontSize: 'text-base sm:text-lg',
      height: 'min-h-[60px] sm:min-h-[70px]',
      padding: 'p-3'
    }
  }

  // Very long text (50+ chars)
  return {
    fontSize: 'text-sm sm:text-base',
    height: 'min-h-[50px] sm:min-h-[60px]',
    padding: 'p-2'
  }
}