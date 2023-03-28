import { register } from "../../redux/Auth/AuthActions";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useEffect } from "react";

export default function Register() {
  const dispatch = useDispatch();

  const auth = useSelector((store) => store.auth);
  const profileNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const formSubmitHandler = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const name = profileNameRef.current.value;
    if (!password.trim() || !email.trim() || !name.trim()) return;
    dispatch(
      register({
        name,
        email,
        password,
      })
    );
    emailRef.current.value = "";
    passwordRef.current.value = "";
    profileNameRef.current.value = "";
  };

  /*   useEffect(() => {
    const password = passwordRef.current.value;
    // Password strength criteria (you can customize these as needed)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 6;

    if (
      !(
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSymbols &&
        isLongEnough
      )
    ) {
      // Password does not meet criteria, show error message
      alert(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long."
      );
      return;
    }
  }, [passwordRef.current.value]);
 */
  return (
    <div className="px-4 w-full h-screen flex justify-center items-center bg-login bg-no-repeat bg-cover">
      <form
        onSubmit={formSubmitHandler}
        action=""
        className="border-2 rounded-md drop-shadow-2xl bg-white p-6 flex flex-col items-center w-full min-w-[17rem] sm:min-w-[22rem] md:min-w-[35rem] max-w-[25rem]"
      >
        <div className="grid gap-4 md:grid-cols-1 mb-4 w-full">
          <input
            className="block p-2 border-2 rounded focus:outline-none"
            type="text"
            placeholder="First Name"
            ref={profileNameRef}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-4 w-full">
          <input
            className="block p-2 border-2 rounded focus:outline-none"
            type="email"
            placeholder="Email"
            ref={emailRef}
          />

          <input
            className="block p-2 border-2 rounded focus:outline-none"
            type="password"
            placeholder="Password"
            ref={passwordRef}
          />
        </div>

        <div className="flex drop-shadow-lg items-center justify-center hover:text-transparent  hover:bg-clip-text bg-clip-padding bg-gradient-to-r from-purple-400 to-pink-600 w-fit rounded-md  text-white  px-4 py-2 ease-in-out duration-300">
            <button>register</button>
          </div>
        {auth.error == true ? (
          <p>Something went wrong. Please try later...</p>
        ) : (
          <></>
        )}
      </form>
    </div>
  );
}
