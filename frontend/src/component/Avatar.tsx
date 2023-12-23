import React from "react";

type Props = {
  name: string;
};

export default function Avatar({ name }: Props) {
  /**
   * Sign the user out of the app.
   *
   * After receiving a successful response from the server, reload the page
   * to navigate to the unauth page.
   */
  const onClick = async () => {
    const response = await fetch("/auth/signout", {
      method: "POST",
    });
    if (response.status === 200) {
      window.location.replace("/");
    }
  };

  return (
    <div className="avatar" onClick={onClick}>
      {name[0].toUpperCase()}
    </div>
  );
}
