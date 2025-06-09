import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const goBack = () => navigate(-1);
    const goHome = () => navigate("/");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center px-4"
        >
            <Card className="w-full max-w-md">
                <CardBody className="text-center">
                    <div className="text-6xl font-bold text-blue-500 mb-4">404</div>
                    <ExclamationTriangleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <Typography variant="h4" color="blue-gray" className="mb-2">
                        Page Not Found
                    </Typography>
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                        Oops! The page you're looking for doesn't exist.
                    </Typography>
                    <Typography color="gray" className="mb-6">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </Typography>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outlined" onClick={goBack}>
                            {t("common.back")}
                        </Button>
                        <Button color="blue" onClick={goHome}>
                            {t("nav.home")}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
};

export default NotFound;
