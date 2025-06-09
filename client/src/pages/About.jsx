import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Avatar,
} from "@material-tailwind/react";

function About() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="text-center mb-12">
        <Typography variant="h2" color="blue-gray" className="mb-4">
          {t("about.title")}
        </Typography>
        <Typography variant="lead" className="max-w-3xl mx-auto">
          {t("about.welcome")}
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div>
          <Card className="h-full">
            <CardBody className="flex flex-col justify-between h-full">
              <div>
                <Typography variant="h4" color="blue-gray" className="mb-4">
                  {t("about.journey")}
                </Typography>
                <Typography className="mb-6 font-normal text-gray-700">
                  {t("about.journeyDesc")}
                </Typography>
                <Typography className="mb-6 font-normal text-gray-700">
                  Through this blog, I share my experiences, insights, and the lessons I've learned along the way. I believe in continuous learning and growth, and I hope my content inspires others on their own journeys.
                </Typography>
              </div>
              <div className="flex justify-start mt-4">
                <Button variant="text" color="blue" className="flex items-center gap-2">
                  Read My Blog
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                    />
                  </svg>
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="flex justify-center items-center">
          <Avatar
            src="https://ui-avatars.com/api/?name=Muhammed+Tarik+Ucar&size=256"
            alt="Muhammed Tarık Uçar"
            size="xxl"
            className="h-64 w-64 shadow-lg border-4 border-white"
          />
        </div>
      </div>

      <div className="mb-16">
        <Typography variant="h3" color="blue-gray" className="mb-6 text-center">
          What I Do
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-primary-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Web Development
              </Typography>
              <Typography className="font-normal text-gray-700">
                I build responsive, user-friendly websites and web applications using modern technologies and best practices.
              </Typography>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-primary-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                  />
                </svg>
              </div>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Content Creation
              </Typography>
              <Typography className="font-normal text-gray-700">
                I create engaging, informative content on technology, development, and personal growth.
              </Typography>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-primary-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Community Building
              </Typography>
              <Typography className="font-normal text-gray-700">
                I believe in the power of community and work to connect people with similar interests and goals.
              </Typography>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="text-center mb-12">
        <Typography variant="h3" color="blue-gray" className="mb-6">
          Get in Touch
        </Typography>
        <Typography className="max-w-3xl mx-auto mb-6 font-normal text-gray-700">
          I'm always open to new opportunities, collaborations, or just a friendly chat. Feel free to reach out to me through any of the channels below.
        </Typography>
        <div className="flex justify-center gap-4">
          <Button variant="text" color="blue" className="flex items-center gap-2">
            Contact Me
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default About;
