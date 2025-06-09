import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSymbols: false,
    isLongEnough: false
  });

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const strength = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      isLongEnough: password.length >= 8
    };
    setPasswordStrength(strength);
    return strength;
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = t("auth.usernameRequired") || "Kullanıcı adı gerekli";
    } else if (username.length < 3) {
      newErrors.username = "Kullanıcı adı en az 3 karakter olmalı";
    }

    if (!email.trim()) {
      newErrors.email = t("auth.emailRequired") || "E-posta gerekli";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.emailInvalid") || "Geçersiz e-posta adresi";
    }

    if (!password.trim()) {
      newErrors.password = t("auth.passwordRequired") || "Şifre gerekli";
    } else {
      const strength = checkPasswordStrength(password);
      const strengthErrors = [];

      if (!strength.isLongEnough) strengthErrors.push("En az 8 karakter");
      if (!strength.hasUpperCase) strengthErrors.push("Büyük harf");
      if (!strength.hasLowerCase) strengthErrors.push("Küçük harf");
      if (!strength.hasNumbers) strengthErrors.push("Rakam");
      if (!strength.hasSymbols) strengthErrors.push("Özel karakter");

      if (strengthErrors.length > 0) {
        newErrors.password = `Şifre şunları içermeli: ${strengthErrors.join(", ")}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerUser = async ({ email, password, username }) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/auth/register", {
        email,
        password,
        username,
      });

      return response.data;
    } catch (error) {
      console.error("Registration failed", error);

      // Handle specific validation errors from server
      if (error.response?.data?.details) {
        const serverErrors = {};
        const details = error.response.data.details;

        // Handle MongoDB validation errors
        if (details.schemaRulesNotSatisfied) {
          details.schemaRulesNotSatisfied.forEach(rule => {
            if (rule.propertiesNotSatisfied) {
              rule.propertiesNotSatisfied.forEach(prop => {
                const fieldName = prop.propertyName;
                const description = prop.description;

                if (fieldName === 'name') {
                  serverErrors.username = description || 'İsim alanı gerekli';
                } else if (fieldName === 'email') {
                  serverErrors.email = description || 'Geçerli bir e-posta adresi gerekli';
                } else if (fieldName === 'password') {
                  serverErrors.password = description || 'Şifre en az 6 karakter olmalı';
                } else if (fieldName === 'role') {
                  // Role error - this shouldn't happen in normal registration
                  console.warn('Role validation error:', prop);
                }
              });
            }
          });
        }

        // Handle array-based details (legacy format)
        if (Array.isArray(details)) {
          details.forEach(detail => {
            if (detail.includes('email')) {
              serverErrors.email = detail;
            } else if (detail.includes('password')) {
              serverErrors.password = detail;
            } else if (detail.includes('name') || detail.includes('username')) {
              serverErrors.username = detail;
            }
          });
        }

        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
        }
      }

      // Handle duplicate email error
      if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
        setErrors({ email: 'Bu e-posta adresi zaten kullanılıyor' });
      }

      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const mutation = useMutation(registerUser, {
    onSuccess: () => {
      toast.success(t("auth.registerSuccess"));
      navigate("/login");
      // Clear form
      setEmail("");
      setPassword("");
      setUsername("");
      setErrors({});
    },
    onError: (error) => {
      const errorMessage = error.message || t("auth.registerError");
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate({ email, password, username });
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      checkPasswordStrength(newPassword);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            {t("auth.register")}
          </motion.h2>
          <p className="text-gray-600">
            Yeni hesap oluşturun
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow-xl rounded-2xl p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              {t("auth.username")}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="kullaniciadi"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex space-x-1">
                  {Object.values(passwordStrength).map((isValid, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded ${
                        isValid ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`flex items-center ${passwordStrength.isLongEnough ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.isLongEnough ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : <XCircleIcon className="h-3 w-3 mr-1" />}
                    8+ karakter
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasUpperCase ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : <XCircleIcon className="h-3 w-3 mr-1" />}
                    Büyük harf
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasLowerCase ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : <XCircleIcon className="h-3 w-3 mr-1" />}
                    Küçük harf
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasNumbers ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : <XCircleIcon className="h-3 w-3 mr-1" />}
                    Rakam
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasSymbols ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasSymbols ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : <XCircleIcon className="h-3 w-3 mr-1" />}
                    Özel karakter
                  </div>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t("common.loading")}
              </div>
            ) : (
              t("auth.register")
            )}
          </button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              {t("auth.hasAccount")}{" "}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
              >
                {t("auth.login")}
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
