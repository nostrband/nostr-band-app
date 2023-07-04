import { useParams } from "react-router-dom";
import cl from "./Profile.module.css";

const Profile = () => {
  const { npub } = useParams();
  console.log(npub);

  return <div>Profile</div>;
};

export default Profile;
