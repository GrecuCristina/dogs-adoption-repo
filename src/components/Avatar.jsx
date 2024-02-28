import React from "react";
import classnames from "classnames"
import { Image } from "react-bootstrap";

import noAvatar from "../assets/noavatar.png";

export default function Avatar(props) {
  return (
    <Image
      src={props.src || noAvatar}
      fluid
      roundedCircle
      style={{
        width: (props.size ?? 40) + 'px',
        height: (props.size ?? 40) + 'px',
        objectFit: "cover",
        objectPosition: "center",
      }}
      className={classnames("avatar", "border", "border-2", "border-primary", props.className)}
    />
  );
}
