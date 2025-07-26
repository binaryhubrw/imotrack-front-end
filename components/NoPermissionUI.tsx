import { NoPermissionUIProps } from "@/types/next-auth";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, Home, Mail, RefreshCw, ShieldX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function NoPermissionUI({
  resource = "this resource",
  onGoBack = () => window.history.back(),
  onGoHome = () => (window.location.href = "/dashboard"),
  onContactSupport,
  showRefresh = true,
}: NoPermissionUIProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 py-8 relative overflow-hidden">
      {/* Enhanced Background Animation */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 w-full h-full opacity-5"
        style={{
          background: `radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, #06b6d4 0%, transparent 50%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          staggerChildren: 0.1,
        }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-0 shadow-2xl shadow-black/10 bg-white/90 backdrop-blur-sm relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <CardContent className="p-8 text-center relative z-10">
            {/* Enhanced Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="relative mx-auto mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 via-orange-100 to-red-50 rounded-3xl flex items-center justify-center mx-auto relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/5 animate-pulse" />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ShieldX className="w-12 h-12 text-red-600 relative z-10 drop-shadow-lg" />
                </motion.div>
              </div>

              {/* Enhanced Decorative elements */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-3 -right-3 w-8 h-8 border-2 border-red-200 rounded-full bg-red-50"
              />
              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 0.8, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-2 -left-2 w-6 h-6 border-2 border-orange-200 rounded-full bg-orange-50"
              />
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 right-1/2 w-3 h-3 bg-blue-200 rounded-full"
              />
            </motion.div>

            {/* Enhanced Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-gray-700 bg-clip-text text-transparent mb-4"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Access Denied
              </motion.h1>

              <motion.p
                className="text-gray-600 text-lg mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You don&apos;t have the required permissions to access{" "}
                <span className="font-semibold text-gray-800 capitalize px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300 shadow-sm">
                  {resource}
                </span>
              </motion.p>

              {/* Enhanced Info Alert */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Alert className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 text-left shadow-sm">
                  <AlertDescription className="text-sm text-blue-800 leading-relaxed">
                    <strong>Need help?</strong> If you believe this is an error,
                    please contact your system administrator or try refreshing
                    the page. You can also go back to the previous page or
                    return to the dashboard.
                  </AlertDescription>
                </Alert>
              </motion.div>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={onGoBack}
                  className="group hover:bg-gray-50 transition-all duration-200 border-2 hover:border-gray-300 shadow-sm cursor-pointer px-8 py-5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                  Go Back
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onGoHome}
                  className="group bg-[#0872b3] hover:bg-[#0661a0] transition-all duration-200 shadow-lg hover:shadow-xl text-white font-medium cursor-pointer px-8 py-5"
                >
                  <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Dashboard
                </Button>
              </motion.div>

              {showRefresh && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleRefresh}
                    className="group hover:bg-green-50 hover:text-green-700 transition-all duration-200 border border-transparent hover:border-green-200 cursor-pointer px-8 py-5"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Refresh
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Enhanced Contact Support */}
            {onContactSupport && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-gray-100"
              >
                <Button
                  variant="link"
                  onClick={onContactSupport}
                  className="group text-gray-500 hover:text-blue-600 transition-colors p-0 h-auto font-normal hover:underline"
                >
                  <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Contact Support
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Decorative Background Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-40 h-40 bg-blue-200/20 rounded-full blur-xl -z-10"
        />
        <motion.div
          animate={{
            y: [0, 25, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-xl -z-10"
        />
        <motion.div
          animate={{
            x: [0, 15, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/2 left-20 w-20 h-20 bg-purple-200/20 rounded-full blur-lg -z-10"
        />
      </motion.div>
    </div>
  );
}
