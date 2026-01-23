import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function OTPCompo() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]) // Array for 6-character OTP
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSingleInput, setIsSingleInput] = useState(false) // Toggle between single input and multi-input
  const otpRefs = useRef([])
  const singleInputRef = useRef(null)
  const { verifyEmailAndOtp } = useAuth()
  const navigate = useNavigate()

  const OTP_LENGTH = 6

  // Initialize refs
  useEffect(() => {
    otpRefs.current = otpRefs.current.slice(0, OTP_LENGTH)
  }, [OTP_LENGTH])

  // Focus on single input when mode changes
  useEffect(() => {
    if (isSingleInput && singleInputRef.current) {
      singleInputRef.current.focus()
    }
  }, [isSingleInput])

  // Handle OTP input change for multi-input mode
  const handleChange = (index, value) => {
    // Allow alphanumeric characters (letters and numbers)
    if (!/^[a-zA-Z0-9]*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.toUpperCase() // Convert to uppercase for consistency
    setOtp(newOtp)
    setError("")
    setSuccess("")

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  // Handle single input change
  const handleSingleInputChange = (value) => {
    // Allow alphanumeric characters
    if (!/^[a-zA-Z0-9]*$/.test(value)) return

    // Limit to OTP_LENGTH characters
    if (value.length > OTP_LENGTH) {
      value = value.slice(0, OTP_LENGTH)
    }

    // Convert to array for display consistency
    const otpArray = value.split('')
    const paddedArray = [...otpArray, ...Array(OTP_LENGTH - otpArray.length).fill("")]

    setOtp(paddedArray)
    setError("")
    setSuccess("")
  }

  // Handle key events for navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault() // Prevent space in OTP
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    if (!/^[a-zA-Z0-9]+$/.test(pastedData)) {
      setError("Only letters and numbers are allowed")
      return
    }

    const pastedChars = pastedData.toUpperCase().split('').slice(0, OTP_LENGTH)
    const newOtp = [...otp]

    pastedChars.forEach((char, index) => {
      if (index < OTP_LENGTH) {
        newOtp[index] = char
      }
    })

    setOtp(newOtp)

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedChars.length - 1, OTP_LENGTH - 1)
    otpRefs.current[lastFilledIndex]?.focus()
  }

  // Get OTP as string
  const getOtpString = () => {
    if (isSingleInput) {
      return otp.filter(char => char !== "").join('')
    }
    return otp.join('')
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    const otpString = getOtpString()

    if (otpString.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} characters`)

      // Add highlight effect to empty inputs
      const inputs = document.querySelectorAll('.otp-input')
      inputs.forEach((input, index) => {
        if (!otp[index]) {
          input.classList.add('empty-highlight')
          setTimeout(() => {
            input.classList.remove('empty-highlight')
          }, 1000)
        }
      })
      return
    }

    // Validate alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(otpString)) {
      setError("OTP should contain only letters and numbers")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await verifyEmailAndOtp(otpString)
      setSuccess("OTP verified successfully!")

      // Confetti effect on success
      if (typeof window !== 'undefined') {
        createConfetti()
      }

      // Clear OTP after successful verification
      setTimeout(() => {
        setOtp(Array(OTP_LENGTH).fill(""))
      }, 1500)

    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.")

      // Shake animation effect on error
      const inputs = isSingleInput
        ? [singleInputRef.current]
        : document.querySelectorAll('.otp-input')

      inputs.forEach(input => {
        if (input) {
          input.classList.add('shake-animation')
          setTimeout(() => {
            input.classList.remove('shake-animation')
          }, 500)
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resend OTP function
  const handleResendOTP = async () => {
    try {
      setError("")
      setSuccess("")
      setOtp(Array(OTP_LENGTH).fill("")) // Clear current OTP

      // Add your resend OTP logic here
      // await resendOtp()

      setSuccess("New OTP sent to your email!")

      // Focus back on input
      if (isSingleInput && singleInputRef.current) {
        singleInputRef.current.focus()
      } else if (otpRefs.current[0]) {
        otpRefs.current[0].focus()
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
    }
  }

  // Create confetti effect
  const createConfetti = () => {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti'
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        top: -10px;
        left: ${Math.random() * 100}vw;
        animation: fall ${Math.random() * 3 + 2}s linear forwards;
        z-index: 9999;
      `
      document.body.appendChild(confetti)

      setTimeout(() => {
        confetti.remove()
      }, 3000)
    }
  }

  // Toggle input mode
  const toggleInputMode = () => {
    setIsSingleInput(!isSingleInput)
    setError("")
    setSuccess("")
  }

  // CSS for animations and styles
  const styles = `
    .shake-animation {
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    .empty-highlight {
      animation: highlight 1s ease;
      border-color: #EF4444 !important;
      background-color: #FEF2F2 !important;
    }

    @keyframes highlight {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .pulse-animation {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .slide-up-animation {
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .confetti-fall {
      animation: fall 3s linear forwards;
    }

    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(${Math.random() * 360}deg);
        opacity: 0;
      }
    }

    .character-highlight {
      background: linear-gradient(45deg, #3B82F6, #8B5CF6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `

  return (
    <>
      <style>{styles}</style>
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4 slide-up-animation">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h1>
            <p className="text-gray-600">
              Enter the <span className="font-semibold character-highlight">{OTP_LENGTH}-character code</span> sent to your email
              <span className="block text-sm text-blue-500 mt-1">
                (Letters and numbers mixed)
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Mode Toggle */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={toggleInputMode}
                className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors duration-300"
              >
                {isSingleInput ? 'Switch to Single Input' : 'Switch to Multiple Inputs'}
              </button>
            </div>

            {/* Single Input Mode */}
            {isSingleInput ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    ref={singleInputRef}
                    type={showPassword ? "text" : "password"}
                    value={getOtpString()}
                    onChange={(e) => handleSingleInputChange(e.target.value)}
                    maxLength={OTP_LENGTH}
                    placeholder={`Enter ${OTP_LENGTH} characters`}
                    className={`
                      w-full p-4 text-center text-xl font-mono font-bold
                      rounded-xl border-2 transition-all duration-300
                      focus:outline-none focus:ring-4 focus:ring-opacity-30
                      ${error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-300 bg-red-50'
                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-300'
                      }
                      ${success && 'border-green-300 bg-green-50'}
                      shadow-sm hover:shadow-md
                      tracking-widest
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {/* Character counter */}
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    Characters: <span className={`font-bold ${getOtpString().length === OTP_LENGTH ? 'text-green-600' : 'text-blue-600'}`}>
                      {getOtpString().length}/{OTP_LENGTH}
                    </span>
                  </div>
                  <div className="flex justify-center mt-2 space-x-1">
                    {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                      <div
                        key={index}
                        className={`
                          w-8 h-2 rounded-full transition-all duration-300
                          ${index < getOtpString().length
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                          }
                        `}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Multi-input Mode */
              <div className="space-y-4">
                <div className="flex justify-center space-x-3">
                  {otp.map((char, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="text"
                      maxLength="1"
                      value={char}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      onFocus={(e) => e.target.select()}
                      className={`
                        otp-input w-14 h-14 text-center text-2xl font-bold font-mono
                        rounded-xl border-2 transition-all duration-300
                        focus:outline-none focus:ring-4 focus:ring-opacity-30
                        ${error
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-300 bg-red-50'
                          : 'border-blue-200 focus:border-blue-500 focus:ring-blue-300'
                        }
                        ${success && 'border-green-300 bg-green-50'}
                        shadow-sm hover:shadow-md
                        ${char && 'character-highlight'}
                        uppercase
                      `}
                    />
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>Type or paste your {OTP_LENGTH}-character code</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center animate-pulse">
                <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {success && (
              <div className="text-center">
                <p className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-200">
                  ✅ {success}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full py-4 px-6 rounded-xl font-semibold text-white
                  transition-all duration-300 transform hover:scale-[1.02]
                  focus:outline-none focus:ring-4 focus:ring-opacity-40
                  ${isSubmitting
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }
                  shadow-lg hover:shadow-xl active:scale-[0.98]
                  ${!isSubmitting && 'pulse-animation'}
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>

              {/* <div className="text-center pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-300 hover:underline"
                >
                  Didn't receive code? Resend OTP
                </button>
                <p className="text-gray-500 text-xs mt-2">
                  OTP expires in 10 minutes
                </p>
              </div> */}
            </div>
          </form>

          {/* <div className="mt-8 text-center">
            <div className="mb-4">
              <p className="text-gray-600 text-sm font-medium mb-2">Example OTP formats:</p>
              <div className="flex justify-center space-x-4">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">A1B2C3</code>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">X9Y8Z7</code>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">M5N4P3</code>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Need help? <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Contact Support</a>
            </p>
          </div> */}
        </div>
      </div>
    </>
  )
}

export default OTPCompo
