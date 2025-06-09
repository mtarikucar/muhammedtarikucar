import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import { loginSuccess } from "../store/AuthSlice";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function Login() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // State variables for email and password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = t("auth.emailRequired");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t("auth.emailInvalid");
        }

        if (!password.trim()) {
            newErrors.password = t("auth.passwordRequired");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const loginMutation = useMutation(
        async (loginData) => {
            try {
                setIsLoading(true);
                const response = await axios.post("/auth/login", loginData);
                return response.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "Login failed";
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        {
            onSuccess: (data) => {
                dispatch(loginSuccess(data));
                toast.success(t("auth.loginSuccess"));
                navigate("/");
                // Clear form
                setEmail("");
                setPassword("");
                setErrors({});
            },
            onError: (error) => {
                const errorMessage = error.message || t("auth.loginError");
                toast.error(errorMessage);
            },
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            loginMutation.mutate({ email, password });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
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
                        {t("auth.login")}
                    </motion.h2>
                    <p className="text-gray-600">
                        Hesabınıza giriş yapın
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                {t("common.loading")}
                            </div>
                        ) : (
                            t("auth.login")
                        )}
                    </button>

                    {/* Register Link */}
                    <div className="text-center pt-4">
                        <p className="text-gray-600">
                            {t("auth.noAccount")}{" "}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                            >
                                {t("auth.register")}
                            </Link>
                        </p>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
}
