import { useRef } from "react";
import cl from "./NoteSkeleton.module.css";
import Skeleton from "react-loading-skeleton";

const NoteSkeleton = () => {
  const windowSize = useRef(window.innerWidth);

  return (
    <div className={cl.profileSkeleton}>
      <div className={cl.cardSkeletonHeader}>
        <div className={cl.leftCol}>
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            circle
            width="2.5rem"
            height="2.5rem"
          />
        </div>
        <div className={cl.rightCol}>
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width={windowSize.current <= 1000 ? "50%" : "30%"}
            style={{ marginBottom: "5px" }}
          />
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width={windowSize.current <= 1000 ? "55%" : "35%"}
            style={{ marginBottom: "5px" }}
          />
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width={windowSize.current <= 1000 ? "60%" : "40%"}
            style={{ marginBottom: "5px" }}
          />
        </div>
      </div>
      <div>
        <Skeleton
          baseColor="var(--body-skeleton-color)"
          width="100%"
          style={{ marginBottom: "5px" }}
          count={3}
        />
      </div>
      <div className={cl.btns}>
        <div className={cl.btn}>
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width="100%"
            height="100%"
          />
        </div>
        <div className={cl.btn}>
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width="100%"
            height="100%"
          />
        </div>
        <div className={cl.btn}>
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width="100%"
            height="100%"
          />
        </div>
        <div className={cl.btn}>
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width="100%"
            height="100%"
          />
        </div>
        <div className={cl.btn}>
          <Skeleton
            baseColor="var(--body-skeleton-color)"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default NoteSkeleton;
