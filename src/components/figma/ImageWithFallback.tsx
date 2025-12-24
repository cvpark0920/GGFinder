import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault()
    if (props.onContextMenu) {
      props.onContextMenu(e)
    }
  }

  const { src, alt, style, className, onContextMenu, ...rest } = props

  // 기본 다운로드 방지 스타일 병합
  const defaultStyle = { userSelect: 'none' as const, WebkitUserDrag: 'none' as const }
  const mergedStyle = { ...defaultStyle, ...style }

  // 기본 다운로드 방지 클래스 병합
  const defaultClassName = 'select-none'
  const mergedClassName = className ? `${defaultClassName} ${className}` : defaultClassName

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img 
          src={ERROR_IMG_SRC} 
          alt="Error loading image" 
          {...rest} 
          data-original-url={src}
          draggable={false}
          onContextMenu={handleContextMenu}
          style={mergedStyle}
          className={mergedClassName}
        />
      </div>
    </div>
  ) : (
    <img 
      src={src} 
      alt={alt} 
      className={mergedClassName} 
      style={mergedStyle} 
      {...rest} 
      onError={handleError}
      draggable={rest.draggable !== undefined ? rest.draggable : false}
      onContextMenu={handleContextMenu}
    />
  )
}
