import classNames from "classnames";
import { FC } from "react";
import { createPortal } from "react-dom";

import "./Loading.scss";

interface ILoadingProps {
  loading?: boolean;
}

const Loading: FC<ILoadingProps> = (props) => {
  return createPortal(
    <div
      className={classNames({
        "dochub-component-loading": true,
        "dochub-component-loading--show": props.loading,
      })}
    >
      <div className="dochub-component-loading__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="deepskyblue"
        >
          <path
            opacity=".25"
            d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"
          />
          <path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 16 16"
              to="360 16 16"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>,
    document.body
  );
};

export default Loading;
