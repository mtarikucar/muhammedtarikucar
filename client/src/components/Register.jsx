import React from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../api/axios";

import {
  Button,
  Dialog,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Checkbox,
} from "@material-tailwind/react";

import { toast } from "react-toastify";

export function Register() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen((cur) => !cur);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");

  const registerUser = async ({ email, password, username }) => {
    try {
      const response = await axios.post("/auth/register", {
        email,
        password,
        username,
      });

      // Handle the response as needed
      console.log(response.data);

      return response.data; // You might want to return some data from the response
    } catch (error) {
      // Handle errors
      console.error("Registration failed", error);
      throw new Error("Registration failed");
    }
  };

  const mutation = useMutation(registerUser, {
    onSuccess: () => {
      toast.success("kaydınız yapıldı");
      setOpen(false);
    },
    onError: () => {
      toast.error("kayıt yapılırken hata oldu");
    },
  });



  return (
    <>
      <Button className="w-full hover:opacity-80" onClick={handleOpen}>
        Kaydol
      </Button>
      <Dialog
        size="xs"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[24rem]">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Kaydol
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input
              label="Username"
              size="lg"
              value={username}
              type="text"
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              label="Email"
              size="lg"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              size="lg"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* <div className="-ml-2.5">
              <Checkbox label="Remember Me" />
            </div> */}
          </CardBody>
          <CardFooter className="pt-0">
            <Button
              variant="gradient"
              onClick={async () => {await mutation.mutateAsync({ email, password, username })}}
              fullWidth
            >
              Kaydol
            </Button>
            <Typography variant="small" className="mt-6 flex justify-center">
              <Typography
                as="a"
                href="#signup"
                variant="small"
                color="blue"
                className="ml-1 font-bold"
                onClick={handleOpen}
              >
                zaten hesabı var mı?
              </Typography>
            </Typography>
          </CardFooter>
        </Card>
      </Dialog>
    </>
  );
}
