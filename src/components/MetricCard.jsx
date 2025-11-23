import React from 'react'
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'

const MetricCard = ({ title, value, icon, color, loading }) => {
  const getIcon = () => {
    switch (icon) {
      case 'check':
        return <CheckCircle size={24} className="text-green-500" />
      case 'warning':
        return <AlertTriangle size={24} className="text-yellow-500" />
      case 'alert':
        return <AlertCircle size={24} className="text-red-500" />
      default:
        return null
    }
  }

  const getBorderColor = () => {
    switch (color) {
      case 'success':
        return 'border-success-green'
      case 'warning':
        return 'border-warning-yellow'
      case 'danger':
        return 'border-danger-red'
      default:
        return 'border-gray-600'
    }
  }

  return (
    <div className={`bg-dark-card rounded-lg p-6 border-l-4 ${getBorderColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-text text-sm font-medium">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
      </div>
    </div>
  )
}

export default MetricCard