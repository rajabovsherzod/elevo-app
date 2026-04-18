"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bug, X, ChevronUp, ChevronDown, Trash2 } from "lucide-react"

interface LogEntry {
  id: number
  type: "log" | "error" | "warn" | "info"
  message: string
  timestamp: Date
  data?: any
}

export function DevConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Intercept console methods
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    let logId = 0

    console.log = (...args: any[]) => {
      originalLog(...args)
      setLogs((prev) => [
        ...prev.slice(-49),
        {
          id: logId++,
          type: "log",
          message: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "),
          timestamp: new Date(),
          data: args.length === 1 && typeof args[0] === "object" ? args[0] : undefined,
        },
      ])
    }

    console.error = (...args: any[]) => {
      originalError(...args)
      setLogs((prev) => [
        ...prev.slice(-49),
        {
          id: logId++,
          type: "error",
          message: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "),
          timestamp: new Date(),
          data: args.length === 1 && typeof args[0] === "object" ? args[0] : undefined,
        },
      ])
    }

    console.warn = (...args: any[]) => {
      originalWarn(...args)
      setLogs((prev) => [
        ...prev.slice(-49),
        {
          id: logId++,
          type: "warn",
          message: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "),
          timestamp: new Date(),
          data: args.length === 1 && typeof args[0] === "object" ? args[0] : undefined,
        },
      ])
    }

    console.info = (...args: any[]) => {
      originalInfo(...args)
      setLogs((prev) => [
        ...prev.slice(-49),
        {
          id: logId++,
          type: "info",
          message: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "),
          timestamp: new Date(),
          data: args.length === 1 && typeof args[0] === "object" ? args[0] : undefined,
        },
      ])
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      console.info = originalInfo
    }
  }, [])

  const clearLogs = () => setLogs([])

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-gray-300"
    }
  }

  const getLogBg = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "bg-red-500/10"
      case "warn":
        return "bg-yellow-500/10"
      case "info":
        return "bg-blue-500/10"
      default:
        return "bg-gray-500/5"
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bug className="w-6 h-6" />
          {logs.filter((l) => l.type === "error").length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
              {logs.filter((l) => l.type === "error").length}
            </span>
          )}
        </motion.button>
      )}

      {/* Console Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 z-[9999] w-[90vw] max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">Dev Console</span>
                <span className="text-xs text-gray-400">({logs.length} logs)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearLogs}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Clear logs"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Logs */}
            {!isMinimized && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="h-96 overflow-y-auto p-3 space-y-2 font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No logs yet...
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-2 rounded-lg ${getLogBg(log.type)} border border-gray-700/50`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 shrink-0">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <span className={`font-bold shrink-0 ${getLogColor(log.type)}`}>
                            [{log.type.toUpperCase()}]
                          </span>
                          <pre className={`flex-1 whitespace-pre-wrap break-words ${getLogColor(log.type)}`}>
                            {log.message}
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
