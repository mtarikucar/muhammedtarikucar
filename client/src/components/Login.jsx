import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {useMutation} from "@tanstack/react-query";
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

import {Register} from "./Register";
import {loginSuccess} from "../store/AuthSlice";
import {toast} from "react-toastify";

export function Login() {
    const dispatch = useDispatch();
    const [open, setOpen] = React.useState(false);

    // State variables for email and password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleOpen = () => setOpen((cur) => !cur);

    const loginMutation = useMutation(
        async (loginData) => {
            const response = await axios.post("/auth/login", loginData);
            return response.data;
        },
        {
            onSuccess: (data) => {
                console.log(data);
                dispatch(loginSuccess(data));
                toast.success("giriş yaptın");
                handleOpen(); // Close the dialog on successful login
            },
            onError: () => {
                toast.error("giriş yapılamadı")
            },
        }
    );

    return (
        <div className={"flex justify-center items-center h-screen"}>


            <Card className="mx-auto w-full max-w-[24rem]">
                <CardHeader
                    variant="gradient"
                    color="blue"
                    className="mb-4 grid h-28 place-items-center"
                >
                    <Typography variant="h3" color="white">
                        Giriş Yap
                    </Typography>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                    {/* Use value and onChange to manage input state */}
                    <Input
                        label="Email"
                        size="lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label="Password"
                        size="lg"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="-ml-2.5">
                        <Checkbox label="Remember Me"/>
                    </div>
                </CardBody>
                <CardFooter className="pt-0">
                    <Button
                        variant="gradient"
                        className="hover:-translate-y-2"
                        onClick={async () => {
                            loginMutation.mutate({email, password});
                        }}
                        fullWidth
                    >
                        giriş yap
                    </Button>
                    <Typography variant="small" className="mt-6 flex justify-center">
                        hesabın yok mu?
                    </Typography>
                    <div className="w-full">
                        <Register/>
                    </div>
                </CardFooter>
            </Card>

        </div>
    );
}
