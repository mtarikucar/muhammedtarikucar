import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { NavLink } from "react-router-dom";

export function CardDefault({ post }) {
  const date = new Date(post.updatedAt);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  const renderMaterial = () => {
    if (post.materials && post.materials.length > 0) {
      const firstMaterial = post.materials[0];

      if (firstMaterial.type === "image") {
        return (
          <img
            src={firstMaterial.url}
            alt="material"
            className="w-full h-full object-cover rounded-lg"
          />
        );
      } else if (firstMaterial.type === "video") {
        return (
          <video controls className="w-full h-full object-cover rounded-lg">
            <source src={firstMaterial.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      }
    }

    if (post.sound) {
      return (
        <audio controls className="w-full">
          <source src={post.sound} type="audio/mp3" />
          Your browser does not support the audio tag.
        </audio>
      );
    }

    return null;
  };

  const styles = {
    card: {
      margin: "15px 10px",
      padding: 0,
      borderRadius: "16px",
    },
    
  };

  const calculateDynamicHeight = (titleLength, contentLength) => {
    const baseValue = 40; // temel değer
    contentLength =
      contentLength > 200 ? 200 : contentLength < 15 ? 15 : contentLength;
    titleLength = titleLength > 200 ? 200 : titleLength < 35 ? 35 : titleLength;
    const additionalValue = (contentLength / 14) + (titleLength / 10);

    return baseValue + parseInt(additionalValue);
  };

  const dynamicHeightStyle = {
    gridRowEnd: `span ${calculateDynamicHeight(
      post.title.length,
      post.content.length
    )}`,
  };

  console.log(post.title.length, post.content.length);
  return (
    <div
      style={{
        ...styles.card,
        ...dynamicHeightStyle,
      }}
    >
      <Card className="h-full hover:-translate-y-2 group ease-in-out duration-300 hover:drop-shadow-xl border-dashed border-2 border-gray-300 p-1">
        <div className="absolute  inset-0 bg-gradient-to-t from-white via-white to-transparent z-20 group-hover:via-60% ease-in-out duration-300 rounded-md"></div>
        <CardBody className="flex-grow relative h-fit">
          <div className="absolute  inset-0 z-10 rounded-md">
            {renderMaterial()}
          </div>

          <Typography
            variant="h5"
            color="blue-gray"
            className="mb-2 z-30 relative mt-32"
          >
            <NavLink to={`/Post/${post._id}`}>{post.title}</NavLink>
          </Typography>

          <Typography className="z-30 relative">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  post &&
                  post.content.substring(0, 200) +
                    (post && post.content.length > 200 ? "..." : ""),
              }}
            ></div>
          </Typography>
        </CardBody>
        <CardFooter className="flex justify-between items-center z-20">
          <NavLink to={`/Post/${post._id}`}>
            <Button>incele</Button>
          </NavLink>
          <span className="flex flex-col items-center">
           {/*  <CustomRatingIcon /> */}
            <p className="text-xs font-medium flex flex-row justify-end my-1">
              {formattedDate}
            </p>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
