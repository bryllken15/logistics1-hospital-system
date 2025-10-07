import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Shield, 
  Bell,
  Save,
  Edit3,
  Check
} from 'lucide-react'

const HospitalSettings = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [settings, setSettings] = useState({
    hospitalName: 'Metro Manila General Hospital',
    hospitalCode: 'MMGH-001',
    address: '123 Healthcare Avenue, Metro Manila, Philippines',
    phone: '+63 2 1234 5678',
    email: 'admin@mmgh.com.ph',
    emergencyContact: '+63 917 123 4567',
    totalBeds: 500,
    departments: [
      'Emergency Medicine',
      'Surgery',
      'Internal Medicine',
      'Pediatrics',
      'Obstetrics & Gynecology',
      'Radiology',
      'Laboratory',
      'Pharmacy',
      'Intensive Care Unit',
      'Operating Room'
    ],
    inventoryCategories: [
      'Medical Supplies',
      'Pharmaceuticals',
      'Medical Equipment',
      'Surgical Instruments',
      'Emergency Supplies',
      'Laboratory Reagents',
      'Radiology Equipment',
      'Maintenance Supplies'
    ],
    rfidPrefixes: {
      medical: 'MED',
      surgical: 'SUR',
      emergency: 'EMR',
      laboratory: 'LAB',
      radiology: 'RAD'
    },
    alertThresholds: {
      lowStock: 20,
      criticalStock: 5,
      maintenanceDue: 7,
      documentExpiry: 30
    },
    workingHours: {
      start: '08:00',
      end: '17:00',
      emergency: '24/7'
    }
  })

  const handleSave = () => {
    // Save settings to database
    console.log('Saving hospital settings:', settings)
    setIsEditing(false)
    // Show success message
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: string, index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Hospital Settings</h1>
            <p className="text-gray-600">Configure your hospital's specific requirements and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Settings</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Basic Information</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
            <input
              type="text"
              value={settings.hospitalName}
              onChange={(e) => handleInputChange('hospitalName', e.target.value)}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Code</label>
            <input
              type="text"
              value={settings.hospitalCode}
              onChange={(e) => handleInputChange('hospitalCode', e.target.value)}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
            <input
              type="text"
              value={settings.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Beds</label>
            <input
              type="number"
              value={settings.totalBeds}
              onChange={(e) => handleInputChange('totalBeds', parseInt(e.target.value))}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
        </div>
      </motion.div>

      {/* Departments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Hospital Departments</span>
        </h3>
        <div className="space-y-3">
          {settings.departments.map((dept, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={dept}
                onChange={(e) => handleArrayChange('departments', index, e.target.value)}
                disabled={!isEditing}
                className="input-field flex-1"
              />
              {isEditing && (
                <button
                  onClick={() => removeArrayItem('departments', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={() => addArrayItem('departments')}
              className="btn-secondary text-sm"
            >
              + Add Department
            </button>
          )}
        </div>
      </motion.div>

      {/* Inventory Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Inventory Categories</span>
        </h3>
        <div className="space-y-3">
          {settings.inventoryCategories.map((category, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={category}
                onChange={(e) => handleArrayChange('inventoryCategories', index, e.target.value)}
                disabled={!isEditing}
                className="input-field flex-1"
              />
              {isEditing && (
                <button
                  onClick={() => removeArrayItem('inventoryCategories', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={() => addArrayItem('inventoryCategories')}
              className="btn-secondary text-sm"
            >
              + Add Category
            </button>
          )}
        </div>
      </motion.div>

      {/* RFID Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">RFID Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(settings.rfidPrefixes).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1)} Prefix
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange('rfidPrefixes', {
                  ...settings.rfidPrefixes,
                  [key]: e.target.value
                })}
                disabled={!isEditing}
                className="input-field"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alert Thresholds */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Alert Thresholds</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(settings.alertThresholds).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleInputChange('alertThresholds', {
                  ...settings.alertThresholds,
                  [key]: parseInt(e.target.value)
                })}
                disabled={!isEditing}
                className="input-field"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Working Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Working Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => handleInputChange('workingHours', {
                ...settings.workingHours,
                start: e.target.value
              })}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => handleInputChange('workingHours', {
                ...settings.workingHours,
                end: e.target.value
              })}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Services</label>
            <input
              type="text"
              value={settings.workingHours.emergency}
              onChange={(e) => handleInputChange('workingHours', {
                ...settings.workingHours,
                emergency: e.target.value
              })}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HospitalSettings
