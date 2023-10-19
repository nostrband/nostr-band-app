import Skeleton from "react-loading-skeleton";
import "./CardSkeleton.css";
import { useRef } from "react";

const CardSkeleton = ({ cards }: { cards: number }) => {
  const windowSize = useRef(window.innerWidth);

  return (
    <>
      {Array(cards)
        .fill(0)
        .map((item, index) => (
          <div className="card-skeleton" key={index}>
            <div className="card-skeleton-header">
              <div className="left-col">
                <Skeleton
                  baseColor="var(--body-skeleton-color)"
                  circle
                  width="5.3rem"
                  height="5.3rem"
                />
              </div>
              <div className="right-col">
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
          </div>
        ))}
    </>
  );
};

export default CardSkeleton;
