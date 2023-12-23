import React from "react";

type Props = {
  name: string;
};

export default function Avatar({ name }: Props) {
  const onClick = () => {
    console.log("logout");
  };

  return (
    <div className="avatar" onClick={onClick}>
      {name[0].toUpperCase()}
    </div>
  );
}
