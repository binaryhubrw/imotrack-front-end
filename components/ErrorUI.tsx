import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"

type ErrorUIProps = {
  resource?: string
  onRetry?: () => void
  onBack?: () => void
}

export default function ErrorUI({
  resource = "data",
  onRetry = () => {},
  onBack = () => {},
}: ErrorUIProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative bg-[#e6f4fb] p-3 rounded-full border border-[#0872b3]/30">
              <AlertTriangle className="h-6 w-6 text-[#0872b3] animate-bounce" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <h1 className="text-xl font-semibold text-gray-800">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 text-sm">
              We couldn’t load the <strong>{resource}</strong> you requested. It may be a temporary issue.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={onRetry}
                className="flex-1 group bg-[#0872b3] hover:bg-[#065b90] text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                Try Again
              </button>

              <button
                onClick={onBack}
                className="flex-1 group bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Go Back
              </button>
            </div>

            {/* Help Text */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Still having trouble?
                <button className="ml-1 text-[#0872b3] hover:text-[#065b90] font-medium hover:underline transition-colors">
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
