import React from 'react'

const SafeIcon = ({ icon: IconComponent, name, className = '', ...props }) => {
  // If we have an icon component, render it
  if (IconComponent) {
    return <IconComponent className={className} {...props} />
  }

  // If we have a name, try to load from react-icons/fi
  if (name) {
    try {
      // Dynamic import would be async, so we'll use a fallback
      console.warn('SafeIcon: Dynamic icon loading not available, using fallback')
    } catch (error) {
      console.warn('SafeIcon: Failed to load icon:', name)
    }
  }

  // Fallback: render a simple div with a question mark
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`} 
      style={{ width: '1em', height: '1em' }}
      {...props}
    >
      ?
    </div>
  )
}

export default SafeIcon