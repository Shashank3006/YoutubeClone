import React, { useState, useRef } from 'react';
// Import React with useState for state handling and useRef for timeout reference

import { useNavigate } from 'react-router-dom';
// useNavigate allows programmatic navigation after registration

import axios from 'axios';
// axios is used for making HTTP requests to the backend
// Register page component
function Register() {
  const navigate = useNavigate(); // Hook for navigation
  const otpTimerRef = useRef(null); // Ref to hold OTP expiry timer (so we can clear it later)

  // Form state to hold input values
  const [form, setForm] = useState({
    username: '',
    email: '',
    avatar: '',
    password: '',
  });

  // States for OTP logic and form submission
  const [otpSent, setOtpSent] = useState(false);         // Whether OTP has been sent
  const [generatedOtp, setGeneratedOtp] = useState('');   // Stores generated OTP
  const [enteredOtp, setEnteredOtp] = useState('');       // User-entered OTP
  const [otpTimestamp, setOtpTimestamp] = useState(null); // Timestamp when OTP was generated
  const [submitting, setSubmitting] = useState(false);    // Whether form is submitting

  // Handle change in input fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Function to generate OTP
  const handleGenerateOtp = () => {
    const { username, email, password } = form;

    // Validate required fields
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in all required fields before generating OTP.');
      return;
    }

    // Prevent regenerating OTP until timeout
    if (otpSent) return;

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and timestamp
    setGeneratedOtp(otp);
    setOtpTimestamp(Date.now());
    setOtpSent(true);

    // Alert user (simulating sending OTP via email)
    alert(`📧 Your OTP is: ${otp} (valid for 2 minutes)`);

    // Set timeout to invalidate OTP after 2 minutes
    otpTimerRef.current = setTimeout(() => {
      setGeneratedOtp('');
      setOtpSent(false);
      setEnteredOtp('');
      setOtpTimestamp(null);
      alert('⌛ OTP expired. Please generate a new one.');
    }, 2 * 60 * 1000);
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure OTP was generated
    if (!otpSent) {
      alert('Please generate OTP first.');
      return;
    }

    // Check if OTP has expired
    const now = Date.now();
    if (!otpTimestamp || now - otpTimestamp > 2 * 60 * 1000) {
      alert('⏳ OTP expired. Please generate a new one.');
      setOtpSent(false);
      setGeneratedOtp('');
      setEnteredOtp('');
      setOtpTimestamp(null);
      return;
    }

    // Validate OTP match
    if (enteredOtp.length !== 6 || enteredOtp !== generatedOtp) {
      alert('❌ Incorrect OTP. Please enter the 6-digit OTP correctly.');
      return;
    }

    // Clean input values
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    let avatar = form.avatar.trim();

    // If avatar is not provided, generate one using initial
    if (!avatar) {
      const initial = username.charAt(0).toUpperCase();
      avatar = `https://placehold.co/40x40.png?text=${initial}`;
    }

    try {
      setSubmitting(true); // Disable form while submitting

      // Send POST request to register the user
      await axios.post('http://localhost:5050/api/user/register', {
        username,
        email,
        avatar,
        password,
      });

      alert('✅ Registration successful! Please login.');

      // Clear OTP timer
      clearTimeout(otpTimerRef.current);
      otpTimerRef.current = null;

      // Redirect to login page
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      alert('Registration failed: ' + (err.response?.data?.message || 'Something went wrong.'));
    } finally {
      setSubmitting(false); // Re-enable form
    }
  };

  // JSX to render registration form
   return  (
    <div className="flex items-center justify-center p-10 m-10">
      <div className="mx-auto w-full max-w-[550px] bg-white rounded-lg shadow-md px-[20px] space-y-6">
        <h1 className="text-2xl font-bold text-center text-[#07074D] mb-8">Create Your Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 px-16 ">
          {['username', 'email', 'avatar', 'password'].map((field) => (
            <div key={field} className='m-16'>
              <label
                htmlFor={field}
                className="mb-2 block text-base font-medium text-[#07074D]"
              >
                {field === 'avatar' ? 'Avatar URL (optional)' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                name={field}
                id={field}
                value={form[field]}
                onChange={handleChange}
                required={field !== 'avatar'}
                placeholder={
                  field === 'avatar' ? 'https://example.com/avatar.png' : 
                  field === 'email' ? 'example@domain.com' : 
                  `Enter your ${field}`
                }
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-4 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md h-14"
              />
            </div>
          ))}

          {otpSent && (
            <div className="pt-2"> {/* Added padding-top for extra space before OTP field */}
              <label
                htmlFor="otp"
                className="mb-2 block text-base font-medium text-[#07074D]"
              >
                OTP Verification
              </label>
              <input
                type="text"
                name="otp"
                id="otp"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-4 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md h-14"
              />
              <p className="text-sm text-gray-500 mt-2">Check your email for the OTP code</p>
            </div>
          )}

          <div className="flex flex-col space-y-5 pt-2"> {/* Increased space between buttons */}
            {!otpSent ? (
              <button
                type="button"
                onClick={handleGenerateOtp}
                className="hover:shadow-form rounded-md bg-[#6A64F1] py-4 px-8 text-base font-semibold text-white outline-none h-14"
              >
                Get OTP
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className={`hover:shadow-form rounded-md ${
                  submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#6A64F1] hover:bg-[#5A54E1]'
                } py-4 px-8 text-base font-semibold text-white outline-none transition-colors h-14`}
              >
                {submitting ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>

        <p className="text-sm text-center text-[#6B7280] mt-8"> {/* Increased top margin */}
          Already have an account?{' '}
          <a href="/login" className="text-[#6A64F1] font-medium hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
// Export the Register component to be used in routing
