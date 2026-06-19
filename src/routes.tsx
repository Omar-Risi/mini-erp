import React from "react";
import App from "./App";

type Route = {
  path?: string,
  element: React.ReactNode,
  index?: boolean,
};

export const routes: Route[] = [
  {
    path: '/',
    element: <App />,
    index: true
  }
];
