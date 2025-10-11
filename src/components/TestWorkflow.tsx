import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react'
import testInventoryApprovalWorkflow from '../utils/testWorkflow'

const TestWorkflow = () => {
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async () => {
    setIsRunning(true)
    console.log('🧪 Starting workflow test...')
    
    try {
      const results = await testInventoryApprovalWorkflow()
      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults({
        tablesExist: false,
        requestCreation: false,
        requestFetching: false,
        error: error.message
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">SWS Inventory Approval System Test</h3>
        <button
          onClick={runTest}
          disabled={isRunning}
          className="btn-primary flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{isRunning ? 'Running...' : 'Run Test'}</span>
        </button>
      </div>

      {testResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              {testResults.tablesExist ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Database Tables</p>
                <p className="text-sm text-gray-600">
                  {testResults.tablesExist ? 'All exist' : 'Some missing'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              {testResults.requestCreation ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Request Creation</p>
                <p className="text-sm text-gray-600">
                  {testResults.requestCreation ? 'Working' : 'Failed'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              {testResults.requestFetching ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Request Fetching</p>
                <p className="text-sm text-gray-600">
                  {testResults.requestFetching ? 'Working' : 'Failed'}
                </p>
              </div>
            </div>
          </div>

          {testResults.error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{testResults.error}</p>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {!testResults.tablesExist && (
                <li>• Run the final-database-setup.sql script in Supabase SQL Editor</li>
              )}
              <li>• Test inventory request creation in Employee Dashboard</li>
              <li>• Check if requests appear in Manager/Project Manager dashboards</li>
              <li>• Test the complete approval workflow</li>
            </ul>
          </div>
        </motion.div>
      )}

      {!testResults && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Click "Run Test" to check if the inventory approval system is working correctly.</p>
          <div className="text-sm text-gray-500">
            This test will verify database tables, request creation, and data fetching.
          </div>
        </div>
      )}
    </div>
  )
}

export default TestWorkflow
